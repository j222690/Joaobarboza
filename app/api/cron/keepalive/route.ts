import { NextResponse } from "next/server";
import crypto from "crypto";
import { keepAlive } from "@/lib/storage";

// Chamado 1x por dia pelo Vercel Cron (ver vercel.json) para o Upstash gratuito não ser arquivado por inatividade.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStore = { "Cache-Control": "no-store, max-age=0" };

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // sem CRON_SECRET a rota fica aberta (só faz um SET/GET inofensivo)
  const got = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const a = crypto.createHash("sha256").update(got).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401, headers: noStore });
  }
  try {
    const { storage, at, readBack } = await keepAlive();
    const ok = storage === "upstash" ? readBack === at : true;
    if (storage !== "upstash") console.warn("[keepalive] Upstash não configurado – nada a manter ativo.");
    else console.log(`[keepalive] ok ${at}`);
    return NextResponse.json({ ok, storage, at }, { status: ok ? 200 : 500, headers: noStore });
  } catch (err) {
    console.error("[keepalive] falhou:", err);
    return NextResponse.json({ ok: false, error: "Falha ao acessar o Upstash." }, { status: 500, headers: noStore });
  }
}
