import { NextResponse } from "next/server"
import { verifyMayarWebhookToken, isMayarPaid } from "@/lib/mayar"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { activateUser } from "@/lib/activate-user"

export const runtime = "nodejs"

/**
 * Mayar webhook handler — sengaja dibuat lentur karena dokumentasi Mayar bisa
 * berubah dan field bisa pakai berbagai nama (referenceId / reference_id /
 * external_id, dst.). Kita log payload mentah supaya kalau ada mismatch
 * field-name, kelihatan di log.
 */
export async function POST(req: Request) {
  const headerToken =
    req.headers.get("x-callback-token") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    null

  // Read body sebagai text dulu supaya bisa di-log apa adanya
  const rawBody = await req.text()
  console.log("[mayar-webhook] received:", {
    headers: {
      "x-callback-token": req.headers.get("x-callback-token") ? "present" : "absent",
      authorization: req.headers.get("authorization") ? "present" : "absent",
    },
    body: rawBody.slice(0, 2000),
  })

  if (!verifyMayarWebhookToken(headerToken)) {
    console.error("[mayar-webhook] invalid or missing token")
    return NextResponse.json({ ok: true })
  }

  let body: any
  try {
    body = JSON.parse(rawBody)
  } catch {
    console.error("[mayar-webhook] invalid JSON")
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // Mayar bisa punya struktur:
  //   { event, data: { id, referenceId, status, ... } }
  //   { event, data: { id, reference_id, ... } }
  //   { event, data: { external_id, ... } }
  //   atau flat: { event, id, referenceId, status, ... }
  const data = body.data ?? body
  const event: string = body.event ?? data.event ?? ""
  const orderId: string =
    data.referenceId ||
    data.reference_id ||
    data.external_id ||
    data.externalId ||
    data.id ||
    ""
  const status: string = data.status || event || ""
  const transactionId: string | null = data.id || data.transactionId || null
  const paymentType: string | null = data.paymentType || data.payment_type || null

  if (!orderId) {
    console.error("[mayar-webhook] no orderId/referenceId in payload", body)
    return NextResponse.json({ ok: true })
  }

  console.log("[mayar-webhook] parsed:", { event, orderId, status, transactionId })

  const sb = getSupabaseAdmin()
  const isPaid = isMayarPaid({ event, status })

  const { error: updateErr } = await sb
    .from("payments")
    .update({
      provider_status: status || event,
      provider_transaction_id: transactionId,
      provider_payment_type: paymentType,
      status: isPaid ? "settlement" : status || "pending",
    })
    .eq("payment_order_id", orderId)

  if (updateErr) {
    console.error("[mayar-webhook] DB update failed:", updateErr)
  }

  if (isPaid) {
    try {
      await activateUser(orderId)
      console.log("[mayar-webhook] activated", orderId)
    } catch (err) {
      console.error("[mayar-webhook] activation failed for", orderId, err)
    }
  }

  return NextResponse.json({ ok: true })
}
