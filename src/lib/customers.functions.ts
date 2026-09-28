import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { PLAN_DAYS, generateKey, hashKey, toAccount, findByKey, updateByKey } from './customers.server';

type Ctx = { supabase: any; userId: string };
async function assertAdmin(ctx: Ctx) {
  const { data, error } = await ctx.supabase.rpc('has_role', { _user_id: ctx.userId, _role: 'admin' });
  if (error || !data) throw new Error('Acesso não autorizado.');
}

const usernameSchema = z.string().trim().toLowerCase().regex(/^[a-z0-9_.]{3,20}$/, 'Username: 3 a 20 caracteres (letras, números, _ ou .)');

export const amIAdmin = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    return { admin: !!data };
  });

export const adminListCustomers = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase.from('customer_accounts').select('*').order('created_at', { ascending: false });
    if (error) throw new Error('Não foi possível carregar os clientes.');
    return (data ?? []).map((r) => ({ ...toAccount(r), duration_days: r.duration_days, configs: undefined }));
  });

export const adminCreateKey = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    plan: z.enum(['Teste', 'Start', 'Pro', 'Elite', 'Anual']),
    name: z.string().trim().max(80).optional().default(''),
    email: z.union([z.literal(''), z.string().trim().toLowerCase().email('E-mail inválido')]).default(''),
  }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const key = generateKey();
    const { error } = await context.supabase.from('customer_accounts').insert({
      plan: data.plan, duration_days: PLAN_DAYS[data.plan] ?? 30, full_name: data.name || null, email: data.email || null,
      license_key_hash: hashKey(key), license_prefix: key.slice(0, 11), created_by: context.userId,
    });
    if (error) throw new Error('Não foi possível gerar a key.');
    return { key };
  });

export const adminUpdateCustomer = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid(),
    name: z.string().trim().max(80),
    email: z.union([z.literal(''), z.string().trim().toLowerCase().email('E-mail inválido')]),
    username: z.union([z.literal(''), usernameSchema]),
    plan: z.enum(['Teste', 'Start', 'Pro', 'Elite', 'Anual']),
    status: z.enum(['active', 'suspended', 'blocked']),
    validUntil: z.string().nullable(),
  }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from('customer_accounts').update({
      full_name: data.name || null, email: data.email || null, username: data.username || null,
      plan: data.plan, status: data.status, valid_until: data.validUntil,
      ...(data.validUntil ? { activated_at: new Date().toISOString() } : {}),
    }).eq('id', data.id);
    if (error) throw new Error(error.code === '23505' ? 'Esse @username já está em uso.' : 'Não foi possível salvar.');
    return { ok: true };
  });

export const adminResetKey = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const key = generateKey();
    const { error } = await context.supabase.from('customer_accounts').update({ license_key_hash: hashKey(key), license_prefix: key.slice(0, 11) }).eq('id', data.id);
    if (error) throw new Error('Não foi possível gerar nova key.');
    return { key };
  });

export const adminDeleteCustomer = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from('customer_accounts').delete().eq('id', data.id);
    if (error) throw new Error('Não foi possível excluir.');
    return { ok: true };
  });

// ---- Área do cliente (acesso pela key) ----
export const customerLogin = createServerFn({ method: 'POST' })
  .inputValidator((d) => z.object({ key: z.string().max(40) }).parse(d))
  .handler(async ({ data }) => {
    const row = await findByKey(data.key);
    if (!row) throw new Error('Key inválida.');
    if (row.status === 'blocked') throw new Error('Esta conta está bloqueada. Fale com o suporte.');
    return toAccount(row);
  });

export const customerUpdateProfile = createServerFn({ method: 'POST' })
  .inputValidator((d) => z.object({
    key: z.string().max(40),
    name: z.string().trim().max(80),
    username: usernameSchema,
  }).parse(d))
  .handler(async ({ data }) => toAccount(await updateByKey(data.key, { full_name: data.name || null, username: data.username })));
