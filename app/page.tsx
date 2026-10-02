import { preload } from "react-dom";
import Picture, { srcSet } from "@/components/Picture";
import ApplicationForm from "@/components/ApplicationForm";
import Carousel, { type Slide } from "@/components/Carousel";
import ScrollToForm from "@/components/ScrollToForm";
import { ArrowCircle, Instagram, XBox } from "@/components/Icons";
import { SOCIAL } from "@/lib/site";

const depoimentos: Slide[] = [
  { src: "/img/dep1-v3", widths: [360, 540, 720], width: 960, height: 599, alt: "Depoimento de Leila Chaves no WhatsApp", caption: "Duas reuniões e duas vendas fechadas" },
  { src: "/img/dep2-v3", widths: [360, 540, 720], width: 768, height: 960, alt: "Depoimento de Camilla Simões no WhatsApp", caption: "R$ 25k faturados em 15 dias" },
  { src: "/img/dep3-v3", widths: [360, 540, 720], width: 768, height: 655, alt: "Depoimento de Halyna Savio no WhatsApp", caption: "R$ 30k em vendas em menos de 2 meses" },
  { src: "/img/dep4-v3", widths: [360, 540, 720], width: 960, height: 786, alt: "Depoimento de Camilla Simões no WhatsApp", caption: "Cerca de R$ 180k em 6 meses" },
  { src: "/img/dep5-v3", widths: [360, 540, 649], width: 649, height: 960, alt: "Depoimento de Rodrigo Godoi no WhatsApp", caption: "Feedback após a primeira reunião" },
  { src: "/img/dep6-v3", widths: [360, 535], width: 535, height: 454, alt: "Depoimento de Diego Ferrazzo no WhatsApp", caption: "R$ 569k faturados desde janeiro" },
];

const HERO = { base: "/img/hero-v3", widths: [480, 768, 1080, 1440, 1920], sizes: "(max-width: 1023px) 100vw, 56vw" };

// Números que já aparecem na página (copy e depoimentos) — nada inventado.
const stats = [
  { value: "+300", label: "cases de sucesso" },
  { value: "3 a 5", label: "vendas por semana" },
  { value: <><small>R$</small> 3 a 20 mil</>, label: "em tickets por venda" },
  { value: <><small>R$</small> Até 569 mil</>, label: "faturados por um mentorado" },
];

function Ornament() {
  return (
    <div className="ornament" aria-hidden="true">
      <span />
    </div>
  );
}

function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a className="social" href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
      {children}
    </a>
  );
}

export default function Home() {
  // Pré-carrega a foto do topo (LCP) já no <head>, em AVIF, com prioridade alta.
  preload(`${HERO.base}-1080.avif`, {
    as: "image",
    type: "image/avif",
    fetchPriority: "high",
    imageSrcSet: srcSet(HERO.base, HERO.widths, "avif"),
    imageSizes: HERO.sizes,
  });
  return (
    <main className="lp">
      {/* Hero + faixa de números juntos ocupam a 1ª tela no desktop (ver .fold no CSS) */}
      <div className="fold">
      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="hero-photo">
          <Picture {...HERO} alt="João Barboza palestrando" width={2144} height={2560} priority />
        </div>
        <div className="hero-content">
          <div className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/jb-crest-v3-100.webp" alt="" width={100} height={129} className="brand-crest" decoding="async" fetchPriority="low" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/jb-wordmark.webp" alt="João Barboza" width={978} height={142} className="brand-word" decoding="async" fetchPriority="low" />
          </div>
          <hr className="rule" />
          <h1 className="hero-title">
            Programa de Aceleração específico para <strong>mentores</strong> e <strong>prestadores de serviço</strong> que querem
            faturar de <strong>30.000 a 100.000 mil</strong> todos os meses com <strong>liberdade</strong>, <strong>lucro</strong> e{" "}
            <strong>previsibilidade</strong>
          </h1>
          <ApplicationForm />
          <hr className="rule" />
        </div>
      </section>

      {/* ============ FAIXA DE NÚMEROS ============ */}
      <section className="stats" aria-label="Resultados em números">
        <ul className="stats-list">
          {stats.map((st, i) => (
            <li key={i}>
              <span className="stats-value">{st.value}</span>
              <span className="stats-label">{st.label}</span>
            </li>
          ))}
        </ul>
      </section>
      </div>

      {/* ============ INTRO + NÚMEROS ============ */}
      <section className="intro">
        <div className="container">
          <h2 className="intro-title">
            Eu sei que você tem pouco tempo. Por isso,
            <br className="br-desk" /> vou direto ao ponto:
          </h2>
          <p className="intro-text">
            Eu tenho um <span className="serif">sistema de captação</span> para atrair,
            <br className="br-desk" /> especificamente, <strong>empresários</strong>, <strong>tomadores de</strong>
            <br className="br-desk" /> <strong>decisão</strong> e <strong>executivos</strong> para o seu Comercial,
            <br className="br-desk" /> exatamente o seu público ideal.
          </p>
          <p className="numbers-title">Alguns números importantes desse sistema:</p>
          <div className="cards">
            <div className="card">
              <p><strong>60 a 70%</strong> dos leads que chegam dos funis estão enquadrados no <strong>ICP</strong></p>
            </div>
            <div className="card card-center">
              <p><strong>No-show</strong> abaixo de 10%</p>
            </div>
            <div className="card">
              <p><strong>Taxa de conversão</strong> do comercial acima dos 40%</p>
            </div>
            <div className="card">
              <p>80% das <strong>vendas</strong> com pagamento em call, sem precisar fazer follow-up</p>
            </div>
            <div className="card card-lg">
              <p>O <strong>ticket principal</strong> é vendido no pix ou no cartão, sem parcelas no boleto</p>
            </div>
          </div>
        </div>
      </section>

      <Ornament />

      {/* ============ PARA QUEM ============ */}
      <section className="forwho">
        <div className="container-wide">
          <div className="forwho-box">
            <p className="forwho-title">Este programa é para quem...</p>
            <ul className="forwho-list">
              <li><ArrowCircle className="li-icon" /><span>É mentor e/ou prestador de serviço com <strong>ticket acima de R$2.000</strong></span></li>
              <li><ArrowCircle className="li-icon" /><span>Quer <strong>atrair o lead que chega pronto</strong> para comprar a solução que você vende</span></li>
              <li><ArrowCircle className="li-icon" /><span>Quer fazer de <strong>2 a 4 calls de vendas por dia</strong> com lead com nível de consciência alto</span></li>
              <li><ArrowCircle className="li-icon" /><span>Quer <strong>escalar o faturamento</strong> para 30-100k por mês com previsibilidade e lucro</span></li>
            </ul>
          </div>
        </div>
      </section>

      <Ornament />

      {/* ============ RESULTADOS ============ */}
      <section className="results">
        <div className="container-wide">
          <p className="results-text">
            Nossos mais de 300 clientes fazem de <strong>3 a 5 vendas semanais</strong>, com tickets de{" "}
            <strong className="gold">3.000 a 20.000 reais</strong>.
            <span className="line">Sem depender de lançamento ou de prospecção ativa.</span>
          </p>
          <p className="results-sub">Resultados de alguns dos nossos clientes</p>
        </div>
        <Carousel slides={depoimentos} />
      </section>

      <div className="fade-to-cream" aria-hidden="true" />

      {/* ============ DIGITAL SOFISTICADO ============ */}
      <section className="digital">
        <div className="container-wide">
          <div className="digital-box">
            <div className="digital-left">
              <h2 className="digital-title">
                O digital foi fácil de 2015 a 2023, agora está <span className="serif">sofisticado</span>.
              </h2>
              <p className="digital-text">
                Mas posso afirmar, com certeza, que esse sistema é <strong>mais simples</strong>, <strong>mais lucrativo</strong> e{" "}
                <strong>menos exaustivo</strong> que o tradicional.
              </p>
              <ScrollToForm label="Saber Mais" variant="gold" />
            </div>
            <div className="digital-right">
              <p className="nao-title">Você não precisa...</p>
              <ul className="nao-list">
                <li><XBox className="x-icon" /><span>Fazer <strong>prospecção ativa</strong> ligando ou mandando mensagem para quem não te conhece;</span></li>
                <li><XBox className="x-icon" /><span>Produzir <strong>conteúdo diariamente</strong> (só se quiser);</span></li>
                <li><XBox className="x-icon" /><span>Ter equipe grande, com <strong>custo operacional</strong> alto e escritório presencial (só se quiser);</span></li>
                <li><XBox className="x-icon" /><span>Depender apenas de <strong>indicações</strong>;</span></li>
                <li><XBox className="x-icon" /><span><strong>Ferramentas complexas</strong> no seu negócio;</span></li>
                <li><XBox className="x-icon" /><span>Investir uma tonelada de dinheiro em <strong>tráfego pago</strong>;</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ EVITAR ============ */}
      <section className="evitar">
        <div className="evitar-content">
          <p>
            Evitar fazer esse tipo de estratégia que a maioria do mercado faz vai deixar o seu negócio <span className="gold">mais simples</span>,{" "}
            <span className="gold">mais lucrativo</span> e <span className="gold">menos exaustivo</span> que o tradicional.
          </p>
          <p>
            Tendo em vista que você já tem <strong>conhecimento</strong>, <strong>experiência</strong> de mercado e <strong>ambição</strong> para
            construir uma vida melhor pra você e sua família, a única coisa que te falta é um{" "}
            <u>sistema que atraia e converta especificamente o seu público ideal</u> (empresários, tomadores de decisão e executivos).
          </p>
          <p>
            Quando isso acontecer (<span className="serif">e vai acontecer</span>), você vai passar a fazer de{" "}
            <span className="gold">3 a 5 vendas todas as semanas</span> com clientes que virão do Instagram.
          </p>
        </div>
        <Ornament />
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="cta">
        <div className="cta-photo">
          <Picture base="/img/cta-v3" widths={[480, 768, 1080, 1440]} sizes="(max-width: 1023px) 100vw, 40vw" alt="João Barboza em palestra" width={1920} height={1494} />
        </div>
        <div className="cta-inner">
          <div className="cta-card">
            <p>
              O próximo a fazer de R$ 30.000 a R$ 100.000 todos os meses, com <strong>liberdade</strong>, <strong>lucro</strong> e{" "}
              <strong>previsibilidade</strong>, com mentorias ou serviços, pode ser você.
            </p>
            <ScrollToForm label="Quero ser o próximo" variant="dark" />
          </div>
        </div>
      </section>

      {/* ============ RODAPÉ ============ */}
      <footer className="footer">
        <p className="footer-name">João Barboza</p>
        <p className="footer-rights">Todos os direitos reservados</p>
        <Ornament />
        <div className="footer-social">
          <Social href={SOCIAL.instagram} label="Instagram"><Instagram /></Social>
        </div>
      </footer>
    </main>
  );
}
