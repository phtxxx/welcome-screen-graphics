import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { findByKey, toAccount, updateByKey } from '@/lib/customers.server';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

function readKey(request: Request, body?: { key?: unknown }) {
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return typeof body?.key === 'string' ? body.key : '';
}

export const Route = createFileRoute('/api/public/v1/license')({
  server: {
    handlers: {
      // Consulta: retorna dados da conta e se o plano está ativo
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({}));
        const row = await findByKey(readKey(request, body));
        if (!row) return json({ ok: false, error: 'invalid_key' }, 401);
        const account = toAccount(row);
        return json({ ok: true, plan_active: account.plan_active, account });
      },
      // Salva as configs do app desktop
      PUT: async ({ request }) => {
        const body = await request.json().catch(() => ({}));
        const parsed = z.object({ configs: z.record(z.string(), z.unknown()) }).safeParse(body);
        if (!parsed.success) return json({ ok: false, error: 'invalid_configs' }, 400);
        if (JSON.stringify(parsed.data.configs).length > 100_000) return json({ ok: false, error: 'configs_too_large' }, 413);
        try {
          const row = await updateByKey(readKey(request, body), { configs: parsed.data.configs });
          return json({ ok: true, account: toAccount(row) });
        } catch {
          return json({ ok: false, error: 'invalid_key' }, 401);
        }
      },
    },
  },
});
