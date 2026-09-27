import { createFileRoute, Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useEffect, useState } from 'react';
import { KeyRound, LogOut, Check } from 'lucide-react';
import { customerLogin, customerUpdateProfile } from '@/lib/customers.functions';
import { Button } from '@/components/ui/button';
import logo from '@/assets/pinkboost-logo.png.asset.json';

export const Route = createFileRoute('/cliente')({
  head: () => ({ meta: [
    { title: 'Área do cliente | PINKBOOST' },
    { name: 'description', content: 'Acesse seu perfil PINKBOOST com sua key, veja seu plano e renove.' },
    { property: 'og:title', content: 'Área do cliente | PINKBOOST' },
    { property: 'og:description', content: 'Acesse seu perfil PINKBOOST com sua key, veja seu plano e renove.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: ClientePage,
});

type Account = Awaited<ReturnType<typeof customerLogin>>;
const STORE = 'pb_key';
const plans = [['Teste', '7 dias'], ['Start', '30 dias'], ['Pro', '90 dias'], ['Elite', '120 dias'], ['Anual', '365 dias']];
const fmt = (v: string | null) => (v ? new Date(v).toLocaleDateString('pt-BR') : '—');
const statusLabel: Record<string, string> = { active: 'Ativo', suspended: 'Suspenso', blocked: 'Bloqueado' };

function ClientePage() {
  const login = useServerFn(customerLogin);
  const save = useServerFn(customerUpdateProfile);
  const [key, setKey] = useState('');
  const [account, setAccount] = useState<Account | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function enter(k: string) {
    setBusy(true); setErr('');
    try {
      const a = await login({ data: { key: k } });
      sessionStorage.setItem(STORE, k); setKey(k); setAccount(a);
      setName(a.name ?? ''); setUsername(a.username ?? '');
    } catch (e) { sessionStorage.removeItem(STORE); setErr(e instanceof Error ? e.message : 'Key inválida.'); }
    finally { setBusy(false); }
  }

  useEffect(() => { const k = sessionStorage.getItem(STORE); if (k) enter(k); }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(''); setMsg('');
    try { const a = await save({ data: { key, name, username } }); setAccount(a); setMsg('Perfil atualizado.'); }
    catch (e) { setErr(e instanceof Error ? e.message.replace(/^.*"message":\s*"([^"]+)".*$/s, '$1') : 'Erro ao salvar.'); }
    finally { setBusy(false); }
  }

  function logout() { sessionStorage.removeItem(STORE); setAccount(null); setKey(''); }

  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border"><div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
      <Link to="/"><img src={logo.url} alt="PINKBOOST" className="h-12 mix-blend-screen" /></Link>
      {account && <Button variant="ghost" onClick={logout}><LogOut className="mr-2 h-4 w-4" />Sair</Button>}
    </div></header>

    <main className="mx-auto max-w-5xl px-5 py-10">
      {!account ? <form onSubmit={e => { e.preventDefault(); enter(key); }} className="mx-auto max-w-md border border-border bg-card p-8">
        <div className="flex items-center gap-2 text-primary"><KeyRound /><span className="font-display text-xs font-bold uppercase">Área do cliente</span></div>
        <h1 className="mt-3 font-display text-2xl font-bold uppercase">Acesse com sua key</h1>
        <input required value={key} onChange={e => setKey(e.target.value.toUpperCase())} placeholder="PB-XXXXXXXX-XXXXXXXX-XXXXXXXX" className="mt-6 h-11 w-full rounded-md border border-input bg-background px-3 font-mono text-sm" />
        {err && <p role="alert" className="mt-3 text-sm text-destructive">{err}</p>}
        <Button type="submit" disabled={busy} className="mt-4 w-full">Entrar</Button>
        <p className="mt-4 text-xs text-muted-foreground">Ainda não tem key? <Link to="/" hash="planos" className="text-primary">Veja os planos</Link>.</p>
      </form> : <>
        <h1 className="font-display text-3xl font-bold uppercase">Olá, {account.name || (account.username ? `@${account.username}` : 'cliente')}</h1>
        {err && <p role="alert" className="mt-4 border-l-2 border-destructive bg-destructive/10 p-3 text-sm">{err}</p>}
        {msg && <p role="status" className="mt-4 border-l-2 border-primary bg-primary/10 p-3 text-sm">{msg}</p>}

        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Plano', account.plan],
            ['Status', account.plan_active ? 'Ativo' : account.status === 'active' ? 'Expirado' : statusLabel[account.status] ?? account.status],
            ['Validade', fmt(account.valid_until)],
            ['Key', account.license],
          ].map(([l, v]) => <div key={l} className="border border-border bg-card p-4"><p className="text-xs uppercase text-muted-foreground">{l}</p><p className="mt-2 font-display font-bold">{v}</p></div>)}
        </section>

        <section className="mt-10 border-t border-border pt-8">
          <h2 className="font-display text-xl font-bold uppercase">Meu perfil</h2>
          <form onSubmit={saveProfile} className="mt-5 grid gap-4 sm:grid-cols-3">
            <label className="text-sm">Nome<input value={name} onChange={e => setName(e.target.value)} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3" /></label>
            <label className="text-sm">@username<input required value={username} onChange={e => setUsername(e.target.value.toLowerCase())} placeholder="seu_nick" className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3" /></label>
            <label className="text-sm">E-mail<input disabled value={account.email ?? '—'} className="mt-2 h-10 w-full rounded-md border border-input bg-muted px-3 text-muted-foreground" /></label>
            <div><Button type="submit" disabled={busy}>Salvar</Button></div>
          </form>
        </section>

        <section className="mt-10 border-t border-border pt-8">
          <h2 className="font-display text-xl font-bold uppercase">Comprar ou renovar plano</h2>
          <p className="mt-2 text-sm text-muted-foreground">Pagamento via Pix confirmado pelo suporte. Após a confirmação, sua validade é estendida.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {plans.map(([p, d]) => <div key={p} className={`card-neon border bg-card p-4 ${account.plan === p ? 'border-primary' : 'border-border'}`}>
              <p className="font-display font-bold uppercase">{p}</p><p className="text-xs text-muted-foreground">{d}</p>
              <p className="mt-3 text-sm">Sob consulta</p>
              <Button asChild size="sm" className="mt-3 w-full"><a href="/#suporte">{account.plan === p ? <><Check className="mr-1 h-4 w-4" />Renovar</> : 'Comprar'}</a></Button>
            </div>)}
          </div>
        </section>
      </>}
    </main>
  </div>;
}
