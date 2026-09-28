import { createHash, randomBytes } from 'node:crypto';

export const PLAN_DAYS: Record<string, number> = { Teste: 7, Start: 30, Pro: 90, Elite: 120, Anual: 365 };
export const KEY_RE = /^PB-[A-F0-9]{8}-[A-F0-9]{8}-[A-F0-9]{8}$/;

export const normalizeKey = (k: string) => k.trim().toUpperCase();
export const hashKey = (k: string) => createHash('sha256').update(normalizeKey(k)).digest('hex');
export function generateKey() {
  const p = () => randomBytes(4).toString('hex').toUpperCase();
  return `PB-${p()}-${p()}-${p()}`;
}

type Row = {
  id: string; full_name: string | null; email: string | null; username: string | null;
  plan: string; status: string; duration_days: number; valid_until: string | null;
  activated_at: string | null; license_prefix: string; configs: unknown; created_at: string;
};

export function toAccount(r: Row) {
  const active = r.status === 'active' && !!r.valid_until && new Date(r.valid_until) > new Date();
  return {
    id: r.id, name: r.full_name, email: r.email, username: r.username,
    plan: r.plan, status: r.status, valid_until: r.valid_until,
    license: `${r.license_prefix}…`, plan_active: active,
    activated_at: r.activated_at, configs: r.configs ?? {}, created_at: r.created_at,
  };
}

/** Busca o cliente pela key; ativa a contagem de dias no primeiro uso. */
export async function findByKey(key: string) {
  const k = normalizeKey(key);
  if (!KEY_RE.test(k)) return null;
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data } = await supabaseAdmin.from('customer_accounts').select('*').eq('license_key_hash', hashKey(k)).maybeSingle();
  if (!data) return null;
  const patch: { last_seen_at: string; activated_at?: string; valid_until?: string } = { last_seen_at: new Date().toISOString() };
  if (!data.activated_at && data.status === 'active') {
    const now = new Date();
    patch.activated_at = now.toISOString();
    patch.valid_until = new Date(now.getTime() + data.duration_days * 86400000).toISOString();
  }
  const { data: updated } = await supabaseAdmin.from('customer_accounts').update(patch).eq('id', data.id).select('*').single();
  return (updated ?? data) as Row;
}

export async function updateByKey(key: string, patch: { username?: string | null; full_name?: string | null; configs?: unknown }) {
  const row = await findByKey(key);
  if (!row) throw new Error('Key inválida.');
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data, error } = await supabaseAdmin.from('customer_accounts').update(patch as never).eq('id', row.id).select('*').single();
  if (error) throw new Error(error.code === '23505' ? 'Esse @username já está em uso.' : 'Não foi possível salvar.');
  return data as Row;
}
