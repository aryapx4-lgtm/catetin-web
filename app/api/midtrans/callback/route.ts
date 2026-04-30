import { NextResponse } from "next/server"
import { midtransCallbackSchema } from "@/lib/validators"
import { verifyMidtransSignature } from "@/lib/midtrans"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { activateUser } from "@/lib/activate-user"

export const runtime = "nodejs"

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = midtransCallbackSchema.safeParse(body)
  if (!parsed.success) {
    console.error("[midtrans-callback] Invalid payload", parsed.error.flatten())
    return NextResponse.json({ ok: true })
  }

  const data = parsed.data

  const valid = verifyMidtransSignature({
    orderId: data.order_id,
    statusCode: data.status_code,
    grossAmount: data.gross_amount,
    signatureKey: data.signature_key,
  })
  if (!valid) {
    console.error("[midtrans-callback] Invalid signature for", data.order_id)
    return NextResponse.json({ ok: true })
  }

  const sb = getSupabaseAdmin()

  const isPaid =
    (data.transaction_status === "settlement" || data.transaction_status === "capture") &&
    data.fraud_status !== "deny"

  await sb
    .from("payments")
    .update({
      midtrans_status: data.transaction_status,
      midtrans_transaction_id: data.transaction_id || null,
      midtrans_payment_type: data.payment_type || null,
      status: isPaid ? "settlement" : data.transaction_status,
    })
    .eq("midtrans_order_id", data.order_id)

  if (isPaid) {
    try {
      await activateUser(data.order_id)
    } catch (err) {
      console.error("[midtrans-callback] activation failed for", data.order_id, err)
    }
  }

  return NextResponse.json({ ok: true })
}
