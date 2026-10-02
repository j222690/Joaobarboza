/**
 * <picture> com AVIF + WebP pré-gerados em public/img (sem otimização sob demanda:
 * na Vercel não há latência de "primeiro acesso" nem consumo da cota de Image Optimization).
 * Arquivos: `${base}-${w}.avif` e `${base}-${w}.webp` para cada largura.
 */
type Props = {
  base: string;
  widths: number[];
  sizes: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
};

export const srcSet = (base: string, widths: number[], ext: "avif" | "webp") =>
  widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(", ");

export default function Picture({ base, widths, sizes, alt, width, height, className, priority }: Props) {
  const fallback = `${base}-${widths[Math.min(1, widths.length - 1)]}.webp`;
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(base, widths, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(base, widths, "webp")} sizes={sizes} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fallback}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? undefined : "async"}
      />
    </picture>
  );
}
