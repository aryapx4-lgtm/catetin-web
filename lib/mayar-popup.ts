"use client"

type Outcome = "success" | "pending" | "error" | "closed"

type OpenMayarPaymentArgs = {
  /** Pre-opened popup window (open sinkron dari onClick handler dulu, lalu set URL). */
  popup: Window
  paymentUrl: string
  orderId: string
  /** Polling interval, ms. Default 3000. */
  pollIntervalMs?: number
  /** Hard timeout, ms. Default 15 menit. */
  timeoutMs?: number
}

type OpenMayarPaymentResult = {
  outcome: Outcome
  status?: string
  message?: string
}

/**
 * Buka popup ke Mayar payment page (URL diisi setelah dapat dari API),
 * lalu polling endpoint /api/payments/status sampai status final atau timeout.
 *
 * Pattern penting: caller HARUS memanggil window.open() sinkron dari klik handler
 * supaya popup tidak diblok browser, lalu pass window-nya ke fungsi ini.
 * Kita set popup.location.href di sini setelah dapat URL.
 */
export async function openMayarPayment(
  args: OpenMayarPaymentArgs,
): Promise<OpenMayarPaymentResult> {
  const {
    popup,
    paymentUrl,
    orderId,
    pollIntervalMs = 3000,
    timeoutMs = 15 * 60 * 1000,
  } = args

  try {
    popup.location.href = paymentUrl
  } catch {
    return { outcome: "error", message: "Gagal mengarahkan popup ke Mayar" }
  }

  const startedAt = Date.now()

  return new Promise<OpenMayarPaymentResult>((resolve) => {
    let settled = false
    const finish = (r: OpenMayarPaymentResult) => {
      if (settled) return
      settled = true
      clearInterval(timer)
      resolve(r)
    }

    const tick = async () => {
      if (settled) return

      if (Date.now() - startedAt > timeoutMs) {
        finish({ outcome: "pending", message: "Timeout menunggu pembayaran" })
        return
      }

      if (popup.closed) {
        // User mungkin sudah selesai bayar dan tutup, atau cancel.
        // Cek status sekali lagi sebelum nyerah.
        try {
          const res = await fetch(
            `/api/payments/status?orderId=${encodeURIComponent(orderId)}`,
            { cache: "no-store" },
          )
          if (res.ok) {
            const json = (await res.json()) as { status?: string }
            if (
              json.status === "settlement" ||
              json.status === "bypassed" ||
              json.status === "paid"
            ) {
              finish({ outcome: "success", status: json.status })
              return
            }
          }
        } catch {
          // ignore
        }
        finish({ outcome: "closed", message: "Popup ditutup sebelum selesai" })
        return
      }

      // Deteksi popup sudah balik ke origin kita (Mayar redirect ke redirectUrl).
      // popup.location accessible hanya kalau same-origin; cross-origin akan throw.
      // Kalau bisa baca dan host-nya sama dengan window.location.host, anggap user
      // sudah selesai di Mayar — tutup popup, polling status sekali untuk konfirmasi.
      try {
        const popupHref = popup.location.href
        if (popupHref && popupHref !== "about:blank") {
          const popupHost = popup.location.host
          if (popupHost === window.location.host) {
            try { popup.close() } catch { /* ignore */ }
            // Polling tetap lanjut sebentar — webhook bisa telat 1-2 detik.
          }
        }
      } catch {
        // cross-origin — popup masih di Mayar, normal
      }

      try {
        const res = await fetch(
          `/api/payments/status?orderId=${encodeURIComponent(orderId)}`,
          { cache: "no-store" },
        )
        if (!res.ok) return // try again next tick
        const json = (await res.json()) as { status?: string }
        const s = json.status

        if (s === "settlement" || s === "bypassed" || s === "paid") {
          if (!popup.closed) {
            try { popup.close() } catch { /* ignore */ }
          }
          finish({ outcome: "success", status: s })
          return
        }
        if (s === "expired" || s === "failed" || s === "cancelled") {
          if (!popup.closed) {
            try { popup.close() } catch { /* ignore */ }
          }
          finish({ outcome: "error", status: s, message: "Pembayaran gagal" })
          return
        }
        // pending — keep polling
      } catch {
        // network error, retry next tick
      }
    }

    const timer = setInterval(tick, pollIntervalMs)
    // first poll segera, jangan tunggu satu interval penuh
    void tick()
  })
}

/**
 * Helper: open blank popup centered di layar.
 * Panggil ini SINKRON dari onClick handler untuk hindari popup blocker,
 * lalu pass return value ke openMayarPayment().
 */
export function openCenteredPopup(name = "mayar-pay"): Window | null {
  if (typeof window === "undefined") return null
  const w = 480
  const h = 720
  const left = window.screenX + (window.outerWidth - w) / 2
  const top = window.screenY + (window.outerHeight - h) / 2
  return window.open(
    "about:blank",
    name,
    `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`,
  )
}
