// Service worker mínimo do painel: existe só para permitir a instalação (PWA).
// NÃO guarda nada em cache – nem páginas, nem respostas da API, nem dados de leads.
export const dynamic = "force-static";

const SW = `
const OFFLINE_HTML = '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Painel JB</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0f2e;color:#eef0f6;font-family:system-ui,sans-serif;text-align:center;padding:24px"><div><h1 style="font-size:20px;color:#b89c5e">Sem conexão</h1><p>Conecte-se à internet e tente novamente.</p><button onclick="location.reload()" style="margin-top:12px;padding:10px 18px;border:0;border-radius:6px;background:#b89c5e;color:#0b0f2e;font-weight:600">Tentar de novo</button></div></body></html>';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
  // Só navegações do painel; tudo o mais (API, CSV, imagens) vai direto para a rede, sem cache.
  if (event.request.mode !== 'navigate') return;
  event.respondWith(
    fetch(event.request).catch(() => new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }))
  );
});
`;

export function GET() {
  return new Response(SW, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache",
      "Service-Worker-Allowed": "/paineljbadmin",
    },
  });
}
