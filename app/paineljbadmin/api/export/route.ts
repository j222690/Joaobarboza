import { isAuthenticated } from "@/lib/auth";
import { listApplications } from "@/lib/storage";
import { toCSV } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) return new Response("Não autorizado.", { status: 401 });
  const csv = toCSV(await listApplications());
  const stamp = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(new Date());
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="aplicacoes-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
