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
  return process.env.RESEND_FROM_EMAIL || "Catetin <onboarding@resend.dev>"
}

function appUrl(): string {
  return process.env.APP_URL || "http://localhost:3000"
}

const WA_BOT_NUMBER = "6285166643014"

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

  const planLabel = input.plan === "couple" ? "Couple 👫" : "Single 👤"

  const greeting = input.isPartner
    ? `Hai ${input.name}! 🎉`
    : `Hai ${input.name}! 🎉`

  const subtitle = input.isPartner
    ? "Pasanganmu sudah mendaftarkan kamu di Catetin Couple. Kalian sekarang bisa catat keuangan bareng!"
    : "Akun Catetin kamu sudah aktif dan siap dipakai. Yuk mulai catat keuangan!"

  const logoUrl = `${appUrl()}/Catetin%20logo.png`
  const waLink = `https://wa.me/${WA_BOT_NUMBER}?text=Halo%20Catetin,%20saya%20baru%20daftar`

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
  <meta name="supported-color-schemes" content="light"/>
  <title>Catetin — Akun Aktif</title>
</head>
<body style="margin:0;padding:0;background:#f4f7f4;font-family:'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f4;padding:32px 16px">
    <tr>
      <td align="center">

        <!-- Email card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(21,68,24,0.08)">

          <!-- Header with gradient + logo -->
          <tr>
            <td style="background:linear-gradient(135deg,#154418 0%,#1a5620 50%,#154418 100%);padding:40px 32px 32px;text-align:center">
              <!--[if mso]>
              <h1 style="margin:0 0 4px;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.3px">Catetin</h1>
              <![endif]-->
              <!--[if !mso]><!-->
              <img src="${logoUrl}" alt="Catetin" width="140" style="display:block;margin:0 auto 12px;max-width:140px;height:auto" />
              <!--<![endif]-->
              <p style="margin:0;font-size:13px;color:#a7e666;font-weight:500;letter-spacing:0.5px">Catat Keuangan Semudah Kirim Chat</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 8px">

              <!-- Greeting -->
              <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0c1f0e;line-height:1.3">${greeting}</h2>
              <p style="margin:0 0 24px;font-size:15px;color:#2d4030;line-height:1.6">${subtitle}</p>

              <!-- Plan badge -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px">
                <tr>
                  <td style="background:#e8f8d8;border:1.5px solid #a7e666;border-radius:100px;padding:8px 20px">
                    <span style="font-size:14px;font-weight:700;color:#154418">Paket: ${planLabel}</span>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid #e8eee8;padding:0;height:1px"></td></tr></table>

              <!-- CTA Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0">
                <tr>
                  <td style="padding:0 0 16px">
                    <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#0c1f0e">📊 Spreadsheet keuangan kamu sudah siap:</p>
                    <!-- Spreadsheet Button -->
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="background:linear-gradient(135deg,#154418,#1a5620);border-radius:12px">
                          <a href="${input.spreadsheetUrl}" target="_blank" style="display:block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;text-align:center;letter-spacing:0.2px">
                            📄 Buka Spreadsheet
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 16px">
                    <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#0c1f0e">💬 Mulai catat transaksi via WhatsApp:</p>
                    <!-- WhatsApp Button -->
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="background:#25D366;border-radius:12px">
                          <a href="${waLink}" target="_blank" style="display:block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;text-align:center;letter-spacing:0.2px">
                            💬 Chat Bot WhatsApp
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>



            </td>
          </tr>


          <!-- Footer -->
          <tr>
            <td style="background:#f8faf8;border-top:1px solid #e8eee8;padding:24px 32px;text-align:center">
              <img src="${logoUrl}" alt="Catetin" width="80" style="display:block;margin:0 auto 10px;max-width:80px;height:auto" />
              <p style="margin:0 0 12px;font-size:12px;color:#4a5e4a">Catat keuangan semudah kirim chat.</p>
              <p style="margin:0;font-size:11px;color:#9ca3af">Email otomatis dari Catetin — tidak perlu dibalas.</p>
            </td>
          </tr>

        </table>
        <!-- /Email card -->

      </td>
    </tr>
  </table>
  <!-- /Outer wrapper -->

</body>
</html>`

  try {
    const result = await resend.emails.send({
      from: fromAddress(),
      to: input.to,
      subject: input.isPartner
        ? "🌿 Selamat datang di Catetin Couple!"
        : "🌿 Akun Catetin kamu sudah aktif!",
      html,
    })
    if (result.error) {
      console.error("[email] Resend error:", result.error)
    }
  } catch (err) {
    console.error("[email] Send failed:", err)
  }
}
