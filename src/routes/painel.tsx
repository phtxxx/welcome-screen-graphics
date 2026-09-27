import { createFileRoute, Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useEffect, useMemo, useState } from 'react';
import { KeyRound, LogOut, Copy, RefreshCw, Users, ShieldCheck, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { amIAdmin, adminListCustomers, adminCreateKey, adminUpdateCustomer, adminResetKey, adminDeleteCustomer } from '@/lib/customers.functions';
import { Button } from '@/components/ui/button';
import logo from '@/assets/pinkboost-logo.png.asset.json';

export const Route = createFileRoute('/painel')({
  head: () => ({ meta: [
    { title: 'Painel administrativo | PINKBOOST' },
    { name: 'description', content: 'Gerencie clientes, vendas e keys PINKBOOST.' },
    { property: 'og:title', content: 'Painel administrativo | PINKBOOST' },
    { property: 'og:description', content: 'Gerencie clientes, vendas e keys PINKBOOST.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: PanelPage,
});

type Customer = Awaited<ReturnType<typeof adminListCustomers>>[number];
const plans = ['Teste', 'Start', 'Pro', 'Elite', 'Anual'] as const;
const statuses = ['active', 'suspended', 'blocked'] as const;
const fmt = (v: string | null) => (v ? new Date(v).toLocaleDateString('pt-BR') : 'Não ativada');
const input = 'mt-2 h-10 w-full rounded-md border border-input bg-background px-3';
const cleanErr = (e: unknown) => {
  const m = e instanceof Error ? e.message : 'Erro inesperado.';
  try { const j = JSON.parse(m); return Array.isArray(j) ? j[0]?.message : m; } catch { return m; }
};

function PanelPage() {
  const checkAdmin = useServerFn(amIAdmin);
  const list = useServerFn(adminListCustomers);
  const create = useServerFn(adminCreateKey);
  const update = useServerFn(adminUpdateCustomer);
  const resetKey = useServerFn(adminResetKey);
  const remove = useServerFn(adminDeleteCustomer);

  const [session, setSession] = useState<'loading' | 'out' | 'in'>('loading');
  const [admin, setAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Customer[]>([]);
  const [sel, setSel] = useState<Customer | null>(null);
  const [err, setErr] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [sale, setSale] = useState({ plan: 'Start' as (typeof plans)[number], name: '', email: '' });
  const [newKey, setNewKey] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ? 'in' : 'out'));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s ? 'in' : 'out'));
    return () => data.subscription.unsubscribe();
  }, []);

  async function refresh() {
    try { const { admin } = await checkAdmin(); setAdmin(admin); if (admin) setRows(await list()); }
    catch (e) { setErr(cleanErr(e)); }
  }
  useEffect(() => { if (session === 'in') refresh(); }, [session]);

  async function run(fn: () => Promise<void>) {
    setBusy(true); setErr(''); setNotice('');
    try { await fn(); } catch (e) { setErr(cleanErr(e)); } finally { setBusy(false); }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? rows.filter(r => [r.name, r.email, r.username, r.plan, r.status, r.license].some(v => v?.toLowerCase().includes(q))) : rows;
  }, [rows, search]);

  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
      <Link to="/"><img src={logo.url} alt="PINKBOOST" className="h-12 mix-blend-screen" /></Link>
      {session === 'in' && <Button variant="ghost" onClick={() => supabase.auth.signOut()}><LogOut className="mr-2 h-4 w-4" />Sair</Button>}
    </div></header>

    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex items-center gap-3 text-primary"><KeyRound /><span className="font-display text-xs font-bold uppercase">Área da equipe</span></div>
      <h1 className="mt-3 font-display text-3xl font-bold uppercase sm:text-4xl">Painel administrativo</h1>

      {session === 'loading' && <p className="mt-10 text-muted-foreground">Carregando...</p>}
      {session === 'out' && <div className="mt-10"><p className="mb-5 text-muted-foreground">Entre com sua conta da equipe.</p><Button asChild><Link to="/entrar">Entrar</Link></Button></div>}
      {session === 'in' && admin === false && <p className="mt-10 text-muted-foreground">Sua conta ainda não tem permissão de administrador. Clientes acessam pela <Link to="/cliente" className="text-primary">área do cliente</Link>.</p>}

      {session === 'in' && admin && <>
        {err && <p role="alert" className="mt-6 border-l-2 border-destructive bg-destructive/10 p-3 text-sm">{err}</p>}
        {notice && <p role="status" className="mt-6 border-l-2 border-primary bg-primary/10 p-3 text-sm">{notice}</p>}

        <section className="mt-10 border border-border bg-card p-6">
          <div className="flex items-center gap-2"><ShieldCheck className="text-primary" /><h2 className="font-display text-xl font-bold uppercase">Vendas — gerar key</h2></div>
          <p className="mt-2 text-sm text-muted-foreground">Gere após confirmar o Pix. A validade começa a contar no primeiro uso da key. A key completa aparece só uma vez.</p>
          <form onSubmit={e => { e.preventDefault(); run(async () => { const r = await create({ data: sale }); setNewKey(r.key); setSale({ ...sale, name: '', email: '' }); await refresh(); }); }} className="mt-5 grid gap-3 sm:grid-cols-4 sm:items-end">
            <label className="text-sm">Plano<select className={input} value={sale.plan} onChange={e => setSale({ ...sale, plan: e.target.value as typeof sale.plan })}>{plans.map(p => <option key={p}>{p}</option>)}</select></label>
            <label className="text-sm">Nome do cliente<input className={input} value={sale.name} onChange={e => setSale({ ...sale, name: e.target.value })} /></label>
            <label className="text-sm">E-mail do cliente<input type="email" className={input} value={sale.email} onChange={e => setSale({ ...sale, email: e.target.value })} /></label>
            <Button type="submit" disabled={busy}>Gerar key</Button>
          </form>
          {newKey && <div className="mt-5 flex flex-wrap items-center gap-3 border border-primary/40 bg-primary/10 p-4">
            <code className="break-all font-display text-lg text-primary">{newKey}</code>
            <Button size="icon" variant="outline" title="Copiar" onClick={() => navigator.clipboard.writeText(newKey)}><Copy /></Button>
          </div>}
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2"><Users className="text-primary" /><h2 className="font-display text-xl font-bold uppercase">Clientes ({rows.length})</h2></div>
            <div className="flex gap-2"><input className="h-10 w-64 rounded-md border border-input bg-background px-3 text-sm" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} /><Button variant="ghost" size="icon" title="Atualizar" onClick={refresh}><RefreshCw /></Button></div>
          </div>
          <div className="mt-5 overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="border-b border-border bg-card"><tr>{['ID', 'Nome', 'E-mail', '@username', 'Plano', 'Status', 'Validade', 'Key', ''].map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead>
              <tbody>{filtered.map(r => <tr key={r.id} className="border-b border-border last:border-0">
                <td className="p-3 font-mono text-xs text-muted-foreground">{r.id.slice(0, 8)}</td>
                <td className="p-3">{r.name || '—'}</td>
                <td className="p-3">{r.email || '—'}</td>
                <td className="p-3">{r.username ? `@${r.username}` : '—'}</td>
                <td className="p-3">{r.plan}</td>
                <td className={`p-3 ${r.plan_active ? 'text-primary' : 'text-muted-foreground'}`}>{r.plan_active ? 'Ativo' : r.status === 'active' ? (r.valid_until ? 'Expirado' : 'Aguardando') : r.status}</td>
                <td className="p-3">{fmt(r.valid_until)}</td>
                <td className="p-3 font-mono text-xs">{r.license}</td>
                <td className="p-3"><Button size="sm" variant="outline" onClick={() => setSel({ ...r })}>Gerenciar</Button></td>
              </tr>)}</tbody>
            </table>
            {!filtered.length && <p className="p-6 text-center text-muted-foreground">Nenhum cliente ainda.</p>}
          </div>

          {sel && <div className="mt-6 border border-primary/30 bg-card p-6">
            <div className="flex items-center justify-between"><h3 className="font-display text-lg font-bold uppercase">Gerenciar cliente</h3><Button variant="ghost" onClick={() => setSel(null)}>Fechar</Button></div>
            <form onSubmit={e => { e.preventDefault(); run(async () => {
              await update({ data: { id: sel.id, name: sel.name ?? '', email: sel.email ?? '', username: sel.username ?? '', plan: sel.plan as (typeof plans)[number], status: sel.status as (typeof statuses)[number], validUntil: sel.valid_until } });
              setNotice('Cliente atualizado.'); setSel(null); await refresh();
            }); }} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm">Nome<input className={input} value={sel.name ?? ''} onChange={e => setSel({ ...sel, name: e.target.value })} /></label>
              <label className="text-sm">E-mail<input className={input} value={sel.email ?? ''} onChange={e => setSel({ ...sel, email: e.target.value })} /></label>
              <label className="text-sm">@username<input className={input} value={sel.username ?? ''} onChange={e => setSel({ ...sel, username: e.target.value.toLowerCase() })} /></label>
              <label className="text-sm">Plano<select className={input} value={sel.plan} onChange={e => setSel({ ...sel, plan: e.target.value })}>{plans.map(p => <option key={p}>{p}</option>)}</select></label>
              <label className="text-sm">Status<select className={input} value={sel.status} onChange={e => setSel({ ...sel, status: e.target.value })}>{statuses.map(s => <option key={s} value={s}>{({ active: 'Ativo', suspended: 'Suspenso', blocked: 'Bloqueado' })[s]}</option>)}</select></label>
              <label className="text-sm">Validade<input type="date" className={input} value={sel.valid_until ? sel.valid_until.slice(0, 10) : ''} onChange={e => setSel({ ...sel, valid_until: e.target.value ? new Date(`${e.target.value}T23:59:59`).toISOString() : null })} /></label>
              <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-3">
                <Button type="submit" disabled={busy}>Salvar</Button>
                <Button type="button" variant="outline" disabled={busy} onClick={() => run(async () => { if (!confirm('Gerar nova key? A antiga deixa de funcionar.')) return; const r = await resetKey({ data: { id: sel.id } }); setNewKey(r.key); setNotice('Nova key gerada — copie no topo da página.'); setSel(null); await refresh(); window.scrollTo({ top: 0, behavior: 'smooth' }); })}>Gerar nova key</Button>
                <Button type="button" variant="destructive" disabled={busy} onClick={() => run(async () => { if (!confirm('Excluir este cliente definitivamente?')) return; await remove({ data: { id: sel.id } }); setNotice('Cliente excluído.'); setSel(null); await refresh(); })}><Trash2 className="mr-2 h-4 w-4" />Excluir</Button>
              </div>
            </form>
          </div>}
        </section>
      </>}
    </main>
  </div>;
}
