import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Check, Clipboard, Copy, QrCode, ShieldCheck, Smartphone } from "lucide-react";
import { useMemo, useState } from "react";
import logoAsset from "@/assets/pinkboost-logo.png.asset.json";

export const Route = createFileRoute("/pagamento")({
  head: () => ({
    meta: [
      { title: "Pagamento via PIX | PINKBOOST" },
      { name: "description", content: "Finalize sua compra PINKBOOST com pagamento via PIX." },
    ],
  }),
  component: PaymentPage,
});

const PIX_KEY = "CONFIGURE_SUA_CHAVE_PIX";
const MERCHANT_NAME = "PINKBOOST";
const MERCHANT_CITY = "BALNEARIO CAMBORIU";

const plans = {
  Teste: { duration: "7 dias", price: 9.9 },
  Start: { duration: "30 dias", price: 29.9 },
  Pro: { duration: "90 dias", price: 69.9 },
  Elite: { duration: "120 dias", price: 89.9 },
  Anual: { duration: "365 dias", price: 199.9 },
} as const;

function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function field(id: string, value: string) {
  return id + value.length.toString().padStart(2, "0") + value;
}

function pixPayload(amount: number) {
  const merchantAccount = field("00", "BR.GOV.BCB.PIX") + field("01", PIX_KEY);
  const additional = field("05", "***");
  const body =
    field("00", "01") +
    field("26", merchantAccount) +
    field("52", "0000") +
    field("53", "986") +
    field("54", amount.toFixed(2)) +
    field("58", "BR") +
    field("59", MERCHANT_NAME) +
    field("60", MERCHANT_CITY) +
    field("62", additional);
  return body + "6304" + crc16(body + "6304");
}

function PaymentPage() {
  const search = useSearch({ from: "/pagamento" }) as { plano?: string };
  const initial = search.plano && search.plano in plans ? search.plano as keyof typeof plans : "Pro";
  const [planName, setPlanName] = useState<keyof typeof plans>(initial);
  const [copied, setCopied] = useState(false);

  const plan = plans[planName];
  const payload = useMemo(() => pixPayload(plan.price), [plan.price]);
  const qrUrl = useMemo(
    () => "https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=" + encodeURIComponent(payload),
    [payload],
  );

  async function copyPix() {
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  const configured = PIX_KEY !== "CONFIGURE_SUA_CHAVE_PIX";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center">
            <img src={logoAsset.url} alt="PINKBOOST" className="h-10 w-auto mix-blend-screen" />
          </Link>
          <Link to="/" className="text-xs font-display font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">
            Voltar ao site
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="text-center">
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-primary">Pagamento seguro</p>
          <h1 className="mt-3 font-display text-3xl font-bold uppercase italic sm:text-5xl">
            Pague via <span className="text-gradient">PIX</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Escolha seu plano, escaneie o QR Code ou copie o PIX Copia e Cola. Após a confirmação,
            sua compra poderá ser processada pela equipe.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="card-neon rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-primary" />
              <h2 className="font-display text-lg font-bold uppercase">Seu pedido</h2>
            </div>

            <div className="mt-6 space-y-3">
              {(Object.keys(plans) as Array<keyof typeof plans>).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setPlanName(name)}
                  className={`w-full rounded-lg border p-4 text-left transition-all ${
                    planName === name ? "border-primary bg-primary/10 glow-primary" : "border-border bg-secondary/30 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold uppercase">{name}</span>
                    <span className="font-display font-bold">R$ {plans[name].price.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <span className="mt-1 block text-xs text-muted-foreground">{plans[name].duration} de acesso</span>
                </button>
              ))}
            </div>

            <div className="mt-6 border-t border-border pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <strong className="font-display text-3xl text-gradient">
                  R$ {plan.price.toFixed(2).replace(".", ",")}
                </strong>
              </div>
            </div>
          </section>

          <section className="card-neon rounded-2xl p-6 text-center sm:p-8">
            <div className="mx-auto flex max-w-sm items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
              <QrCode className="h-4 w-4" /> PIX • pagamento instantâneo
            </div>

            <div className="mx-auto mt-7 flex h-[300px] w-[300px] items-center justify-center rounded-xl bg-white p-3">
              {configured ? (
                <img src={qrUrl} alt="QR Code PIX" className="h-full w-full" />
              ) : (
                <div className="px-6 text-center text-sm text-slate-700">
                  <QrCode className="mx-auto h-14 w-14" />
                  <p className="mt-4 font-bold">QR Code aguardando configuração</p>
                  <p className="mt-2 text-xs">Cadastre a chave PIX da PINKBOOST no código do projeto para ativar o pagamento.</p>
                </div>
              )}
            </div>

            <p className="mt-5 text-sm font-semibold">
              {configured ? "Escaneie o QR Code no aplicativo do seu banco." : "Configure a chave PIX para liberar o QR Code real."}
            </p>

            <div className="mt-6 text-left">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">PIX Copia e Cola</label>
              <div className="mt-2 flex gap-2">
                <input
                  readOnly
                  value={payload}
                  className="min-w-0 flex-1 rounded-md border border-input bg-secondary/50 px-3 py-3 text-xs text-muted-foreground outline-none"
                />
                <button
                  type="button"
                  onClick={copyPix}
                  disabled={!configured}
                  className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-3 text-xs font-bold uppercase text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <Smartphone className="h-5 w-5 text-primary" />
                <p className="mt-2 text-xs font-semibold">Pelo celular</p>
                <p className="mt-1 text-xs text-muted-foreground">Abra o app do banco e leia o QR Code.</p>
              </div>
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <Clipboard className="h-5 w-5 text-primary" />
                <p className="mt-2 text-xs font-semibold">Copia e Cola</p>
                <p className="mt-1 text-xs text-muted-foreground">Copie o código e cole na opção PIX do banco.</p>
              </div>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-muted-foreground/60">
              Importante: o acesso/key não deve ser liberado apenas pela tela do pagamento.
              A confirmação do recebimento deve ocorrer no sistema administrativo.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
