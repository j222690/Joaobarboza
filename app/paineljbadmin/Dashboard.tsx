"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import InstallButton from "./InstallButton";
import type { Application } from "@/lib/types";

export type Row = Application & { dataHora: string };

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function Dashboard({ rows, storage }: { rows: Row[]; storage: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  // Renovação da sessão (180 dias a partir da última visita)
  useEffect(() => {
    fetch("/paineljbadmin/api/session", { method: "POST" }).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const term = norm(q.trim());
    if (!term) return rows;
    const digits = term.replace(/\D/g, "");
    return rows.filter((r) => {
      const hay = norm([r.dataHora, r.nome, r.email, r.whatsapp, r.faturamento, r.utm ?? ""].join(" "));
      return hay.includes(term) || (digits.length >= 3 && r.whatsapp.replace(/\D/g, "").includes(digits));
    });
  }, [q, rows]);

  async function remove(r: Row) {
    if (!confirm(`Excluir a aplicação de ${r.nome}? Esta ação não pode ser desfeita.`)) return;
    setBusy(r.id);
    const res = await fetch(`/paineljbadmin/api/applications?id=${encodeURIComponent(r.id)}`, { method: "DELETE" });
    setBusy(null);
    if (!res.ok) alert("Não foi possível excluir.");
    router.refresh();
  }

  async function logout() {
    await fetch("/paineljbadmin/api/logout", { method: "POST" });
    router.refresh();
  }

  const waLink = (w: string) => {
    let d = w.replace(/\D/g, "");
    if (d.length <= 11) d = `55${d}`;
    return `https://wa.me/${d}`;
  };

  return (
    <main className="dash">
      <header className="dash-head">
        <div className="dash-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/jb-crest-180.webp" alt="" width={34} height={44} />
          <div>
            <h1>Aplicações</h1>
            <span>
              {rows.length} {rows.length === 1 ? "aplicação" : "aplicações"} · horário de Brasília · armazenamento: {storage}
            </span>
          </div>
        </div>
        <div className="dash-actions">
          <input
            type="search"
            placeholder="Buscar por nome, email, whatsapp..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Buscar"
          />
          <a className="btn gold" href="/paineljbadmin/api/export">Exportar CSV</a>
          <button className="btn ghost" onClick={() => router.refresh()}>Atualizar</button>
          <InstallButton />
          <button className="btn ghost" onClick={logout}>Sair</button>
        </div>
      </header>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Data/hora</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Whatsapp</th>
              <th>Faturamento mensal atual</th>
              <th>UTM</th>
              <th aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="nowrap" data-label="Data/hora">{r.dataHora}</td>
                <td data-label="Nome"><strong>{r.nome}</strong></td>
                <td data-label="Email"><a href={`mailto:${r.email}`}>{r.email}</a></td>
                <td className="nowrap" data-label="Whatsapp"><a href={waLink(r.whatsapp)} target="_blank" rel="noopener noreferrer">{r.whatsapp}</a></td>
                <td className="wrap" data-label="Faturamento">{r.faturamento}</td>
                <td className="muted" data-label="UTM">{r.utm || "—"}</td>
                <td>
                  <button className="btn danger" disabled={busy === r.id} onClick={() => remove(r)}>
                    {busy === r.id ? "..." : "Excluir"}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="empty">{rows.length ? "Nenhum resultado para a busca." : "Nenhuma aplicação recebida ainda."}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
