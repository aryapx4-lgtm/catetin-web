-- =============================================================================
-- Migration 0004: Rename Midtrans-specific columns to provider-agnostic names
-- supaya tidak vendor-locked di nama. Setelah migrasi ini codebase pakai Mayar
-- sebagai payment gateway, tapi schema bisa dipakai untuk gateway apapun.
-- Jalankan manual via Supabase SQL Editor.
-- =============================================================================

-- 1. Rename kolom utama (order_id) — kritikal, dipakai sebagai unique key
ALTER TABLE public.payments
  RENAME COLUMN midtrans_order_id TO payment_order_id;

-- 2. Rename kolom status & metadata transaksi
ALTER TABLE public.payments
  RENAME COLUMN midtrans_status TO provider_status;

ALTER TABLE public.payments
  RENAME COLUMN midtrans_transaction_id TO provider_transaction_id;

ALTER TABLE public.payments
  RENAME COLUMN midtrans_payment_type TO provider_payment_type;

-- 3. Rename indexes & constraints supaya konsisten
ALTER INDEX IF EXISTS idx_payments_order_id RENAME TO idx_payments_payment_order_id;
ALTER INDEX IF EXISTS uq_payments_order_id  RENAME TO uq_payments_payment_order_id;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_payments_order_id') THEN
    ALTER TABLE public.payments
      RENAME CONSTRAINT uq_payments_order_id TO uq_payments_payment_order_id;
  END IF;
END$$;
