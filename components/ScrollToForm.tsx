import { ArrowCircle } from "./Icons";

/** CTA que leva ao formulário (âncora pura: zero JavaScript; rolagem suave via CSS). */
export default function ScrollToForm({ label, variant }: { label: string; variant: "gold" | "dark" }) {
  return (
    <a href="#aplicar" className={`pill pill-${variant}`}>
      {label} <ArrowCircle className="pill-icon" />
    </a>
  );
}
