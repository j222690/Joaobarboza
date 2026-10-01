import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { deleteApplication, listApplications } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const unauthorized = () => NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });

export async function GET() {
  if (!(await isAuthenticated())) return unauthorized();
  return NextResponse.json({ ok: true, items: await listApplications() });
}

export async function DELETE(req: Request) {
  if (!(await isAuthenticated())) return unauthorized();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "id ausente" }, { status: 400 });
  const removed = await deleteApplication(id);
  return NextResponse.json({ ok: removed }, { status: removed ? 200 : 404 });
}
