CREATE TABLE public.customer_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  email text,
  username text,
  plan text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  duration_days integer NOT NULL DEFAULT 30,
  valid_until timestamptz,
  activated_at timestamptz,
  license_key_hash text NOT NULL UNIQUE,
  license_prefix text NOT NULL,
  configs jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_seen_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX customer_accounts_username_key ON public.customer_accounts (lower(username)) WHERE username IS NOT NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_accounts TO authenticated;
GRANT ALL ON public.customer_accounts TO service_role;
ALTER TABLE public.customer_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage customers select" ON public.customer_accounts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage customers insert" ON public.customer_accounts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage customers update" ON public.customer_accounts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage customers delete" ON public.customer_accounts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE OR REPLACE FUNCTION public.touch_customer_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER customer_accounts_updated_at BEFORE UPDATE ON public.customer_accounts FOR EACH ROW EXECUTE FUNCTION public.touch_customer_updated_at();
COMMENT ON TABLE public.licenses IS 'DEPRECATED: replaced by customer_accounts';