// Manifesto PWA exclusivo do painel (a landing page não referencia este arquivo).
export const dynamic = "force-static";

const NAVY = "#0b0f2e";

export function GET() {
  const manifest = {
    id: "/paineljbadmin",
    name: "Painel JB",
    short_name: "Painel JB",
    description: "Painel de aplicações – João Barboza",
    lang: "pt-BR",
    start_url: "/paineljbadmin",
    // Sem barra final para incluir o próprio /paineljbadmin (o Next não usa barra final nas rotas).
    scope: "/paineljbadmin",
    display: "standalone",
    orientation: "any",
    background_color: NAVY,
    theme_color: NAVY,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/painel-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/painel-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
