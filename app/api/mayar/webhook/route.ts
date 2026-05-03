import { NextResponse } from "next/server"
import { mayarWebhookSchema } from "@/lib/validators"
import { verifyMayarWebhookToken, isMayarPaid } from "@/lib/mayar"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { activateUser } from "@/lib/activate-user"

export const runtime = "nodejs"

export async function POST(req: Request) {
  // Mayar dapat mengirim token via X-Callback-Token atau Authorization Bearer.
  // Kita coba kedua-duanya untuk fleksibilitas.
  const headerToken =
    req.headers.get("x-callback-token") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    null

  if (!verifyMayarWebhookToken(headerToken)) {
    console.error("[mayar-webhook] invalid or missing token")
    // Tetap return 200 supaya Mayar tidak retry-bombard,
    // tapi jangan proses payload-nya.
    return NextResponse.json({ ok: true })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = mayarWebhookSchema.safeParse(body)
  if (!parsed.success) {
    console.error("[mayar-webhook] Invalid payload", parsed.error.flatten())
    return NextResponse.json({ ok: true })
  }

  const { event, data } = parsed.data
  const orderId = data.referenceId

  const sb = getSupabaseAdmin()
  const isPaid = isMayarPaid({ event, status: data.status })

  await sb
    .from("payments")
    .update({
      provider_status: data.status || event,
      provider_transaction_id: data.id || null,
      provider_payment_type: data.paymentType || null,
      status: isPaid ? "settlement" : data.status || "pending",
    })
    .eq("payment_order_id", orderId)

  if (isPaid) {
    try {
      await activateUser(orderId)
    } catch (err) {
      console.error("[mayar-webhook] activation failed for", orderId, err)
    }
  }

  return NextResponse.json({ ok: true })
}
