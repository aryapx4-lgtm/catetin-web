-- =============================================================================
-- Migration 0003: LID mappings untuk handle WhatsApp @lid identifier.
-- Jalankan manual di Supabase SQL Editor. Idempotent.
-- =============================================================================

-- Tabel mapping LID -> nomor HP terdaftar.
-- Diisi oleh: (a) bot saat user @lid ketik nomor HP, (b) website saat
-- aktivasi user (best-effort via WAHA /lids/pn endpoint).
CREATE TABLE IF NOT EXISTS public.lid_mappings (
  lid           text PRIMARY KEY,
  phone_number  text NOT NULL,
  resolved_at   timestamp with time zone DEFAULT now(),
  source        text  -- 'user_input' | 'waha_resolve' | 'pre_warm' | 'manual'
);

-- Reverse lookup: dari phone, dapat semua LID yang pernah dipetakan
CREATE INDEX IF NOT EXISTS idx_lid_mappings_phone
  ON public.lid_mappings (phone_number);

-- Kolom known_lids: array LID yang pernah diasosiasikan dengan user.
-- Berguna kalau user pernah ganti device/akun WA (rare tapi possible).
ALTER TABLE public."Database_User"
  ADD COLUMN IF NOT EXISTS known_lids text[];

-- GIN index untuk query "user mana yang punya LID ini?"
CREATE INDEX IF NOT EXISTS idx_database_user_known_lids
  ON public."Database_User" USING GIN (known_lids);
