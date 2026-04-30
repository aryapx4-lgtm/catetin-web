const WAHA_URL = process.env.WAHA_URL || ""
const WAHA_SESSION = process.env.WAHA_SESSION || "default"
const WAHA_API_KEY = process.env.WAHA_API_KEY || ""

function wahaEnabled(): boolean {
  return Boolean(WAHA_URL && WAHA_API_KEY)
}

function headers(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-Api-Key": WAHA_API_KEY,
  }
}

export async function sendActivationMessage(
  phone: string,
  text: string,
): Promise<boolean> {
  if (!wahaEnabled()) {
    console.warn("[waha] sendActivationMessage skipped: WAHA env not set")
    return false
  }
  try {
    const res = await fetch(`${WAHA_URL}/api/sendText`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        session: WAHA_SESSION,
        chatId: `${phone}@c.us`,
        text,
      }),
    })
    if (!res.ok) {
      console.error(
        `[waha] sendText failed for ${phone}: ${res.status} ${await res.text()}`,
      )
      return false
    }
    return true
  } catch (err) {
    console.error(`[waha] sendText error for ${phone}:`, err)
    return false
  }
}

/**
 * GET /api/{session}/lids/pn/{phoneNumber}
 * Found:     { "lid": "123@lid", "pn": "628xxx@c.us" }
 * Not found: null / 404
 */
export async function tryResolveLidByPhone(
  phone: string,
): Promise<string | null> {
  if (!wahaEnabled()) return null
  const url = `${WAHA_URL}/api/${WAHA_SESSION}/lids/pn/${phone}`
  try {
    const res = await fetch(url, { headers: headers() })
    if (!res.ok) return null
    const body = await res.json().catch(() => null)
    const lidRaw = body?.lid
    if (!lidRaw) return null
    const m = String(lidRaw).match(/^(\d+)(@lid)?$/)
    return m ? m[1] : null
  } catch (err) {
    console.error(`[waha] tryResolveLidByPhone error for ${phone}:`, err)
    return null
  }
}
