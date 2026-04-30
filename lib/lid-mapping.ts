import { getSupabaseAdmin } from "@/lib/supabase/admin"

type Source = "user_input" | "waha_resolve" | "pre_warm" | "manual"

export async function saveLidMapping(opts: {
  lid: string
  phone: string
  source: Source
}): Promise<void> {
  const sb = getSupabaseAdmin()
  const { lid, phone, source } = opts

  const { error: mapErr } = await sb
    .from("lid_mappings")
    .upsert(
      { lid, phone_number: phone, source, resolved_at: new Date().toISOString() },
      { onConflict: "lid" },
    )
  if (mapErr) {
    console.error(`[lid-mapping] upsert failed for ${lid}:`, mapErr)
    return
  }

  const { data: user } = await sb
    .from("Database_User")
    .select("known_lids")
    .eq("phone_number", phone)
    .maybeSingle()

  if (!user) return
  const existing: string[] = user.known_lids || []
  if (existing.includes(lid)) return

  await sb
    .from("Database_User")
    .update({ known_lids: [...existing, lid] })
    .eq("phone_number", phone)
}
