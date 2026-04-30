import { getSupabaseAdmin } from "@/lib/supabase/admin"

export type AuthUser = {
  id: string
  email: string
}

export async function getAuthUserFromRequest(req: Request): Promise<AuthUser | null> {
  const header = req.headers.get("authorization") || req.headers.get("Authorization")
  if (!header || !header.toLowerCase().startsWith("bearer ")) return null
  const token = header.slice(7).trim()
  if (!token) return null

  const sb = getSupabaseAdmin()
  const { data, error } = await sb.auth.getUser(token)
  if (error || !data?.user || !data.user.email) return null
  return { id: data.user.id, email: data.user.email }
}
