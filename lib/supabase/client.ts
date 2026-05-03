"use client"

import {
  createClient,
  type Session,
  type SupabaseClient,
} from "@supabase/supabase-js"

let cached: SupabaseClient | null = null

export function getSupabaseBrowser(): SupabaseClient {
  if (cached) return cached
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
    )
  }
  cached = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  })
  return cached
}

function isInvalidRefreshToken(err: unknown): boolean {
  if (!err || typeof err !== "object") return false
  const e = err as { name?: string; code?: string; message?: string; status?: number }
  const msg = (e.message || "").toLowerCase()
  return (
    e.name === "AuthApiError" &&
    (e.code === "refresh_token_not_found" ||
      msg.includes("refresh token not found") ||
      msg.includes("invalid refresh token"))
  )
}

export async function getSafeSession(): Promise<Session | null> {
  const sb = getSupabaseBrowser()
  const { data, error } = await sb.auth.getSession()
  if (error) {
    if (isInvalidRefreshToken(error)) {
      await sb.auth.signOut({ scope: "local" }).catch(() => {})
    }
    return null
  }
  return data.session ?? null
}
