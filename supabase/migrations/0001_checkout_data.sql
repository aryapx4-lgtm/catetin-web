-- Migration: tambah kolom untuk simpan data pending checkout sebelum aktivasi.
-- Jalankan manual via Supabase SQL Editor.

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS checkout_data jsonb,
  ADD COLUMN IF NOT EXISTS duration_months integer;

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(midtrans_order_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_order_id ON public.payments(midtrans_order_id);
