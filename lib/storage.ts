import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import type { Application } from "./types";

const DATA_KEY = "jb:applications:data"; // hash id -> JSON
const INDEX_KEY = "jb:applications:index"; // sorted set (score = timestamp)

/**
 * Descobre as credenciais REST do Upstash. Ordem:
 * 1. KV_REST_API_URL / KV_REST_API_TOKEN (integração Upstash do Vercel Marketplace)
 * 2. UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (nomes padrão do Upstash)
 * 3. Qualquer par com prefixo personalizado, ex.: STORAGE_KV_REST_API_URL / STORAGE_KV_REST_API_TOKEN
 *    (a Vercel permite definir um prefixo ao conectar o banco ao projeto).
 * O token somente-leitura (KV_REST_API_READ_ONLY_TOKEN) nunca é usado, porque precisamos gravar.
 */
function redisConfig(): { url: string; token: string } | null {
  const env = process.env;
  const pairs: [string, string][] = [
    ["KV_REST_API_URL", "KV_REST_API_TOKEN"],
    ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
  ];
  for (const [u, t] of pairs) {
    if (env[u] && env[t]) return { url: env[u]!, token: env[t]! };
  }
  // Fallback: variáveis com prefixo (mesmo prefixo para URL e token)
  for (const [uSuffix, tSuffix] of pairs) {
    for (const key of Object.keys(env).sort()) {
      if (key === uSuffix || !key.endsWith(uSuffix) || !env[key]) continue;
      const prefix = key.slice(0, -uSuffix.length);
      const token = env[prefix + tSuffix];
      if (token) return { url: env[key]!, token };
    }
  }
  return null;
}

let redis: Redis | null = null;
function getRedis(): Redis | null {
  const cfg = redisConfig();
  if (!cfg) return null;
  if (!redis) redis = new Redis(cfg);
  return redis;
}

export function storageMode(): "upstash" | "arquivo-local" {
  return redisConfig() ? "upstash" : "arquivo-local";
}

// ---------- Keep-alive (cron diário) ----------
const KEEPALIVE_KEY = "jb:keepalive";

/**
 * Gravação + leitura bem baratas para manter o banco Upstash "ativo"
 * (o plano gratuito arquiva bancos sem uso por 30 dias).
 */
export async function keepAlive(): Promise<{ storage: ReturnType<typeof storageMode>; at: string; readBack: string | null }> {
  const at = new Date().toISOString();
  const r = getRedis();
  if (r) {
    await r.set(KEEPALIVE_KEY, at);
    const readBack = await r.get<string>(KEEPALIVE_KEY);
    return { storage: "upstash", at, readBack: readBack ?? null };
  }
  return { storage: "arquivo-local", at, readBack: null };
}

// ---------- Fallback local (arquivo JSON) ----------
// Em produção na Vercel o sistema de arquivos é somente leitura (exceto /tmp, que é efêmero).
// Por isso o fallback serve apenas para desenvolvimento local: configure o Upstash em produção.
const FILE =
  process.env.LOCAL_DATA_FILE ||
  (process.env.VERCEL ? "/tmp/jb-applications.json" : path.join(process.cwd(), ".data", "applications.json"));

async function readFile(): Promise<Application[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeFile(list: Application[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(list, null, 2), "utf8");
  await fs.rename(tmp, FILE);
}

let fileQueue: Promise<unknown> = Promise.resolve();
function withFileLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = fileQueue.then(fn, fn);
  fileQueue = run.catch(() => undefined);
  return run;
}

// ---------- API pública ----------
export async function saveApplication(app: Application): Promise<void> {
  const r = getRedis();
  if (r) {
    const ts = new Date(app.createdAt).getTime();
    const p = r.pipeline();
    p.hset(DATA_KEY, { [app.id]: JSON.stringify(app) });
    p.zadd(INDEX_KEY, { score: ts, member: app.id });
    await p.exec();
    return;
  }
  if (process.env.VERCEL) {
    console.warn("[storage] Upstash não configurado: usando /tmp (dados podem ser perdidos). Conecte o Upstash Redis no Vercel Storage.");
  }
  await withFileLock(async () => {
    const list = await readFile();
    list.push(app);
    await writeFile(list);
  });
}

export async function listApplications(): Promise<Application[]> {
  const r = getRedis();
  if (r) {
    const ids = await r.zrange<string[]>(INDEX_KEY, 0, -1, { rev: true });
    if (!ids.length) return [];
    const out: Application[] = [];
    // busca em lotes para não estourar o tamanho da requisição
    for (let i = 0; i < ids.length; i += 500) {
      const chunk = ids.slice(i, i + 500);
      const values = await r.hmget<Record<string, unknown>>(DATA_KEY, ...chunk);
      for (const id of chunk) {
        const v = values?.[id];
        if (!v) continue;
        out.push((typeof v === "string" ? JSON.parse(v) : v) as Application);
      }
    }
    return out;
  }
  const list = await readFile();
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteApplication(id: string): Promise<boolean> {
  const r = getRedis();
  if (r) {
    const p = r.pipeline();
    p.hdel(DATA_KEY, id);
    p.zrem(INDEX_KEY, id);
    const [removed] = (await p.exec()) as number[];
    return removed > 0;
  }
  return withFileLock(async () => {
    const list = await readFile();
    const next = list.filter((a) => a.id !== id);
    if (next.length === list.length) return false;
    await writeFile(next);
    return true;
  });
}
