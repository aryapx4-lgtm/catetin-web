import { NextResponse } from "next/server"
import { z } from "zod"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { findMyDbUser } from "@/lib/db-user"
import { PLANS } from "@/lib/plans"
import { createSnapToken } from "@/lib/midtrans"
import { activateUser } from "@/lib/activate-user"
import { normalizePhone } from "@/lib/validators"

export const runtime = "nodejs"

const phoneRegex = /^(\+?62|0)8\d{8,12}$/
const gmailRegex = /@gmail\.com$/i

const bodySchema = z.object({
  duration: z.union([z.literal(1), z.literal(3), z.literal(12)]),
  partner: z.object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Format email tidak valid")
      .regex(gmailRegex, "Email harus @gmail.com"),
    phone: z
      .string()
      .trim()
      .refine((v) => phoneRegex.test(v.replace(/\s|-/g, "")), "Nomor WA tidak valid"),
  }),
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
    return NextResponse.json(
      { error: "Validasi gagal", issues: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const me = await findMyDbUser<DbUser>(
    auth,
    "phone_number, name, email, plan, group_role",
  )

  if (!me) {
    return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 })
  }
  if (me.plan === "couple") {
    return NextResponse.json({ error: "Akun sudah Couple" }, { status: 400 })
  }
  if (me.group_role !== "owner") {
    return NextResponse.json({ error: "Hanya owner yang bisa upgrade" }, { status: 403 })
  }
  if (me.email.toLowerCase() === parsed.data.partner.email.toLowerCase()) {
    return NextResponse.json(
      { error: "Email pasangan tidak boleh sama dengan email kamu" },
      { status: 400 },
    )
  }

  const sb = getSupabaseAdmin()
  const partnerPhone = normalizePhone(parsed.data.partner.phone)
  const { data: partnerExisting } = await sb
    .from("Database_User")
    .select("phone_number, email, state")
    .or(`email.eq.${parsed.data.partner.email},phone_number.eq.${partnerPhone}`)
    .limit(1)
    .maybeSingle()

  if (partnerExisting && partnerExisting.state === "active") {
    return NextResponse.json(
      { error: "Email atau nomor pasangan sudah terdaftar dan aktif" },
      { status: 409 },
    )
  }

  const planMeta = PLANS.couple
  const amount = planMeta.durations[parsed.data.duration].price

  const orderId = `UPG-${me.phone_number}-${Date.now()}`
  const checkoutData = {
    purpose: "upgrade" as const,
    password: null,
    duration_months: parsed.data.duration,
    user_phone: me.phone_number,
    owner: { name: me.name, email: me.email, phone: me.phone_number },
    partner: {
      name: parsed.data.partner.name,
      email: parsed.data.partner.email,
      phone: partnerPhone,
    },
  }

  const bypass = process.env.BYPASS_PAYMENT === "true"

  const { error: insertErr } = await sb.from("payments").insert({
    phone_number: me.phone_number,
    plan: "couple",
    amount,
    status: bypass ? "bypassed" : "pending",
    is_bypassed: bypass,
    midtrans_order_id: orderId,
    duration_months: parsed.data.duration,
    checkout_data: checkoutData,
    purpose: "upgrade",
    paid_at: bypass ? new Date().toISOString() : null,
  })
  if (insertErr) {
    console.error("[upgrade] insert failed:", insertErr)
    return NextResponse.json({ error: "Gagal membuat order" }, { status: 500 })
  }

  if (bypass) {
    try {
      await activateUser(orderId)
    } catch (err) {
      console.error("[upgrade] bypass activation failed:", err)
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
      itemName: `Upgrade ke Couple - ${parsed.data.duration} bulan`,
      customer: { name: me.name, email: me.email, phone: me.phone_number },
    })
  } catch (err) {
    console.error("[upgrade] Snap token failed:", err)
    return NextResponse.json(
      { error: "Gagal membuat sesi pembayaran", detail: String(err) },
      { status: 502 },
    )
  }

  return NextResponse.json({ snap_token: snapToken, order_id: orderId })
}
