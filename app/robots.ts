import type { MetadataRoute } from "next";

// Obs.: /paineljbadmin NÃO é listado aqui de propósito (listar revelaria a rota).
// O painel usa <meta name="robots" content="noindex"> + cabeçalho X-Robots-Tag.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }] };
}
