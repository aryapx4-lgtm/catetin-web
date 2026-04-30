import { NextResponse } from "next/server"
import { z } from "zod"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { findMyDbUser } from "@/lib/db-user"
import { PLANS } from "@/lib/plans"
import { createSnapToken } from "@/lib/midtrans"
import { activateUser } from "@/lib/activate-user"

export const runtime = "nodejs"

const bodySchema = z.object({
  duration: z.union([z.literal(1), z.literal(3), z.literal(12)]),
})

type DbUser = {
  phone_number: string
  name: string
  email: string
  plan: string
  group_role: "owner" | "member" | null
}

export async function POST(req: Request) {
  const auth = await getAuthUserFromRequest(req)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const parsed = bodySchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal" }, { status: 400 })
  }

  const me = await findMyDbUser<DbUser>(
    auth,
    "phone_number, name, email, plan, group_role",
  )

  if (!me) {
    return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 })
  }

  if (me.group_role === "member") {
    return NextResponse.json(
      { error: "Member couple tidak bisa perpanjang. Minta owner untuk perpanjang." },
      { status: 403 },
    )
  }

  const planMeta = PLANS[me.plan as "single" | "couple"]
  if (!planMeta) {
    return NextResponse.json({ error: "Plan tidak valid" }, { status: 400 })
  }
  const amount = planMeta.durations[parsed.data.duration].price

  const orderId = `RNW-${me.phone_number}-${Date.now()}`
  const checkoutData = {
    purpose: "renew" as const,
    password: null,
    duration_months: parsed.data.duration,
    user_phone: me.phone_number,
    owner: { name: me.name, email: me.email, phone: me.phone_number },
    partner: null,
  }

  const bypass = process.env.BYPASS_PAYMENT === "true"
  const sb = getSupabaseAdmin()

  const { error: insertErr } = await sb.from("payments").insert({
    phone_number: me.phone_number,
    plan: me.plan,
    amount,
    status: bypass ? "bypassed" : "pending",
    is_bypassed: bypass,
    midtrans_order_id: orderId,
    duration_months: parsed.data.duration,
    checkout_data: checkoutData,
    purpose: "renew",
    paid_at: bypass ? new Date().toISOString() : null,
  })
  if (insertErr) {
    console.error("[renew] insert failed:", insertErr)
    return NextResponse.json({ error: "Gagal membuat order" }, { status: 500 })
  }

  if (bypass) {
    try {
      await activateUser(orderId)
    } catch (err) {
      console.error("[renew] bypass activation failed:", err)
      return NextResponse.json(
        { error: "Aktivasi gagal di mode bypass", detail: String(err) },
        { status: 500 },
      )
    }
    return NextResponse.json({ bypass: true, order_id: orderId })
  }

  let snapToken: string
  try {
    snapToken = await createSnapToken({
      orderId,
      grossAmount: amount,
      itemName: `Perpanjang ${planMeta.name} - ${parsed.data.duration} bulan`,
      customer: { name: me.name, email: me.email, phone: me.phone_number },
    })
  } catch (err) {
    console.error("[renew] Snap token failed:", err)
    return NextResponse.json(
      { error: "Gagal membuat sesi pembayaran", detail: String(err) },
      { status: 502 },
    )
  }

  return NextResponse.json({ snap_token: snapToken, order_id: orderId })
}
