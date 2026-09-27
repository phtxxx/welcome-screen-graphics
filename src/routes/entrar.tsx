import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import logo from '@/assets/pinkboost-logo.png.asset.json';

export const Route = createFileRoute('/entrar')({
  head: () => ({ meta: [
    { title: 'Acesso administrativo | PINKBOOST' },
    { name: 'description', content: 'Login da equipe PINKBOOST para gerenciar clientes e keys.' },
    { property: 'og:title', content: 'Acesso administrativo | PINKBOOST' },
    { property: 'og:description', content: 'Login da equipe PINKBOOST para gerenciar clientes e keys.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: EntrarPage,
});

function EntrarPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg('');
    const { error } = mode === 'in'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/painel` } });
    setBusy(false);
    if (error) return setMsg(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error.message);
    if (mode === 'up') return setMsg('Conta criada. Confirme pelo link enviado ao seu e-mail.');
    navigate({ to: '/painel' });
  }

  return <div className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
    <form onSubmit={submit} className="w-full max-w-sm border border-border bg-card p-8">
      <Link to="/"><img src={logo.url} alt="PINKBOOST" className="mx-auto h-14 mix-blend-screen" /></Link>
      <h1 className="mt-4 text-center font-display text-xl font-bold uppercase">{mode === 'in' ? 'Acesso da equipe' : 'Criar conta da equipe'}</h1>
      <p className="mt-1 text-center text-xs text-muted-foreground">Clientes acessam pela <Link to="/cliente" className="text-primary">área do cliente</Link> com a key.</p>
      <input type="email" required placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="mt-6 h-10 w-full rounded-md border border-input bg-background px-3" />
      <input type="password" required minLength={6} placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="mt-3 h-10 w-full rounded-md border border-input bg-background px-3" />
      {msg && <p className="mt-3 text-sm text-primary">{msg}</p>}
      <Button type="submit" disabled={busy} className="mt-5 w-full">{mode === 'in' ? 'Entrar' : 'Criar conta'}</Button>
      <button type="button" onClick={() => setMode(mode === 'in' ? 'up' : 'in')} className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-primary">
        {mode === 'in' ? 'Primeiro acesso? Criar conta' : 'Já tenho conta'}
      </button>
    </form>
  </div>;
}
