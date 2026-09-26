import { createFileRoute, Link, useServerFn } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { KeyRound, LogOut, Copy, ArrowLeft, RefreshCw, Users, ShieldCheck, Ban } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  getPanel, issueLicense, redeemLicense, getMyAccount,
  adminListAccounts, adminUpdateAccount, adminRevokeLicense,
} from '@/lib/licenses.functions';
import { Button } from '@/components/ui/button';
import logo from '@/assets/pinkboost-logo.png.asset.json';

type Panel = Awaited<ReturnType<typeof getPanel>>;
type Account = Awaited<ReturnType<typeof adminListAccounts>>[number];

export const Route = createFileRoute('/painel')({
  head: () => ({ meta: [
    { title: 'Painel | PINKBOOST' },
    { name: 'description', content: 'Gerencie sua conta, licenças e usuários PINKBOOST.' },
    { property: 'og:title', content: 'Painel | PINKBOOST' },
    { property: 'og:description', content: 'Gerencie sua conta, licenças e usuários PINKBOOST.' },
    { property: 'og:type', content: 'website' },
  ] }),
  component: PanelPage,
});

const plans = ['Teste', 'Start', 'Pro', 'Elite', 'Anual'];
const statuses = ['active', 'suspended', 'blocked'];

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString('pt-BR') : '—';
}

function PanelPage() {
  const fetchPanel = useServerFn(getPanel);
  const create = useServerFn(issueLicense);
  const redeem = useServerFn(redeemLicense);
  const fetchAccount = useServerFn(getMyAccount);
  const fetchAccounts = useServerFn(adminListAccounts);
  const updateAccount = useServerFn(adminUpdateAccount);
  const revokeLicense = useServerFn(adminRevokeLicense);

  const [session, setSession] = useState<'loading' | 'out' | 'in'>('loading');
  const [panel, setPanel] = useState<Panel | null>(null);
  const [account, setAccount] = useState<Awaited<ReturnType<typeof getMyAccount>> | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selected, setSelected] = useState<Account | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState('Start');
  const [email, setEmail] = useState('');
  const [key, setKey] = useState('');
  const [newKey, setNewKey] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => { if (active) setSession(data.session ? 'in' : 'out'); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => { if (active) setSession(next ? 'in' : 'out'); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  async function refresh() {
    try {
      const p = await fetchPanel();
      setPanel(p);
      const a = await fetchAccount();
      setAccount(a);
      if (p.admin) setAccounts(await fetchAccounts());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar.');
    }
  }

  useEffect(() => {
    if (session !== 'in') return;
    refresh();
  }, [session]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setNotice(''); setNewKey('');
    try { const result = await create({ data: { plan, email } }); setNewKey(result.key); setNotice('Chave gerada. Copie-a agora, pois ela não será exibida novamente.'); await refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Falha ao gerar chave.'); }
    finally { setBusy(false); }
  }

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    try { const result = await redeem({ data: { key } }); setNotice(`Plano ${result.plan} ativado até ${formatDate(result.expiresAt)}.`); setKey(''); await refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Falha ao ativar chave.'); }
    finally { setBusy(false); }
  }

  async function handleUpdateAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await updateAccount({ data: {
        userId: selected.user_id,
        fullName: selected.full_name ?? '',
        username: selected.username ?? '',
        plan: selected.plan,
        status: selected.status,
        validUntil: selected.valid_until,
      }});
      setNotice('Usuário atualizado com sucesso.');
      setSelected(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar o usuário.');
    } finally { setBusy(false); }
  }

  async function handleRevoke(licenseId: string) {
    if (!window.confirm('Revogar esta licença? Esta ação não pode ser desfeita.')) return;
    setBusy(true); setError(''); setNotice('');
    try { await revokeLicense({ data: { licenseId } }); setNotice('Licença revogada.'); await refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível revogar a licença.'); }
    finally { setBusy(false); }
  }

  const filteredAccounts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(a => [a.full_name, a.email, a.username, a.plan, a.status].some(v => v?.toLowerCase().includes(q)));
  }, [accounts, search]);

  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
      <Link to="/"><img src={logo.url} alt="PINKBOOST" className="h-12 mix-blend-screen" /></Link>
      <div className="flex gap-2">
        <Button asChild variant="ghost" size="icon" title="Voltar ao site"><Link to="/"><ArrowLeft /></Link></Button>
        {session === 'in' && <Button variant="ghost" size="icon" title="Sair" onClick={() => supabase.auth.signOut()}><LogOut /></Button>}
      </div>
    </div></header>

    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex items-center gap-3 text-primary"><KeyRound /><span className="font-display text-xs font-bold uppercase">Área protegida</span></div>
      <h1 className="mt-3 font-display text-3xl font-bold uppercase sm:text-4xl">{panel?.admin ? 'Painel administrativo' : 'Minha conta'}</h1>

      {session === 'loading' && <p className="mt-10 text-muted-foreground">Carregando...</p>}
      {session === 'out' && <div className="mt-10"><p className="mb-5 text-muted-foreground">Entre na sua conta para acessar o painel.</p><Button asChild><Link to="/entrar">Entrar ou criar conta</Link></Button></div>}

      {session === 'in' && <>
        {error && <p role="alert" className="mt-6 border-l-2 border-destructive bg-destructive/10 p-3 text-sm">{error}</p>}
        {notice && <p role="status" className="mt-6 border-l-2 border-primary bg-primary/10 p-3 text-sm">{notice}</p>}

        {account && <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Usuário', account.username ? `@${account.username}` : account.email ?? '—'],
            ['Plano', account.plan],
            ['Status', account.status === 'active' ? 'Ativo' : account.status === 'suspended' ? 'Suspenso' : 'Bloqueado'],
            ['Validade', formatDate(account.valid_until)],
          ].map(([label, value]) => <div key={label} className="border border-border bg-card p-4"><p className="text-xs uppercase text-muted-foreground">{label}</p><p className="mt-2 font-display font-bold">{value}</p></div>)}
        </section>}

        {panel?.admin && <section className="mt-10 border-t border-border pt-8">
          <div className="flex items-center gap-2"><ShieldCheck className="text-primary" /><h2 className="font-display text-xl font-bold uppercase">Emitir licença</h2></div>
          <p className="mt-2 text-sm text-muted-foreground">Emita somente após confirmar o pagamento. A chave completa aparece uma única vez.</p>
          <form onSubmit={handleCreate} className="mt-6 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-2 text-sm">Plano<select className="h-10 min-w-40 rounded-md border border-input bg-background px-3" value={plan} onChange={e => setPlan(e.target.value)}>{plans.map(p => <option key={p}>{p}</option>)}</select></label>
            <label className="flex flex-col gap-2 text-sm">E-mail do cliente<input type="email" className="h-10 min-w-64 rounded-md border border-input bg-background px-3" placeholder="cliente@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} /></label>
            <Button type="submit" disabled={busy}>Gerar chave</Button>
          </form>
          {newKey && <div className="mt-6 border border-primary/40 bg-primary/10 p-5"><p className="mb-2 text-xs text-muted-foreground">Copie agora; por segurança a chave não será mostrada novamente.</p><div className="flex flex-wrap items-center gap-3"><code className="break-all font-display text-lg text-primary">{newKey}</code><Button size="icon" variant="outline" title="Copiar chave" onClick={() => navigator.clipboard.writeText(newKey)}><Copy /></Button></div></div>}
        </section>}

        {!panel?.admin && <section className="mt-10 border-t border-border pt-8">
          <h2 className="font-display text-xl font-bold uppercase">Ativar licença</h2>
          <form onSubmit={handleRedeem} className="mt-5 flex flex-wrap gap-3"><input aria-label="Chave de ativação" required className="h-10 min-w-64 flex-1 rounded-md border border-input bg-background px-3 font-mono" placeholder="PB-XXXXXXXX-XXXXXXXX-XXXXXXXX" value={key} onChange={e => setKey(e.target.value.toUpperCase())} /><Button type="submit" disabled={busy}>Ativar</Button></form>
        </section>}

        {panel?.admin && <section className="mt-12 border-t border-border pt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2"><Users className="text-primary" /><h2 className="font-display text-xl font-bold uppercase">Usuários</h2></div>
            <div className="flex gap-2"><input className="h-10 w-64 rounded-md border border-input bg-background px-3 text-sm" placeholder="Buscar nome, e-mail ou plano..." value={search} onChange={e => setSearch(e.target.value)} /><Button variant="ghost" size="icon" title="Atualizar" onClick={refresh}><RefreshCw /></Button></div>
          </div>
          <div className="mt-5 overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-border bg-card"><tr><th className="p-3">Usuário</th><th className="p-3">Plano</th><th className="p-3">Status</th><th className="p-3">Validade</th><th className="p-3">Licença</th><th className="p-3">Ação</th></tr></thead>
              <tbody>{filteredAccounts.map(a => <tr key={a.user_id} className="border-b border-border last:border-0">
                <td className="p-3"><strong>{a.full_name || 'Sem nome'}</strong><div className="text-xs text-muted-foreground">{a.email}{a.username ? ` · @${a.username}` : ''}</div></td>
                <td className="p-3">{a.plan}</td><td className="p-3">{a.status}</td><td className="p-3">{formatDate(a.valid_until)}</td>
                <td className="p-3">{a.license_prefix ? `${a.license_prefix}… · ${a.license_status}` : '—'}</td>
                <td className="p-3"><Button size="sm" variant="outline" onClick={() => setSelected({...a})}>Gerenciar</Button></td>
              </tr>)}</tbody>
            </table>
            {!filteredAccounts.length && <p className="p-6 text-center text-muted-foreground">Nenhum usuário encontrado.</p>}
          </div>

          {selected && <div className="mt-6 border border-primary/30 bg-card p-6">
            <div className="flex items-center justify-between"><h3 className="font-display text-lg font-bold uppercase">Gerenciar conta</h3><Button variant="ghost" onClick={() => setSelected(null)}>Fechar</Button></div>
            <form onSubmit={handleUpdateAccount} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm">Nome<input className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3" value={selected.full_name ?? ''} onChange={e => setSelected({...selected, full_name:e.target.value})} /></label>
              <label className="text-sm">Username<input className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3" value={selected.username ?? ''} onChange={e => setSelected({...selected, username:e.target.value.toLowerCase()})} /></label>
              <label className="text-sm">Plano<select className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3" value={selected.plan} onChange={e => setSelected({...selected, plan:e.target.value})}>{plans.map(p => <option key={p}>{p}</option>)}</select></label>
              <label className="text-sm">Status<select className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3" value={selected.status} onChange={e => setSelected({...selected, status:e.target.value})}>{statuses.map(s => <option key={s}>{s}</option>)}</select></label>
              <label className="text-sm">Validade<input type="datetime-local" className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3" value={selected.valid_until ? new Date(selected.valid_until).toISOString().slice(0,16) : ''} onChange={e => setSelected({...selected, valid_until:e.target.value ? new Date(e.target.value).toISOString() : null})} /></label>
              <div className="flex items-end gap-2"><Button type="submit" disabled={busy}>Salvar alterações</Button>{selected.license_id && <Button type="button" variant="destructive" disabled={busy} onClick={() => handleRevoke(selected.license_id!)}><Ban className="mr-2 h-4 w-4" />Revogar licença</Button>}</div>
            </form>
          </div>}
        </section>}

        <section className="mt-12 border-t border-border pt-8">
          <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold uppercase">{panel?.admin ? 'Licenças emitidas' : 'Minhas licenças'}</h2><Button variant="ghost" size="icon" title="Atualizar" onClick={refresh}><RefreshCw /></Button></div>
          {!panel && <p className="mt-6 text-muted-foreground">Carregando...</p>}
          {panel?.licenses.length === 0 && <p className="mt-6 text-muted-foreground">Nenhuma licença por aqui ainda.</p>}
          <div className="mt-5 grid gap-2">{panel?.licenses.map(item => <div key={item.id} className="grid gap-2 border border-border bg-card p-4 text-sm sm:grid-cols-[1fr_1fr_1fr_1fr_auto] sm:items-center">
            <div><strong className="font-display uppercase">{item.plan}</strong><p className="text-xs text-muted-foreground">{item.duration_days} dias</p></div>
            <code className="text-muted-foreground">{item.key_prefix}…</code>
            <span className={item.status === 'redeemed' ? 'text-primary' : item.status === 'revoked' ? 'text-destructive' : 'text-muted-foreground'}>{item.status === 'redeemed' ? 'Ativa' : item.status === 'revoked' ? 'Revogada' : 'Disponível'}</span>
            <span className="break-all text-muted-foreground">{item.expires_at ? `Até ${formatDate(item.expires_at)}` : 'Ainda não ativada'}{'customer_email' in item && item.customer_email ? ` · ${item.customer_email}` : ''}</span>
            {panel?.admin && item.status !== 'revoked' && <Button size="sm" variant="ghost" onClick={() => handleRevoke(item.id)} disabled={busy}>Revogar</Button>}
          </div>)}</div>
        </section>
      </>}
    </main>
  </div>;
}
