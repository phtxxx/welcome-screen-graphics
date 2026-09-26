import { createFileRoute, Link, useServerFn } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { KeyRound, LogOut, Copy, ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getPanel, issueLicense, redeemLicense } from '@/lib/licenses.functions';
import { Button } from '@/components/ui/button';
import logo from '@/assets/pinkboost-logo.png.asset.json';

type Panel = Awaited<ReturnType<typeof getPanel>>;
export const Route = createFileRoute('/painel')({
  head: () => ({ meta: [
    { title: 'Painel de chaves | PINKBOOST' },
    { name: 'description', content: 'Gerencie e resgate suas chaves PINKBOOST.' },
    { property: 'og:title', content: 'Painel de chaves | PINKBOOST' },
    { property: 'og:description', content: 'Gerencie e resgate suas chaves PINKBOOST.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
  ] }), component: PanelPage,
});

const plans = ['Teste', 'Start', 'Pro', 'Elite', 'Anual'];
function PanelPage() {
  const fetchPanel = useServerFn(getPanel);
  const create = useServerFn(issueLicense);
  const redeem = useServerFn(redeemLicense);
  const [session, setSession] = useState<'loading' | 'out' | 'in'>('loading');
  const [panel, setPanel] = useState<Panel | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState('Start');
  const [email, setEmail] = useState('');
  const [key, setKey] = useState('');
  const [newKey, setNewKey] = useState('');
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => { if (active) setSession(data.session ? 'in' : 'out'); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { if (active) setSession(session ? 'in' : 'out'); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    if (session !== 'in') return;
    let active = true;
    fetchPanel().then((result) => { if (active) setPanel(result); }).catch(() => { if (active) setError('Não foi possível carregar o painel.'); });
    return () => { active = false; };
  }, [session, fetchPanel]);
  async function refresh() { try { setPanel(await fetchPanel()); setError(''); } catch { setError('Não foi possível atualizar.'); } }
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setNotice(''); setNewKey('');
    try { const result = await create({ data: { plan, email } }); setNewKey(result.key); await refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Falha ao gerar chave.'); }
    finally { setBusy(false); }
  }
  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    try { const result = await redeem({ data: { key } }); setNotice(`Plano ${result.plan} ativado com sucesso.`); setKey(''); await refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Falha ao ativar chave.'); }
    finally { setBusy(false); }
  }
  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
      <Link to="/"><img src={logo.url} alt="PINKBOOST" className="h-12 mix-blend-screen" /></Link>
      <div className="flex gap-2"><Button asChild variant="ghost" size="icon" title="Voltar ao site"><Link to="/"><ArrowLeft /></Link></Button>{session === 'in' && <Button variant="ghost" size="icon" title="Sair" onClick={() => supabase.auth.signOut()}><LogOut /></Button>}</div>
    </div></header>
    <main className="mx-auto max-w-6xl px-5 py-14">
      <div className="flex items-center gap-3 text-primary"><KeyRound /><span className="font-display text-xs font-bold uppercase">Área de chaves</span></div>
      <h1 className="mt-3 font-display text-3xl font-bold uppercase sm:text-4xl">{panel?.admin ? 'Painel administrativo' : 'Minhas chaves'}</h1>
      {session === 'loading' && <p className="mt-10 text-muted-foreground">Carregando...</p>}
      {session === 'out' && <div className="mt-10"><p className="mb-5 text-muted-foreground">Entre na sua conta para acessar suas chaves.</p><Button asChild><Link to="/entrar">Entrar ou criar conta</Link></Button></div>}
      {session === 'in' && <>
        {error && <p role="alert" className="mt-6 border-l-2 border-destructive bg-destructive/10 p-3 text-sm">{error}</p>}
        {notice && <p role="status" className="mt-6 border-l-2 border-primary bg-primary/10 p-3 text-sm">{notice}</p>}
        {panel?.admin && <section className="mt-10 border-t border-border pt-8"><h2 className="font-display text-xl font-bold uppercase">Gerar chave</h2><p className="mt-2 text-sm text-muted-foreground">Emita apenas após confirmar o pagamento. A chave completa aparece uma única vez.</p>
          <form onSubmit={handleCreate} className="mt-6 flex flex-wrap items-end gap-3"><label className="flex flex-col gap-2 text-sm">Plano<select className="h-10 min-w-40 rounded-md border border-input bg-background px-3" value={plan} onChange={e => setPlan(e.target.value)}>{plans.map(p => <option key={p}>{p}</option>)}</select></label>
          <label className="flex flex-col gap-2 text-sm">E-mail do cliente (opcional)<input type="email" className="h-10 min-w-64 rounded-md border border-input bg-background px-3" placeholder="cliente@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} /></label>
          <Button type="submit" disabled={busy}>Gerar chave</Button></form>
          {newKey && <div className="mt-6 border border-primary/40 bg-primary/10 p-5"><p className="mb-2 text-xs text-muted-foreground">Copie agora; por segurança a chave não será mostrada novamente.</p><div className="flex flex-wrap items-center gap-3"><code className="break-all font-display text-lg text-primary">{newKey}</code><Button size="icon" variant="outline" title="Copiar chave" onClick={() => navigator.clipboard.writeText(newKey)}><Copy /></Button></div></div>}
        </section>}
        {!panel?.admin && <section className="mt-10 border-t border-border pt-8"><h2 className="font-display text-xl font-bold uppercase">Ativar chave</h2><form onSubmit={handleRedeem} className="mt-5 flex flex-wrap gap-3"><input aria-label="Chave de ativação" required className="h-10 min-w-64 flex-1 rounded-md border border-input bg-background px-3 font-mono" placeholder="PB-XXXXXXXX-XXXXXXXX-XXXXXXXX" value={key} onChange={e => setKey(e.target.value)} /><Button type="submit" disabled={busy}>Ativar</Button></form></section>}
        <section className="mt-12 border-t border-border pt-8"><div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold uppercase">{panel?.admin ? 'Chaves emitidas' : 'Minhas licenças'}</h2><Button variant="ghost" size="icon" title="Atualizar" onClick={refresh}><RefreshCw /></Button></div>
          {!panel && <p className="mt-6 text-muted-foreground">Carregando...</p>}
          {panel?.licenses.length === 0 && <p className="mt-6 text-muted-foreground">Nenhuma chave por aqui ainda.</p>}
          <div className="mt-5 grid gap-2">{panel?.licenses.map(item => <div key={item.id} className="grid gap-2 border border-border bg-card p-4 text-sm sm:grid-cols-[1fr_1fr_1fr_1fr] sm:items-center"><div><strong className="font-display uppercase">{item.plan}</strong><p className="text-xs text-muted-foreground">{item.duration_days} dias</p></div><code className="text-muted-foreground">{item.key_prefix}…</code><span className={item.status === 'redeemed' ? 'text-primary' : 'text-muted-foreground'}>{item.status === 'redeemed' ? 'Ativa' : item.status === 'revoked' ? 'Revogada' : 'Disponível'}</span><span className="break-all text-muted-foreground">{item.expires_at ? `Até ${new Date(item.expires_at).toLocaleDateString('pt-BR')}` : 'Ainda não ativada'}{'customer_email' in item && item.customer_email ? ` · ${item.customer_email}` : ''}</span></div>)}</div>
        </section>
      </>}
    </main>
  </div>;
}
