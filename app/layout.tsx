import type { Metadata, Viewport } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";

// 2 famílias no total: Manrope (variável, texto) + Playfair Display 500 (títulos/números, 1 arquivo só).
// (Cormorant foi testada, mas o circunflexo dela fica deslocado em "você", "três"... — ruim para PT-BR.)
const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Playfair_Display({ subsets: ["latin"], weight: "500", variable: "--font-serif", display: "swap", preload: false });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "João Barboza | Programa de Aceleração para mentores e prestadores de serviço",
  description:
    "Programa de Aceleração específico para mentores e prestadores de serviço que querem faturar de 30.000 a 100.000 mil todos os meses com liberdade, lucro e previsibilidade.",
  openGraph: {
    title: "João Barboza | Programa de Aceleração",
    description: "Faturar de 30.000 a 100.000 mil todos os meses com liberdade, lucro e previsibilidade.",
    images: ["/img/og.jpg"],
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0b0f2e", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
