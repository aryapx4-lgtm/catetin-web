-- =============================================================================
-- Migration 0002: robustness, performa, purpose column, auth link.
-- Jalankan manual di Supabase SQL Editor.
-- =============================================================================

-- 1. UNIQUE & NOT NULL pada midtrans_order_id (kritikal untuk idempotency webhook)
UPDATE public.payments
   SET midtrans_order_id = 'LEGACY-' || id::text
 WHERE midtrans_order_id IS NULL;

ALTER TABLE public.payments
  ALTER COLUMN midtrans_order_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_payments_order_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'uq_payments_order_id'
  ) THEN
    ALTER TABLE public.payments
      ADD CONSTRAINT uq_payments_order_id UNIQUE (midtrans_order_id);
  END IF;
END$$;

-- 2. Kolom purpose top-level (selain di JSONB)
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS purpose text NOT NULL DEFAULT 'new'
    CHECK (purpose IN ('new','renew','upgrade'));

-- Backfill dari checkout_data JSONB
UPDATE public.payments
   SET purpose = (checkout_data->>'purpose')
 WHERE checkout_data ? 'purpose'
   AND (checkout_data->>'purpose') IN ('new','renew','upgrade')
   AND purpose = 'new';

-- Backfill dari prefix order_id (untuk row lama)
UPDATE public.payments SET purpose = 'renew'
 WHERE midtrans_order_id LIKE 'RNW-%' AND purpose = 'new';

UPDATE public.payments SET purpose = 'upgrade'
 WHERE midtrans_order_id LIKE 'UPG-%' AND purpose = 'new';

-- 3. Index untuk performa query yang sering dipakai
CREATE INDEX IF NOT EXISTS idx_database_user_email
  ON public."Database_User" (lower(email));

CREATE INDEX IF NOT EXISTS idx_database_user_group_id
  ON public."Database_User" (group_id);

CREATE INDEX IF NOT EXISTS idx_payments_phone_created
  ON public.payments (phone_number, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_purpose
  ON public.payments (purpose);

-- 4. Link ke Supabase auth.users (lebih robust dari pada match by email string)
ALTER TABLE public."Database_User"
  ADD COLUMN IF NOT EXISTS auth_user_id uuid
    REFERENCES auth.users(id) ON DELETE SET NULL;

-- Backfill auth_user_id dengan match email
UPDATE public."Database_User" du
   SET auth_user_id = u.id
  FROM auth.users u
 WHERE du.auth_user_id IS NULL
   AND du.email IS NOT NULL
   AND lower(du.email) = lower(u.email);

CREATE INDEX IF NOT EXISTS idx_database_user_auth_user_id
  ON public."Database_User" (auth_user_id);

-- 5. Trigger updated_at — agar otomatis ter-update saat row di-update
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_database_user_touch ON public."Database_User";
CREATE TRIGGER trg_database_user_touch
BEFORE UPDATE ON public."Database_User"
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_user_state_touch ON public.user_state;
CREATE TRIGGER trg_user_state_touch
BEFORE UPDATE ON public.user_state
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 6. Drop kolom invite_code (sekarang pakai nomor telepon, tidak perlu lagi)
ALTER TABLE public."Database_User"
  DROP COLUMN IF EXISTS invite_code,
  DROP COLUMN IF EXISTS invite_code_expires;

-- 7. (Opsional) drop tabel invite_codes — uncomment kalau yakin gak dipakai sistem lain
DROP TABLE IF EXISTS public.invite_codes;
