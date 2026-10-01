"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import InstallButton from "./InstallButton";

export default function LoginForm({ configError }: { configError: string | null }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(configError);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/paineljbadmin/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        router.refresh();
        return;
      }
      setError(data.error || "Não foi possível entrar.");
    } catch {
      setError("Falha de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-wrap">
      <form className="login-card" onSubmit={onSubmit}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/jb-crest-180.webp" alt="" width={56} height={72} />
        <h1>Painel de aplicações</h1>
        <p>Acesso restrito. Informe a senha.</p>
        <input
          type="password"
          name="password"
          placeholder="Senha"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
          disabled={!!configError}
        />
        <button type="submit" disabled={loading || !password || !!configError}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
        {error && <p className="login-error" role="alert">{error}</p>}
        <div className="login-install">
          <InstallButton />
        </div>
      </form>
    </main>
  );
}
