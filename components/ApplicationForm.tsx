"use client";

import { useEffect, useRef, useState } from "react";

type Errors = Partial<Record<"nome" | "email" | "whatsapp" | "faturamento", string>>;

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function ApplicationForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [phone, setPhone] = useState("");
  const startedAt = useRef<number>(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, string | number> = Object.fromEntries(
      Array.from(fd.entries()).map(([k, v]) => [k, String(v)])
    );
    const params = new URLSearchParams(window.location.search);
    const utm = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]
      .filter((k) => params.get(k))
      .map((k) => `${k.replace("utm_", "")}=${params.get(k)}`)
      .join(" | ");
    payload.utm = utm;
    payload.pagina = window.location.pathname;
    payload.t = startedAt.current;

    setStatus("sending");
    setErrors({});
    setMessage("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus("success");
        return;
      }
      setErrors(data.errors || {});
      setMessage(data.error || "Não foi possível enviar. Tente novamente.");
      setStatus("error");
    } catch {
      setMessage("Falha de conexão. Verifique sua internet e tente novamente.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div id="aplicar" className="form-success" role="status" aria-live="polite">
        <strong>Aplicação enviada com sucesso!</strong>
        <span>Recebemos suas informações. Em breve nossa equipe entrará em contato pelo seu Whatsapp.</span>
      </div>
    );
  }

  return (
    <form id="aplicar" className="apply-form" onSubmit={onSubmit} noValidate>
      <input
        name="nome"
        type="text"
        placeholder="Nome"
        aria-label="Nome"
        autoComplete="name"
        required
        maxLength={120}
        aria-invalid={!!errors.nome}
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        aria-label="Email"
        autoComplete="email"
        inputMode="email"
        required
        maxLength={160}
        aria-invalid={!!errors.email}
      />
      <input
        name="whatsapp"
        type="tel"
        placeholder="Whatsapp com DDD"
        aria-label="Whatsapp com DDD"
        autoComplete="tel-national"
        inputMode="tel"
        required
        value={phone}
        onChange={(e) => setPhone(maskPhone(e.target.value))}
        aria-invalid={!!errors.whatsapp}
      />
      <textarea
        name="faturamento"
        placeholder="Faturamento mensal atual"
        aria-label="Faturamento mensal atual"
        rows={1}
        required
        maxLength={500}
        aria-invalid={!!errors.faturamento}
      />
      {/* honeypot anti-spam: invisível para humanos */}
      <div className="hp" aria-hidden="true">
        <label>
          Não preencha este campo
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Enviando..." : "Aplicar para o programa ➔"}
      </button>
      {status === "error" && (
        <p className="form-error" role="alert">
          {message}
          {Object.values(errors).length > 0 && <span> {Object.values(errors).join(" ")}</span>}
        </p>
      )}
      <p className="form-note">Suas informações são confidenciais.</p>
    </form>
  );
}
