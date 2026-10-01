import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";

/** Rota do painel (não é linkada em lugar nenhum da landing). */
export const ADMIN_BASE = "/paineljbadmin";
export const SESSION_COOKIE = "jb_painel_session";
/** Sessão longa (180 dias), renovada a cada visita ao painel. */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 180;


function getSecret(): string | null {
  const s = process.env.ADMIN_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV !== "production" && process.env.ADMIN_PASSWORD) {
    // Apenas em desenvolvimento: deriva um segredo da senha.
    return crypto.createHash("sha256").update(`dev:${process.env.ADMIN_PASSWORD}`).digest("hex");
  }
  return null;
}

export function authConfigError(): string | null {
  if (!process.env.ADMIN_PASSWORD) return "A variável ADMIN_PASSWORD não está configurada.";
  if (!getSecret()) return "A variável ADMIN_SECRET não está configurada (mínimo 16 caracteres).";
  return null;
}

function sign(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(input, expected);
}

export function createSessionToken(): string {
  const secret = getSecret();
  if (!secret) throw new Error("ADMIN_SECRET ausente");
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const nonce = crypto.randomBytes(12).toString("base64url");
  // a senha entra na assinatura: trocar ADMIN_PASSWORD invalida todas as sessões
  const payload = `v1.${exp}.${nonce}`;
  return `${payload}.${sign(payload + (process.env.ADMIN_PASSWORD ?? ""), secret)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return false;
  const [v, exp, nonce, sig] = parts;
  const payload = `${v}.${exp}.${nonce}`;
  if (!safeEqual(sig, sign(payload + (process.env.ADMIN_PASSWORD ?? ""), secret))) return false;
  const expN = Number(exp);
  return Number.isFinite(expN) && expN > Math.floor(Date.now() / 1000);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  // Lax: mantém a sessão quando o painel é aberto como app instalado (PWA) ou por um link.
  sameSite: "lax" as const,
  path: ADMIN_BASE,
  maxAge: SESSION_MAX_AGE,
};
