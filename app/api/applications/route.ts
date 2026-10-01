import { NextResponse } from "next/server";
import crypto from "crypto";
import { saveApplication } from "@/lib/storage";
import { validateApplication } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) body = await req.json();
    else body = Object.fromEntries((await req.formData()).entries());
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  // Honeypot: campo invisível que humanos não preenchem.
  const honeypot = typeof body.website === "string" ? body.website.trim() : "";
  // Envio rápido demais (< 2s após carregar o formulário) = provável bot.
  const startedAt = Number(body.t);
  const tooFast = Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < 2000;
  if (honeypot || tooFast) {
    return NextResponse.json({ ok: true }); // resposta "falsa" para não dar pistas ao bot
  }

  const result = validateApplication(body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: "Verifique os campos destacados.", errors: result.errors }, { status: 422 });
  }

  const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  try {
    await saveApplication({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...result.data,
      utm: s(body.utm, 300) || undefined,
      pagina: s(body.pagina, 300) || undefined,
    });
  } catch (err) {
    console.error("[applications] erro ao salvar", err);
    return NextResponse.json({ ok: false, error: "Não foi possível enviar agora. Tente novamente em instantes." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
