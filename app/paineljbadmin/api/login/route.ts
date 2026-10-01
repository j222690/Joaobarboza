import { NextResponse } from "next/server";
import { authConfigError, checkPassword, createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const cfgError = authConfigError();
  if (cfgError) return NextResponse.json({ ok: false, error: cfgError }, { status: 500 });

  let password = "";
  try {
    const body = await req.json();
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    /* corpo inválido */
  }

  if (!password || !checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 800)); // dificulta força bruta
    return NextResponse.json({ ok: false, error: "Senha incorreta." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions);
  return res;
}
