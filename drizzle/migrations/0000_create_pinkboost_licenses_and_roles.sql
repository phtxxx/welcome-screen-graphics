CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
CREATE POLICY "Read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  plan text NOT NULL CHECK (plan IN ('Teste', 'Start', 'Pro', 'Elite', 'Anual')),
  duration_days integer NOT NULL CHECK (duration_days IN (7, 30, 90, 120, 365)),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'redeemed', 'revoked')),
  customer_email text,
  redeemed_by uuid,
  redeemed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL
);
GRANT SELECT ON public.licenses TO authenticated;
GRANT ALL ON public.licenses TO service_role;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin reads licenses" ON public.licenses FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customer reads licenses" ON public.licenses FOR SELECT TO authenticated USING (redeemed_by = auth.uid());
CREATE INDEX licenses_redeemed_by_idx ON public.licenses (redeemed_by);
CREATE INDEX licenses_created_at_idx ON public.licenses (created_at DESC);

CREATE FUNCTION public.redeem_license(_key_hash text)
RETURNS TABLE (license_id uuid, plan_name text, valid_until timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_license public.licenses;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  UPDATE public.licenses l
     SET status = 'redeemed', redeemed_by = auth.uid(), redeemed_at = now(),
         expires_at = now() + make_interval(days => l.duration_days)
   WHERE l.key_hash = _key_hash AND l.status = 'available'
     AND (l.customer_email IS NULL OR lower(l.customer_email) = lower(auth.jwt() ->> 'email'))
   RETURNING l.* INTO v_license;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invalid, unavailable or assigned to another account'; END IF;
  RETURN QUERY SELECT v_license.id, v_license.plan, v_license.expires_at;
END;
$$;
REVOKE ALL ON FUNCTION public.redeem_license(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_license(text) TO authenticated;