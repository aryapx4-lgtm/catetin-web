import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Polling endpoint dipakai frontend untuk cek status pembayaran setelah
 * popup Mayar dibuka. Tidak butuh auth — order_id sendiri sulit ditebak
 * (mengandung phone + timestamp ms), dan response hanya status + purpose
 * (tidak ada PII). Mirip dengan endpoint status di gateway lain.
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const orderId = url.searchParams.get("orderId")

  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 })
  }

  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from("payments")
    .select("status, purpose, provider_status")
    .eq("payment_order_id", orderId)
    .maybeSingle()

  if (error) {
    console.error("[payments/status] query failed:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  return NextResponse.json({
    status: data.status,
    purpose: data.purpose ?? "new",
    providerStatus: data.provider_status ?? null,
  })
}
