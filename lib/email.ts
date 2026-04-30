import { Resend } from "resend"

let cached: Resend | null = null

function getResend(): Resend | null {
  if (cached) return cached
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  cached = new Resend(key)
  return cached
}

function fromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || "Finance Bot <onboarding@resend.dev>"
}

function appUrl(): string {
  return process.env.APP_URL || "http://localhost:3000"
}

type ActivationEmailInput = {
  to: string
  name: string
  spreadsheetUrl: string
  plan: "single" | "couple"
  isPartner?: boolean
  loginEmail: string
  loginPassword?: string
  ownerEmail?: string
}

export async function sendActivationEmail(input: ActivationEmailInput): Promise<void> {
  const resend = getResend()
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping send to", input.to)
    return
  }

  const greeting = input.isPartner
    ? `Hai ${input.name}! Pasanganmu sudah mendaftarkan kamu di Finance Bot Couple.`
    : `Hai ${input.name}! Akun Finance Bot kamu sudah aktif.`

  let passwordBlock = ""
  if (input.loginPassword) {
    passwordBlock = `<p><b>Password sementara:</b> <code>${input.loginPassword}</code><br/><small>Segera ganti password setelah login.</small></p>`
  }

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937">
      <h2 style="color:#0f172a">${greeting}</h2>
      <p>Paket: <b>${input.plan === "couple" ? "Couple" : "Single"}</b></p>
      <p>Spreadsheet keuangan kamu sudah disiapkan dan dishare ke email ini:</p>
      <p>
        <a href="${input.spreadsheetUrl}" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">
          Buka Spreadsheet
        </a>
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
      <h3>${input.isPartner ? "Akses Dashboard" : "Login ke Dashboard"}</h3>
      ${
        input.isPartner
          ? `<p>Dashboard Finance Bot Couple kalian dipakai bareng — login pakai akun pasanganmu:</p>
             <p><b>Email login:</b> ${input.loginEmail}<br/>
             <b>Password:</b> dibuat oleh pasanganmu saat checkout. Tanyakan langsung kalau perlu.</p>
             <p>Spreadsheet di atas sudah dishare ke email <b>${input.to}</b>, jadi kamu bisa buka langsung dari Google Drive-mu sendiri.</p>`
          : `<p><b>Email:</b> ${input.loginEmail}</p>${passwordBlock}`
      }
      <p>
        <a href="${appUrl()}/login" style="color:#0ea5e9">Login di sini</a>
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
      <p>Untuk catat transaksi, langsung chat WhatsApp bot dari nomor yang kamu daftarkan.</p>
      <p style="color:#6b7280;font-size:12px;margin-top:32px">Email otomatis — jangan dibalas.</p>
    </div>
  `

  try {
    const result = await resend.emails.send({
      from: fromAddress(),
      to: input.to,
      subject: input.isPartner
        ? "Akun Finance Bot Couple kamu sudah siap"
        : "Akun Finance Bot kamu sudah aktif",
      html,
    })
    if (result.error) {
      console.error("[email] Resend error:", result.error)
    }
  } catch (err) {
    console.error("[email] Send failed:", err)
  }
}
