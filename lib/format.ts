import type { Application } from "./types";

const fmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function formatDateSP(iso: string): string {
  try {
    return fmt.format(new Date(iso)).replace(",", "");
  } catch {
    return iso;
  }
}

function csvCell(v: string | undefined): string {
  let s = (v ?? "").replace(/\r?\n/g, " ");
  // evita injeção de fórmulas no Excel/Sheets
  if (/^[=+\-@\t]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function toCSV(list: Application[]): string {
  const header = ["Data/hora (Brasília)", "Nome", "Email", "Whatsapp", "Faturamento mensal atual", "UTM", "Página", "ID"];
  const rows = list.map((a) =>
    [formatDateSP(a.createdAt), a.nome, a.email, a.whatsapp, a.faturamento, a.utm, a.pagina, a.id].map(csvCell).join(";")
  );
  return "\uFEFF" + [header.map(csvCell).join(";"), ...rows].join("\r\n");
}
