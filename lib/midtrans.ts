import { createHash } from "node:crypto"

function isProduction(): boolean {
  return process.env.MIDTRANS_IS_PRODUCTION === "true"
}

function snapBaseUrl(): string {
  return isProduction()
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions"
}

function getServerKey(): string {
  const key = process.env.MIDTRANS_SERVER_KEY
  if (!key) throw new Error("Missing MIDTRANS_SERVER_KEY")
  return key
}

export type SnapTokenInput = {
  orderId: string
  grossAmount: number
  customer: { name: string; email: string; phone: string }
  itemName: string
}

export async function createSnapToken(input: SnapTokenInput): Promise<string> {
  const auth = Buffer.from(getServerKey() + ":").toString("base64")
  const body = {
    transaction_details: {
      order_id: input.orderId,
      gross_amount: input.grossAmount,
    },
    item_details: [
      {
        id: input.orderId,
        price: input.grossAmount,
        quantity: 1,
        name: input.itemName,
      },
    ],
    customer_details: {
      first_name: input.customer.name,
      email: input.customer.email,
      phone: input.customer.phone,
    },
    credit_card: { secure: true },
  }

  const res = await fetch(snapBaseUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Midtrans Snap error ${res.status}: ${text}`)
  }

  const data = (await res.json()) as { token?: string; error_messages?: string[] }
  if (!data.token) {
    throw new Error(
      `Midtrans Snap returned no token: ${JSON.stringify(data.error_messages || data)}`,
    )
  }
  return data.token
}

export function verifyMidtransSignature(args: {
  orderId: string
  statusCode: string
  grossAmount: string
  signatureKey: string
}): boolean {
  const expected = createHash("sha512")
    .update(args.orderId + args.statusCode + args.grossAmount + getServerKey())
    .digest("hex")
  return expected === args.signatureKey
}
