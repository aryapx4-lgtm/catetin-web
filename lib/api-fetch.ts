"use client"

import { getSupabaseBrowser } from "@/lib/supabase/client"

export async function authedFetch(url: string, init?: RequestInit): Promise<Response> {
  const sb = getSupabaseBrowser()
  const { data } = await sb.auth.getSession()
  const token = data.session?.access_token
  const headers = new Headers(init?.headers || {})
  if (token) headers.set("Authorization", `Bearer ${token}`)
  return fetch(url, { ...init, headers, cache: "no-store" })
}
