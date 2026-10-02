import type { NextConfig } from "next";

const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Sem otimização sob demanda: as imagens já são servidas pré-dimensionadas (AVIF/WebP) de /public/img.
  images: { unoptimized: true },
  async headers() {
    return [
      // Imagens com nome versionado (ex.: hero-v3-1080.avif): cache de 1 ano no navegador/CDN.
      // Ao trocar uma imagem, gere um arquivo com NOVO nome (v4...) em vez de sobrescrever.
      { source: "/img/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/icons/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
      { source: "/paineljbadmin", headers: [...noindex, { key: "Cache-Control", value: "no-store" }] },
      { source: "/paineljbadmin/:path*", headers: [...noindex, { key: "Cache-Control", value: "no-store" }] },
      { source: "/api/:path*", headers: noindex },
    ];
  },
};

export default nextConfig;
