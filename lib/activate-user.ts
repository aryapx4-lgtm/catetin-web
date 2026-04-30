import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { createUserSpreadsheet, sharePartnerOnSpreadsheet } from "@/lib/google-sheets"
import { sendActivationEmail } from "@/lib/email"
import { normalizePhone } from "@/lib/validators"
import { sendActivationMessage, tryResolveLidByPhone } from "@/lib/waha"
import { saveLidMapping } from "@/lib/lid-mapping"

type Purpose = "new" | "renew" | "upgrade"

type Person = { name: string; email: string; phone: string; consent_marketing?: boolean }

type CheckoutData = {
  purpose?: Purpose
  password: string | null
  duration_months: 1 | 3 | 12
  owner: Person
  partner?: Person | null
  // for renew/upgrade
  user_phone?: string
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

export async function activateUser(orderId: string): Promise<void> {
  const sb = getSupabaseAdmin()

  const { data: payment, error: payErr } = await sb
    .from("payments")
    .select("*")
    .eq("midtrans_order_id", orderId)
    .single()

  if (payErr || !payment) {
    throw new Error(`Payment not found for order_id ${orderId}: ${payErr?.message || "null row"}`)
  }

  const checkout = payment.checkout_data as CheckoutData | null
  if (!checkout) {
    throw new Error(`Missing checkout_data for order_id ${orderId}`)
  }

  const purpose: Purpose = checkout.purpose ?? "new"

  if (purpose === "renew") {
    await activateRenewal({ payment, checkout })
  } else if (purpose === "upgrade") {
    await activateUpgrade({ payment, checkout })
  } else {
    await activateNewUser({ payment, checkout })
  }

  // Mark payment settled & wipe sensitive password from JSONB
  const safeCheckout: CheckoutData = { ...checkout, password: null }
  await sb
    .from("payments")
    .update({
      status: payment.status === "bypassed" ? "bypassed" : "settlement",
      paid_at: payment.paid_at || new Date().toISOString(),
      checkout_data: safeCheckout,
    })
    .eq("midtrans_order_id", orderId)
}

async function activateNewUser({
  payment,
  checkout,
}: {
  payment: any
  checkout: CheckoutData
}): Promise<void> {
  const sb = getSupabaseAdmin()
  const ownerPhone = normalizePhone(checkout.owner.phone)
  const partnerPhone = checkout.partner ? normalizePhone(checkout.partner.phone) : null
  const plan = payment.plan as "single" | "couple"

  const { data: existingOwner } = await sb
    .from("Database_User")
    .select("phone_number, state")
    .eq("phone_number", ownerPhone)
    .maybeSingle()

  if (existingOwner && existingOwner.state === "active" && payment.status === "settlement") {
    return
  }

  const groupId =
    plan === "couple" ? `GRP-${ownerPhone}-${Date.now()}` : ownerPhone

  const shareEmails = [checkout.owner.email]
  if (plan === "couple" && checkout.partner) {
    shareEmails.push(checkout.partner.email)
  }
  const { spreadsheetId, spreadsheetUrl } = await createUserSpreadsheet({
    ownerName: checkout.owner.name,
    shareEmails,
  })

  const subscriptionEnd = addMonths(new Date(), checkout.duration_months).toISOString()
  const ownerPassword = checkout.password
  if (!ownerPassword) {
    throw new Error(`Missing owner password in checkout_data for new-user activation`)
  }

  const ownerAuthId = await createSupabaseAuthUser(checkout.owner.email, ownerPassword)
  await upsertDatabaseUser({
    phone_number: ownerPhone,
    name: checkout.owner.name,
    email: checkout.owner.email,
    plan,
    state: "active",
    subscription_end: subscriptionEnd,
    spreadsheet_id: spreadsheetId,
    group_id: groupId,
    group_role: "owner",
    consent_marketing: checkout.owner.consent_marketing ?? false,
    auth_user_id: ownerAuthId,
  })
  await initUserState(ownerPhone)
  await sendActivationEmail({
    to: checkout.owner.email,
    name: checkout.owner.name,
    spreadsheetUrl,
    plan,
    isPartner: false,
    loginEmail: checkout.owner.email,
  })
  try {
    await pingUserOnWhatsApp({
      phone: ownerPhone,
      name: checkout.owner.name,
      spreadsheetUrl,
      isPartner: false,
      variant: "new",
    })
  } catch (err) {
    console.error("[activate] pingUserOnWhatsApp owner failed:", err)
  }

  if (plan === "couple" && checkout.partner && partnerPhone) {
    // Partner couple tidak punya akun login sendiri — auth_user_id tetap null.
    await upsertDatabaseUser({
      phone_number: partnerPhone,
      name: checkout.partner.name,
      email: checkout.partner.email,
      plan,
      state: "active",
      subscription_end: subscriptionEnd,
      spreadsheet_id: spreadsheetId,
      group_id: groupId,
      group_role: "member",
      consent_marketing: false,
      auth_user_id: null,
    })
    await initUserState(partnerPhone)
    await sendActivationEmail({
      to: checkout.partner.email,
      name: checkout.partner.name,
      spreadsheetUrl,
      plan,
      isPartner: true,
      loginEmail: checkout.owner.email,
      ownerEmail: checkout.owner.email,
    })
    try {
      await pingUserOnWhatsApp({
        phone: partnerPhone,
        name: checkout.partner.name,
        spreadsheetUrl,
        isPartner: true,
        variant: "new",
      })
    } catch (err) {
      console.error("[activate] pingUserOnWhatsApp partner failed:", err)
    }
  }
}

async function activateRenewal({
  checkout,
}: {
  payment: any
  checkout: CheckoutData
}): Promise<void> {
  const sb = getSupabaseAdmin()
  const userPhone = normalizePhone(checkout.user_phone || checkout.owner.phone)

  const { data: user } = await sb
    .from("Database_User")
    .select("phone_number, name, group_id, group_role, subscription_end, plan")
    .eq("phone_number", userPhone)
    .maybeSingle()

  if (!user) {
    throw new Error(`Renewal failed: user ${userPhone} not found`)
  }

  const now = new Date()
  const currentEnd = user.subscription_end ? new Date(user.subscription_end) : now
  const baseDate = currentEnd.getTime() > now.getTime() ? currentEnd : now
  const newEnd = addMonths(baseDate, checkout.duration_months).toISOString()

  // Extend masa aktif untuk semua di group (owner + member jika ada)
  await sb
    .from("Database_User")
    .update({ subscription_end: newEnd, state: "active" })
    .eq("group_id", user.group_id)

  try {
    await pingUserOnWhatsApp({
      phone: userPhone,
      name: user.name || checkout.owner.name,
      isPartner: false,
      variant: "renew",
    })
  } catch (err) {
    console.error("[activate] pingUserOnWhatsApp renew failed:", err)
  }
}

async function activateUpgrade({
  checkout,
}: {
  payment: any
  checkout: CheckoutData
}): Promise<void> {
  const sb = getSupabaseAdmin()
  const userPhone = normalizePhone(checkout.user_phone || checkout.owner.phone)

  const { data: owner } = await sb
    .from("Database_User")
    .select("*")
    .eq("phone_number", userPhone)
    .maybeSingle()

  if (!owner) {
    throw new Error(`Upgrade failed: user ${userPhone} not found`)
  }

  if (owner.group_role !== "owner") {
    throw new Error(`Upgrade failed: user ${userPhone} is not an owner`)
  }

  if (!checkout.partner) {
    throw new Error(`Upgrade failed: missing partner data`)
  }

  const partnerPhone = normalizePhone(checkout.partner.phone)

  const now = new Date()
  const currentEnd = owner.subscription_end ? new Date(owner.subscription_end) : now
  const baseDate = currentEnd.getTime() > now.getTime() ? currentEnd : now
  const newEnd = addMonths(baseDate, checkout.duration_months).toISOString()

  const groupId =
    owner.plan === "couple" && owner.group_id
      ? owner.group_id
      : `GRP-${userPhone}-${Date.now()}`

  if (owner.spreadsheet_id) {
    try {
      await sharePartnerOnSpreadsheet({
        spreadsheetId: owner.spreadsheet_id,
        partnerEmail: checkout.partner.email,
      })
    } catch (err) {
      console.error("[upgrade] share spreadsheet failed:", err)
    }
  }

  // Update owner: switch plan, extend, set group_id
  await sb
    .from("Database_User")
    .update({
      plan: "couple",
      group_id: groupId,
      group_role: "owner",
      subscription_end: newEnd,
      state: "active",
    })
    .eq("phone_number", userPhone)

  // Upsert partner
  await upsertDatabaseUser({
    phone_number: partnerPhone,
    name: checkout.partner.name,
    email: checkout.partner.email,
    plan: "couple",
    state: "active",
    subscription_end: newEnd,
    spreadsheet_id: owner.spreadsheet_id,
    group_id: groupId,
    group_role: "member",
    consent_marketing: false,
    auth_user_id: null,
  })
  await initUserState(partnerPhone)

  const spreadsheetUrl = owner.spreadsheet_id
    ? `https://docs.google.com/spreadsheets/d/${owner.spreadsheet_id}`
    : ""
  await sendActivationEmail({
    to: checkout.partner.email,
    name: checkout.partner.name,
    spreadsheetUrl,
    plan: "couple",
    isPartner: true,
    loginEmail: owner.email,
    ownerEmail: owner.email,
  })

  try {
    await pingUserOnWhatsApp({
      phone: userPhone,
      name: owner.name || checkout.owner.name,
      spreadsheetUrl,
      isPartner: false,
      variant: "upgrade",
    })
  } catch (err) {
    console.error("[activate] pingUserOnWhatsApp upgrade owner failed:", err)
  }
  try {
    await pingUserOnWhatsApp({
      phone: partnerPhone,
      name: checkout.partner.name,
      spreadsheetUrl,
      isPartner: true,
      variant: "upgrade",
    })
  } catch (err) {
    console.error("[activate] pingUserOnWhatsApp upgrade partner failed:", err)
  }
}

/**
 * Buat user di Supabase Auth. Return auth user ID kalau berhasil dibuat,
 * null kalau user dengan email itu sudah ada (akan di-backfill via migration
 * atau via opportunistic backfill di findMyDbUser saat user login).
 */
async function createSupabaseAuthUser(
  email: string,
  password: string,
): Promise<string | null> {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) {
    if (/already.*registered|already.*exists/i.test(error.message)) {
      return null
    }
    throw new Error(`Failed to create Supabase Auth user for ${email}: ${error.message}`)
  }
  return data?.user?.id ?? null
}

type DatabaseUserRow = {
  phone_number: string
  name: string
  email: string
  plan: string
  state: string
  subscription_end: string
  spreadsheet_id: string
  group_id: string
  group_role: "owner" | "member"
  consent_marketing: boolean
  auth_user_id?: string | null
}

async function upsertDatabaseUser(row: DatabaseUserRow): Promise<void> {
  const sb = getSupabaseAdmin()

  // Jangan overwrite auth_user_id dengan null kalau row sudah punya value
  const { auth_user_id, ...rest } = row
  const payload: Record<string, unknown> = {
    ...rest,
    consent_data: true,
    usage_count: 0,
    last_active_at: new Date().toISOString(),
  }
  if (auth_user_id) {
    payload.auth_user_id = auth_user_id
  }

  const { error } = await sb
    .from("Database_User")
    .upsert(payload, { onConflict: "phone_number" })

  if (error) {
    throw new Error(`Failed to upsert Database_User for ${row.phone_number}: ${error.message}`)
  }
}

async function initUserState(phone: string): Promise<void> {
  const sb = getSupabaseAdmin()
  const { error } = await sb.from("user_state").upsert(
    { phone_number: phone, current_state: "done", temp_data: null },
    { onConflict: "phone_number" },
  )
  if (error) {
    throw new Error(`Failed to init user_state for ${phone}: ${error.message}`)
  }
}

async function pingUserOnWhatsApp(opts: {
  phone: string
  name: string
  spreadsheetUrl?: string
  isPartner?: boolean
  variant?: "new" | "renew" | "upgrade"
}): Promise<void> {
  const { phone, name, spreadsheetUrl, isPartner, variant = "new" } = opts

  let text: string
  if (variant === "renew") {
    text =
      `Halo ${name}! Langganan Finance Bot kamu sudah diperpanjang ✨\n\n` +
      `Lanjut catat keuangan kamu kapanpun ya 📊`
  } else if (variant === "upgrade") {
    text = isPartner
      ? `Hai ${name}! Pasangan kamu mengundang kamu ke paket Couple ✨\n\n` +
        (spreadsheetUrl ? `📊 Spreadsheet bersama:\n${spreadsheetUrl}\n\n` : "") +
        `Coba kirim foto struk pertama kamu! 📸`
      : `Halo ${name}! Akun kamu sudah diupgrade ke paket Couple 🎉\n\n` +
        `Kirim foto struk atau ketik transaksi kamu! 📸`
  } else {
    const greeting = isPartner
      ? `Hai ${name}! Pasangan kamu sudah aktifkan paket Couple ✨`
      : `Halo ${name}! Akun Finance Bot kamu sudah aktif 🎉`
    const sheetLine = spreadsheetUrl
      ? `\n\n📊 Spreadsheet kamu:\n${spreadsheetUrl}`
      : ""
    text =
      `${greeting}${sheetLine}\n\n` +
      `Coba kirim foto struk pertama kamu, atau ketik transaksi kamu! 📸`
  }

  await sendActivationMessage(phone, text)

  // Resolve @lid via WAHA endpoint /api/{session}/lids/pn/{phone}.
  // Response bisa null kalau WAHA belum tahu LID untuk nomor ini —
  // fallback flow di n8n akan resolve saat user balas pesan pertama kali.
  const lid = await tryResolveLidByPhone(phone)
  if (lid) {
    await saveLidMapping({ lid, phone, source: "pre_warm" })
    console.log(`[activate] pre-warmed LID ${lid} for phone ${phone}`)
  } else {
    console.log(`[activate] LID not yet known for ${phone}, will be resolved when user chats`)
  }
}
