import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { findMyDbUser } from "@/lib/db-user"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type DbUser = {
  phone_number: string
  name: string
  email: string
  plan: string
  state: string
  subscription_end: string | null
  spreadsheet_id: string | null
  group_id: string | null
  group_role: "owner" | "member" | null
}

export async function GET(req: Request) {
  const auth = await getAuthUserFromRequest(req)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const me = await findMyDbUser<DbUser>(
    auth,
    "phone_number, name, email, plan, state, subscription_end, spreadsheet_id, group_id, group_role",
  )

  if (!me) {
    return NextResponse.json({ error: "Profil tidak ditemukan" }, { status: 404 })
  }

  const sb = getSupabaseAdmin()

  let partner: { name: string; email: string; phone: string } | null = null
  let owner: { name: string; email: string; phone: string } | null = null

  if (me.plan === "couple" && me.group_id) {
    if (me.group_role === "owner") {
      const { data: p } = await sb
        .from("Database_User")
        .select("name, email, phone_number")
        .eq("group_id", me.group_id)
        .eq("group_role", "member")
        .maybeSingle()
      if (p) partner = { name: p.name, email: p.email, phone: p.phone_number }
    } else {
      const { data: o } = await sb
        .from("Database_User")
        .select("name, email, phone_number")
        .eq("group_id", me.group_id)
        .eq("group_role", "owner")
        .maybeSingle()
      if (o) owner = { name: o.name, email: o.email, phone: o.phone_number }
    }
  }

  const spreadsheetUrl = me.spreadsheet_id
    ? `https://docs.google.com/spreadsheets/d/${me.spreadsheet_id}`
    : null

  return NextResponse.json({
    name: me.name,
    email: me.email,
    phone: me.phone_number,
    plan: me.plan,
    state: me.state,
    subscriptionEnd: me.subscription_end,
    spreadsheetId: me.spreadsheet_id,
    spreadsheetUrl,
    groupRole: me.group_role,
    partner,
    owner,
  })
}
