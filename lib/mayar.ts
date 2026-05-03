import { timingSafeEqual } from "node:crypto"

function isProduction(): boolean {
  return process.env.MAYAR_IS_PRODUCTION === "true"
}

function apiBaseUrl(): string {
  return isProduction()
    ? "https://api.mayar.id/hl/v1"
    : "https://api.mayar.club/hl/v1"
}

function getApiKey(): string {
  const key = process.env.MAYAR_API_KEY
  if (!key) throw new Error("Missing MAYAR_API_KEY")
  return key
}

export type MayarPaymentInput = {
  orderId: string
  amount: number
  itemName: string
  description?: string
  customer: { name: string; email: string; phone: string }
  redirectUrl?: string
  expiredAt?: string
}

export type MayarPaymentResult = {
  paymentUrl: string
  transactionId: string
}

export async function createMayarPayment(
  input: MayarPaymentInput,
): Promise<MayarPaymentResult> {
  const body = {
    name: input.customer.name,
    email: input.customer.email,
    mobile: input.customer.phone,
    amount: input.amount,
    description: input.description ?? input.itemName,
    referenceId: input.orderId,
    redirectUrl: input.redirectUrl,
    expiredAt: input.expiredAt,
  }

  const res = await fetch(`${apiBaseUrl()}/payment/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Mayar API error ${res.status}: ${text}`)
  }

  const json = (await res.json()) as {
    statusCode?: number
    messages?: string
    data?: { id?: string; link?: string; transactionId?: string }
  }

  const link = json.data?.link
  const transactionId = json.data?.id || json.data?.transactionId
  if (!link || !transactionId) {
    throw new Error(`Mayar returned no payment link: ${JSON.stringify(json)}`)
  }

  return { paymentUrl: link, transactionId }
}

/**
 * Verify webhook authenticity. Mayar mengirim webhook token via header
 * (umumnya `X-Callback-Token` atau Authorization Bearer). Kita compare
 * timing-safe terhadap MAYAR_WEBHOOK_TOKEN.
 */
export function verifyMayarWebhookToken(headerToken: string | null): boolean {
  const expected = process.env.MAYAR_WEBHOOK_TOKEN
  if (!expected) {
    console.error("[mayar] Missing MAYAR_WEBHOOK_TOKEN")
    return false
  }
  if (!headerToken) return false

  const a = Buffer.from(headerToken)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/**
 * Parse status string dari Mayar jadi flag boolean.
 * Mayar status umumnya: "SUCCESS" / "PAID" / "PENDING" / "FAILED" / "EXPIRED".
 * Event Mayar umumnya: "payment.received" / "payment.failed".
 */
export function isMayarPaid(args: { event?: string; status?: string }): boolean {
  const ev = (args.event || "").toLowerCase()
  const st = (args.status || "").toLowerCase()
  if (ev.includes("payment.received") || ev === "payment.success") return true
  if (st === "success" || st === "paid" || st === "settlement") return true
  return false
}
