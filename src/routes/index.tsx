import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Crosshair,
  Gamepad2,
  Headset,
  KeyRound,
  Layers,
  MousePointerClick,
  ShieldCheck,
  SlidersHorizontal,
  Zap,
} from "lucide-react";

import heroBg from "@/assets/hero-bg.jpg";
import logoAsset from "@/assets/pinkboost-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PINKBOOST — Mira assistida para mouse e teclado" },
      {
        name: "description",
        content:
          "Chega de perder a trocação para quem joga no controle. Leve uma experiência de assistência de mira inspirada no controle para sua jogabilidade com mouse e teclado.",
      },
      { property: "og:title", content: "PINKBOOST — Mira assistida para mouse e teclado" },
      {
        property: "og:description",
        content:
          "Experiência de mira mais consistente, sem modificar os arquivos do jogo. Suporte 24 horas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/* ---------------------------------- hooks --------------------------------- */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* --------------------------------- buttons -------------------------------- */

function PrimaryButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-primary px-7 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary-lg transition-all duration-300 hover:scale-[1.03] hover:brightness-110 ${className}`}
    >
      {children}
    </a>
  );
}

function GhostButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-md border border-primary/40 bg-transparent px-7 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-foreground transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_28px_-8px_var(--color-glow)]"
    >
      {children}
    </a>
  );
}

/* ---------------------------------- chrome -------------------------------- */

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="#" className="flex items-center">
          <img
            src={logoAsset.url}
            alt="PINKBOOST"
            className="h-11 w-auto mix-blend-screen"
          />
        </a>
        <nav className="hidden items-center gap-7 font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground lg:flex">
          <a href="#experiencia" className="transition-colors hover:text-primary">
            Experiência
          </a>
          <a href="#como-funciona" className="transition-colors hover:text-primary">
            Como funciona
          </a>
          <a href="#recursos" className="transition-colors hover:text-primary">
            Recursos
          </a>
          <a href="#planos" className="transition-colors hover:text-primary">
            Planos
          </a>
          <a href="/cliente" className="transition-colors hover:text-primary">
            Minha conta
          </a>
          <a href="#suporte" className="transition-colors hover:text-primary">
            Suporte
          </a>
        </nav>
        <a
          href="#planos"
          className="rounded-md bg-primary px-4 py-2 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground glow-primary transition-all duration-300 hover:scale-105 hover:brightness-110 sm:px-5"
        >
          Quero meu Pinkboost
        </a>
      </div>
    </header>
  );
}

/* ----------------------------------- hero ---------------------------------- */

function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      <img
        src={heroBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
      <div className="hero-grid absolute inset-0" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-28 sm:px-6">
        <div className="max-w-2xl">
          <img
            src={logoAsset.url}
            alt="PINKBOOST"
            className="mb-8 h-24 w-auto mix-blend-screen md:h-28"
          />
          <h1 className="font-display text-4xl font-bold uppercase italic leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Chega de perder a{" "}
            <span className="text-gradient">trocação</span> para quem joga no
            controle.
          </h1>
          <p className="mt-6 text-lg font-medium text-muted-foreground">
            Leve uma experiência de assistência de mira inspirada no controle
            para sua jogabilidade com mouse e teclado.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground/80">
            O PINKBOOST foi desenvolvido para jogadores que preferem a precisão
            do mouse e teclado, mas querem experimentar uma experiência de mira
            semelhante à disponível para jogadores que utilizam controle.
          </p>
          <p className="mt-4 font-display text-base font-semibold uppercase tracking-wide text-foreground">
            Tenha uma experiência de mira mais consistente e adapte o PINKBOOST
            ao seu estilo de jogo.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton href="#planos">Quero meu Pinkboost</PrimaryButton>
            <GhostButton href="#planos">Ver planos</GhostButton>
          </div>
        </div>
      </div>

      <a
        href="#experiencia"
        aria-label="Rolar para baixo"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary/70 transition-colors hover:text-primary"
      >
        <Crosshair className="h-6 w-6 animate-pulse-soft" />
      </a>
    </section>
  );
}

/* -------------------------------- sections -------------------------------- */

function SectionTitle({
  label,
  children,
  align = "center",
}: {
  label?: string;
  children: React.ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div
      className={`reveal ${align === "center" ? "text-center" : "text-left"}`}
    >
      {label ? (
        <p className="mb-3 font-display text-xs font-bold uppercase tracking-[0.3em] text-primary">
          {label}
        </p>
      ) : null}
      <h2 className="font-display text-3xl font-bold uppercase italic tracking-tight text-foreground sm:text-4xl">
        {children}
      </h2>
    </div>
  );
}

function Experience() {
  return (
    <section id="experiencia" className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        <SectionTitle label="Nossa experiência">
          2 anos de <span className="text-gradient">experiência</span>
        </SectionTitle>
        <p className="reveal mx-auto mt-8 max-w-3xl leading-relaxed text-muted-foreground">
          Nossa equipe possui mais de{" "}
          <span className="font-semibold text-foreground">
            2 anos de experiência utilizando esse tipo de solução
          </span>
          , período em que não tivemos registro de banimento relacionado ao seu
          uso.
        </p>
        <p className="reveal mx-auto mt-4 max-w-3xl leading-relaxed text-muted-foreground">
          O PINKBOOST foi desenvolvido para funcionar sem modificar arquivos
          internos do jogo, sem alterar seu conteúdo e sem realizar modificações
          no código do jogo.
        </p>

        <div className="reveal card-neon glow-primary mt-12 rounded-xl px-8 py-10">
          <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-5 font-display text-2xl font-bold uppercase italic tracking-wide sm:text-3xl">
            Sem modificar os <span className="text-gradient">arquivos do jogo.</span>
          </p>
        </div>

        <p className="reveal mx-auto mt-8 max-w-3xl text-xs leading-relaxed text-muted-foreground/60">
          Nenhuma ferramenta de terceiros pode garantir risco zero de punição,
          pois regras e sistemas de segurança podem ser alterados pela plataforma
          a qualquer momento. A garantia do PINKBOOST refere-se ao funcionamento
          do nosso software e à sua arquitetura, que não foi desenvolvida para
          modificar os arquivos internos do jogo.
        </p>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Compre",
      description: "Escolha o plano ideal para você e adquira sua Key.",
      icon: KeyRound,
    },
    {
      number: "02",
      title: "Configure",
      description:
        "Nossa equipe ajuda você durante todo o processo de instalação e configuração.",
      icon: SlidersHorizontal,
    },
    {
      number: "03",
      title: "Jogue",
      description:
        "Ative o PINKBOOST e utilize sua configuração durante suas partidas.",
      icon: Gamepad2,
    },
  ];

  return (
    <section id="como-funciona" className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle label="Como funciona">
          Simples em <span className="text-gradient">3 passos</span>
        </SectionTitle>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="reveal card-neon relative overflow-hidden rounded-xl p-8"
            >
              <span className="pointer-events-none absolute -right-3 -top-6 font-display text-8xl font-bold italic text-primary/10">
                {step.number}
              </span>
              <step.icon className="h-9 w-9 text-primary" />
              <p className="mt-6 font-display text-sm font-bold uppercase tracking-[0.25em] text-primary">
                {step.number}
              </p>
              <h3 className="mt-2 font-display text-xl font-bold uppercase italic tracking-wide">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AssistedSetup() {
  return (
    <section id="configuracao" className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="reveal card-neon relative overflow-hidden rounded-2xl p-10 sm:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-[100px]"
          />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-primary">
                Configuração assistida
              </p>
              <h2 className="mt-4 font-display text-3xl font-bold uppercase italic leading-tight sm:text-4xl">
                Você não precisa <span className="text-gradient">configurar sozinho.</span>
              </h2>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                Assim que sua Key for adquirida, nossa equipe estará disponível
                para ajudar você com a instalação e configuração inicial do
                PINKBOOST.
              </p>
            </div>
            <div className="rounded-xl border border-primary/30 bg-secondary/60 p-8 text-center">
              <Zap className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-4 font-display text-2xl font-bold uppercase italic text-gradient">
                Suporte 24 horas
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Conte com nossa equipe para auxiliar na ativação, configuração e
                dúvidas relacionadas ao software.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      title: "Mouse + Controle",
      description:
        "Experiência de entrada adaptada para jogadores que utilizam mouse e teclado.",
      icon: Gamepad2,
    },
    {
      title: "Configuração personalizável",
      description: "Ajuste sensibilidade, ADS, deadzone e outros parâmetros.",
      icon: SlidersHorizontal,
    },
    {
      title: "Perfis",
      description: "Crie e utilize diferentes configurações.",
      icon: Layers,
    },
    {
      title: "Interface simples",
      description: "Configure tudo de maneira rápida e intuitiva.",
      icon: MousePointerClick,
    },
  ];

  return (
    <section id="recursos" className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle label="Recursos">
          Feito para o seu <span className="text-gradient">estilo de jogo</span>
        </SectionTitle>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="reveal card-neon rounded-xl p-7"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-6 font-display text-base font-bold uppercase tracking-wide">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Plans() {
  const plans = [
    { name: "Teste", duration: "7 dias", description: "Experimente o PINKBOOST.", highlight: false },
    { name: "Start", duration: "30 dias", description: "Para começar.", highlight: false },
    { name: "Pro", duration: "90 dias", description: "Mais tempo para aproveitar.", highlight: true },
    { name: "Elite", duration: "120 dias", description: "Para jogadores frequentes.", highlight: false },
    { name: "Anual", duration: "365 dias", description: "Acesso durante todo o ano.", highlight: false },
  ];

  return (
    <section id="planos" className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle label="Planos">
          Escolha seu <span className="text-gradient">plano</span>
        </SectionTitle>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`reveal card-neon relative flex flex-col rounded-xl p-7 text-center ${
                plan.highlight
                  ? "border-primary/60 glow-primary"
                  : ""
              }`}
            >
              {plan.highlight ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 font-display text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                  Mais popular
                </span>
              ) : null}
              <h3 className="font-display text-lg font-bold uppercase italic tracking-widest">
                {plan.name}
              </h3>
              <p className="mt-3 font-display text-3xl font-bold uppercase text-gradient">
                {plan.duration}
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                A partir de
              </p>
              <p className="mt-1 font-display text-xl font-bold text-foreground">
                Sob consulta
              </p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                {plan.description}
              </p>
              <a
                href="#suporte"
                className={`mt-6 inline-flex items-center justify-center rounded-md px-5 py-3 font-display text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground glow-primary hover:brightness-110"
                    : "border border-primary/40 text-foreground hover:border-primary hover:bg-primary/10"
                }`}
              >
                Comprar agora
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Support() {
  return (
    <section id="suporte" className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div className="reveal">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-primary/40 bg-primary/10 glow-primary">
            <Headset className="h-9 w-9 text-primary" />
          </div>
          <h2 className="mt-8 font-display text-3xl font-bold uppercase italic tracking-tight sm:text-4xl">
            Precisou de ajuda?
          </h2>
          <p className="mt-3 font-display text-xl font-semibold uppercase tracking-wide text-gradient">
            Estamos disponíveis 24 horas.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Nossa equipe está pronta para auxiliar na ativação, configuração e
            dúvidas relacionadas ao software, a qualquer hora do dia.
          </p>
          <div className="mt-9">
            <PrimaryButton href="#suporte">Falar com suporte</PrimaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-[42rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-magenta/15 blur-[120px]"
      />
      <div className="reveal relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="font-display text-3xl font-bold uppercase italic leading-tight sm:text-5xl">
          Pronto para mudar sua{" "}
          <span className="text-gradient">experiência de jogo?</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl leading-relaxed text-muted-foreground">
          Escolha seu plano, receba sua Key e conte com nossa equipe para
          configurar o PINKBOOST.
        </p>
        <div className="mt-10">
          <PrimaryButton href="#planos">Quero meu Pinkboost</PrimaryButton>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
          <img
            src={logoAsset.url}
            alt="PINKBOOST"
            className="h-14 w-auto mix-blend-screen"
          />
          <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <a href="#suporte" className="transition-colors hover:text-primary">
              Suporte
            </a>
            <a href="#planos" className="transition-colors hover:text-primary">
              Planos
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              Termos de Uso
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              Política de Privacidade
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              Contato
            </a>
          </nav>
        </div>
        <div className="mt-10 border-t border-border pt-8 text-center">
          <p className="mx-auto max-w-2xl text-xs leading-relaxed text-muted-foreground/60">
            <span className="font-semibold text-muted-foreground">
              PINKBOOST
            </span>{" "}
            é um software independente e não possui afiliação oficial com
            Activision, Call of Duty ou outras marcas mencionadas.
          </p>
          <p className="mt-4 text-xs text-muted-foreground/40">
            © {new Date().getFullYear()} PINKBOOST. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ----------------------------------- page ---------------------------------- */

function Index() {
  useReveal();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Experience />
        <HowItWorks />
        <AssistedSetup />
        <Features />
        <Plans />
        <Support />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
