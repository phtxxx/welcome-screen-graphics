import { createServerFn } from '@tanstack/react-start';
import { createHash, randomBytes } from 'node:crypto';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

const durations: Record<string, number> = { Teste: 7, Start: 30, Pro: 90, Elite: 120, Anual: 365 };
const hashKey = (value: string) => createHash('sha256').update(value.trim().toUpperCase()).digest('hex');

export const getPanel = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: role, error: roleError } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (roleError) throw new Error('Não foi possível verificar o acesso.');
    if (role) {
      const { data, error } = await context.supabase.from('licenses').select('id,key_prefix,plan,duration_days,status,customer_email,redeemed_at,expires_at,created_at').order('created_at', { ascending: false });
      if (error) throw new Error('Não foi possível carregar as chaves.');
      return { admin: true, licenses: data ?? [] };
    }
    const { data, error } = await context.supabase.from('licenses').select('id,key_prefix,plan,duration_days,status,expires_at,created_at').eq('redeemed_by', context.userId).order('created_at', { ascending: false });
    if (error) throw new Error('Não foi possível carregar suas chaves.');
    return { admin: false, licenses: data ?? [] };
  });

export const issueLicense = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { plan: string; email: string }) => input)
  .handler(async ({ context, data }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (roleError || !admin) throw new Error('Acesso não autorizado.');
    const duration = durations[data.plan];
    if (!duration) throw new Error('Plano inválido.');
    const email = data.email.trim().toLowerCase();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('E-mail inválido.');
    const key = `PB-${randomBytes(4).toString('hex').toUpperCase()}-${randomBytes(4).toString('hex').toUpperCase()}-${randomBytes(4).toString('hex').toUpperCase()}`;
    const { error } = await context.supabase.from('licenses').insert({ key_hash: hashKey(key), key_prefix: key.slice(0, 11), plan: data.plan, duration_days: duration, customer_email: email || null, created_by: context.userId });
    if (error) throw new Error('Não foi possível gerar a chave.');
    return { key };
  });

export const redeemLicense = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { key: string }) => input)
  .handler(async ({ context, data }) => {
    if (!/^PB-[A-F0-9]{8}-[A-F0-9]{8}-[A-F0-9]{8}$/i.test(data.key.trim())) throw new Error('Formato de chave inválido.');
    const { data: result, error } = await context.supabase.rpc('redeem_license', { _key_hash: hashKey(data.key) });
    if (error || !result?.length) throw new Error('Chave inválida, já usada ou vinculada a outro e-mail.');
    return { plan: result[0].plan_name, expiresAt: result[0].valid_until };
  });


export const getMyAccount = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc('get_my_account');
    if (error || !data?.length) throw new Error('Não foi possível carregar sua conta.');
    return data[0];
  });

export const adminListAccounts = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (roleError || !admin) throw new Error('Acesso não autorizado.');
    const { data, error } = await context.supabase.rpc('admin_list_accounts');
    if (error) throw new Error('Não foi possível carregar os usuários.');
    return data ?? [];
  });

export const adminUpdateAccount = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; fullName: string; username: string; plan: string; status: string; validUntil: string | null }) => input)
  .handler(async ({ context, data }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (roleError || !admin) throw new Error('Acesso não autorizado.');
    const { error } = await context.supabase.rpc('admin_update_account', {
      _user_id: data.userId, _full_name: data.fullName, _username: data.username,
      _plan: data.plan, _status: data.status, _valid_until: data.validUntil,
    });
    if (error) throw new Error(error.message || 'Não foi possível atualizar o usuário.');
    return { ok: true };
  });

export const adminRevokeLicense = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { licenseId: string }) => input)
  .handler(async ({ context, data }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (roleError || !admin) throw new Error('Acesso não autorizado.');
    const { error } = await context.supabase.rpc('admin_revoke_license', { _license_id: data.licenseId });
    if (error) throw new Error(error.message || 'Não foi possível revogar a licença.');
    return { ok: true };
  });
