export type ApplicationInput = { nome: string; email: string; whatsapp: string; faturamento: string };

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max) : "";

export function validateApplication(body: Record<string, unknown>):
  | { ok: true; data: ApplicationInput }
  | { ok: false; errors: Partial<Record<keyof ApplicationInput, string>> } {
  const nome = clean(body.nome, 120).replace(/\s+/g, " ");
  const email = clean(body.email, 160).toLowerCase();
  const whatsapp = clean(body.whatsapp, 30);
  const faturamento = clean(body.faturamento, 500);
  const errors: Partial<Record<keyof ApplicationInput, string>> = {};

  if (nome.length < 2) errors.nome = "Informe seu nome.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Informe um email válido.";
  const digits = whatsapp.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) errors.whatsapp = "Informe seu Whatsapp com DDD.";
  if (faturamento.length < 1) errors.faturamento = "Informe seu faturamento mensal atual.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, data: { nome, email, whatsapp, faturamento } };
}
