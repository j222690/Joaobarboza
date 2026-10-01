"use client";

import { useEffect, useState } from "react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: window-controls-overlay)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

/** Botão "Instalar app" (só aparece no painel). Também registra o service worker do painel. */
export default function InstallButton({ className = "btn ghost" }: { className?: string }) {
  const [prompt, setPrompt] = useState<BIPEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/paineljbadmin/sw.js", { scope: "/paineljbadmin" }).catch(() => {});
    }
    if (isStandalone()) return; // já está rodando como app
    if (isIOS()) {
      setIos(true);
      setHidden(false);
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BIPEvent);
      setHidden(false);
    };
    const onInstalled = () => {
      setPrompt(null);
      setHidden(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (hidden) return null;

  async function onClick() {
    if (prompt) {
      await prompt.prompt();
      const choice = await prompt.userChoice.catch(() => null);
      if (choice?.outcome === "accepted") setHidden(true);
      setPrompt(null);
      return;
    }
    if (ios) setShowHelp((v) => !v);
  }

  return (
    <span className="install-wrap">
      <button type="button" className={className} onClick={onClick}>
        Instalar app
      </button>
      {showHelp && (
        <span className="install-help" role="status">
          Toque em <strong>Compartilhar</strong> e depois em <strong>Adicionar à Tela de Início</strong>.
        </span>
      )}
    </span>
  );
}
