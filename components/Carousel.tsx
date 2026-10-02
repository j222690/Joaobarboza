"use client";

import { useEffect, useRef } from "react";

/** `src`: prefixo do arquivo (ex.: /img/dep1-v3); `widths`: larguras pré-geradas (`${src}-${w}.webp`). */
export type Slide = { src: string; widths: number[]; width: number; height: number; alt: string; caption?: string };

// Mesmo `sizes` + mesmo `srcset` em todas as cópias => o navegador escolhe o mesmo arquivo e baixa 1 vez só.
const SIZES = "(max-width: 767px) 64vw, (max-width: 1023px) 32vw, 17vw";

const COPIES = 3; // 3 cópias garantem que nunca aparece "buraco" ao arrastar/avançar
const RESUME_AFTER_MS = 2500;

/**
 * Carrossel contínuo (marquee). O movimento é 100% CSS (transform/translate3d na GPU);
 * o JS só cuida de arrastar/swipe, das setas e de pausar ao tocar.
 */
export default function Carousel({ slides }: { slides: Slide[] }) {
  const root = useRef<HTMLDivElement>(null);
  const drag = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const dragEl = drag.current;
    if (!el || !dragEl) return;
    let dx = 0;
    let resumeTimer = 0;
    const setWidth = () => (dragEl.firstElementChild as HTMLElement).offsetWidth / COPIES; // largura de uma cópia
    let W = setWidth();
    const wrap = (v: number) => {
      if (!W) return v;
      while (v > 0) v -= W;
      while (v <= -W) v += W;
      return v;
    };
    const apply = (v: number, animate = false) => {
      dragEl.classList.toggle("is-sliding", animate);
      dragEl.style.transform = `translate3d(${v}px,0,0)`;
    };
    const pause = () => {
      window.clearTimeout(resumeTimer);
      el.classList.add("is-paused");
    };
    const resumeLater = () => {
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => el.classList.remove("is-paused"), RESUME_AFTER_MS);
    };

    // Carrega as imagens um pouco antes de a seção entrar na tela (as cópias ficam
    // "cortadas" pelo overflow e o lazy-load nativo só as buscaria em cima da hora).
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.querySelectorAll("img").forEach((img) => (img.loading = "eager"));
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);

    // Arrastar / swipe (pointer events; a rolagem vertical continua com o navegador: touch-action: pan-y)
    let startX = 0;
    let startY = 0;
    let base = 0;
    let dragging = false;
    let decided = false;
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest(".carousel-btn")) return;
      startX = e.clientX;
      startY = e.clientY;
      base = dx;
      dragging = true;
      decided = e.pointerType === "mouse";
      pause();
      if (decided) el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const mx = e.clientX - startX;
      if (!decided) {
        if (Math.abs(mx) < 6 && Math.abs(e.clientY - startY) < 6) return;
        decided = true;
        if (Math.abs(mx) < Math.abs(e.clientY - startY)) {
          dragging = false; // gesto vertical: deixa a página rolar
          resumeLater();
          return;
        }
        el.setPointerCapture(e.pointerId);
      }
      dx = wrap(base + mx);
      apply(dx);
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      resumeLater();
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);

    // Setas: desliza uma "página" (1 depoimento) com transição suave
    const step = (dir: 1 | -1) => {
      const slide = el.querySelector<HTMLElement>(".slide");
      const amount = slide ? slide.offsetWidth : 300;
      let from = dx;
      if (dir === -1 && from + amount > 0) from -= W; // pula uma cópia (invisível) antes de animar
      if (dir === 1 && from - amount <= -W - amount) from += W;
      apply(from);
      void dragEl.offsetWidth; // força o reflow para a transição partir do ponto certo
      dx = from - dir * amount;
      apply(dx, true);
      pause();
      resumeLater();
    };
    const onTransitionEnd = () => {
      dx = wrap(dx);
      apply(dx);
    };
    dragEl.addEventListener("transitionend", onTransitionEnd);
    const prev = el.querySelector<HTMLButtonElement>(".carousel-btn.prev");
    const next = el.querySelector<HTMLButtonElement>(".carousel-btn.next");
    const onPrev = () => step(-1);
    const onNext = () => step(1);
    prev?.addEventListener("click", onPrev);
    next?.addEventListener("click", onNext);

    const onResize = () => {
      W = setWidth();
      dx = wrap(dx);
      apply(dx);
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      io.disconnect();
      window.clearTimeout(resumeTimer);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      dragEl.removeEventListener("transitionend", onTransitionEnd);
      prev?.removeEventListener("click", onPrev);
      next?.removeEventListener("click", onNext);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const all = Array.from({ length: COPIES }, (_, c) => slides.map((s) => ({ ...s, copy: c }))).flat();

  return (
    <div className="carousel" ref={root} role="region" aria-roledescription="carrossel" aria-label="Depoimentos de clientes">
      <div className="carousel-drag" ref={drag}>
        <div className="carousel-track" style={{ ["--n" as string]: slides.length }}>
          {all.map((s) => (
            <figure className="slide" key={`${s.copy}-${s.src}`} aria-hidden={s.copy > 0 ? true : undefined}>
              <div className="phone">
                <div className="phone-screen">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${s.src}-${s.widths[s.widths.length - 1]}.webp`}
                    srcSet={s.widths.map((w) => `${s.src}-${w}.webp ${w}w`).join(", ")}
                    sizes={SIZES}
                    width={s.width}
                    height={s.height}
                    alt={s.copy > 0 ? "" : s.alt}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </div>
              </div>
              {s.caption && <figcaption>{s.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </div>
      <button type="button" className="carousel-btn prev" aria-label="Anterior">
        ‹
      </button>
      <button type="button" className="carousel-btn next" aria-label="Próximo">
        ›
      </button>
    </div>
  );
}
