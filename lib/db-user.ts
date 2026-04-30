import { getSupabaseAdmin } from "@/lib/supabase/admin"
import type { AuthUser } from "@/lib/auth-server"

/**
 * Lookup Database_User untuk user yang sedang login.
 * Strategi: by auth_user_id dulu (robust), fallback by email,
 * lalu opportunistic backfill auth_user_id kalau ketemu via email.
 */
export async function findMyDbUser<T = any>(
  auth: AuthUser,
  columns = "*",
): Promise<T | null> {
  const sb = getSupabaseAdmin()
  const cols = columns === "*" ? "*" : `${columns}, auth_user_id`

  const { data: byAuth } = await sb
    .from("Database_User")
    .select(cols)
    .eq("auth_user_id", auth.id)
    .maybeSingle()

  if (byAuth) return byAuth as T

  const { data: byEmail } = await sb
    .from("Database_User")
    .select(cols)
    .eq("email", auth.email)
    .maybeSingle()

  if (!byEmail) return null

  // Backfill auth_user_id supaya lookup berikutnya hit jalur cepat
  if (!(byEmail as any).auth_user_id) {
    await sb
      .from("Database_User")
      .update({ auth_user_id: auth.id })
      .eq("email", auth.email)
  }

  return byEmail as T
}
