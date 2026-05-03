import { NextResponse } from "next/server"
import { checkoutSchema, normalizePhone } from "@/lib/validators"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { PLANS } from "@/lib/plans"
import { createMayarPayment } from "@/lib/mayar"
import { activateUser } from "@/lib/activate-user"

export const runtime = "nodejs"

export async function POST(req: Request) {
  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = checkoutSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", issues: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const data = parsed.data
  const plan = PLANS[data.planId]
  const amount = plan.durations[data.duration].price
  const ownerPhone = normalizePhone(data.owner.phone)

  const sb = getSupabaseAdmin()

  // Conflict check: email or phone already active
  const { data: existing } = await sb
    .from("Database_User")
    .select("phone_number, email, state")
    .or(`email.eq.${data.owner.email},phone_number.eq.${ownerPhone}`)
    .limit(1)
    .maybeSingle()

  if (existing && existing.state === "active") {
    return NextResponse.json(
      { error: "Email atau nomor WhatsApp sudah terdaftar dan aktif" },
      { status: 409 },
    )
  }

  if (data.planId === "couple" && data.partner) {
    const partnerPhone = normalizePhone(data.partner.phone)
    const { data: partnerExisting } = await sb
      .from("Database_User")
      .select("phone_number, email, state")
      .or(`email.eq.${data.partner.email},phone_number.eq.${partnerPhone}`)
      .limit(1)
      .maybeSingle()
    if (partnerExisting && partnerExisting.state === "active") {
      return NextResponse.json(
        { error: "Email atau nomor pasangan sudah terdaftar dan aktif" },
        { status: 409 },
      )
    }
  }

  const orderId = `FB-${ownerPhone}-${Date.now()}`
  const checkoutData = {
    purpose: "new" as const,
    password: data.owner.password,
    duration_months: data.duration,
    owner: {
      name: data.owner.name,
      email: data.owner.email,
      phone: ownerPhone,
      consent_marketing: data.owner.consent_marketing ?? false,
    },
    partner: data.partner
      ? {
          name: data.partner.name,
          email: data.partner.email,
          phone: normalizePhone(data.partner.phone),
        }
      : null,
  }

  const bypass = process.env.BYPASS_PAYMENT === "true"

  const { error: insertErr } = await sb.from("payments").insert({
    phone_number: ownerPhone,
    plan: data.planId,
    amount,
    status: bypass ? "bypassed" : "pending",
    is_bypassed: bypass,
    payment_order_id: orderId,
    duration_months: data.duration,
    checkout_data: checkoutData,
    purpose: "new",
    paid_at: bypass ? new Date().toISOString() : null,
  })
  if (insertErr) {
    console.error("[checkout] insert payment failed:", insertErr)
    return NextResponse.json({ error: "Gagal membuat order" }, { status: 500 })
  }

  if (bypass) {
    try {
      await activateUser(orderId)
    } catch (err) {
      console.error("[checkout] bypass activation failed:", err)
      return NextResponse.json(
        { error: "Aktivasi gagal di mode bypass", detail: String(err) },
        { status: 500 },
      )
    }
    return NextResponse.json({ bypass: true, order_id: orderId })
  }

  let paymentUrl: string
  try {
    const result = await createMayarPayment({
      orderId,
      amount,
      itemName: `${plan.name} - ${data.duration} bulan`,
      description: `${plan.name} - ${data.duration} bulan`,
      customer: {
        name: data.owner.name,
        email: data.owner.email,
        phone: ownerPhone,
      },
      redirectUrl: `${process.env.APP_URL || ""}/dashboard/billing?paid=${orderId}`,
    })
    paymentUrl = result.paymentUrl
  } catch (err) {
    console.error("[checkout] Mayar payment failed:", err)
    return NextResponse.json(
      { error: "Gagal membuat sesi pembayaran", detail: String(err) },
      { status: 502 },
    )
  }

  return NextResponse.json({ payment_url: paymentUrl, order_id: orderId })
}
