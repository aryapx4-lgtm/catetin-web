import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { findMyDbUser } from "@/lib/db-user"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type DbUser = {
  phone_number: string
  plan: string
  state: string
  subscription_end: string | null
  group_role: "owner" | "member" | null
}

export async function GET(req: Request) {
  const auth = await getAuthUserFromRequest(req)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const me = await findMyDbUser<DbUser>(
    auth,
    "phone_number, plan, state, subscription_end, group_role",
  )

  if (!me) {
    return NextResponse.json({ error: "Profil tidak ditemukan" }, { status: 404 })
  }

  // Member couple tidak punya billing terpisah — mereka share dengan owner.
  if (me.group_role === "member") {
    return NextResponse.json({
      isMember: true,
      plan: me.plan,
      subscriptionEnd: me.subscription_end,
      payments: [],
    })
  }

  const sb = getSupabaseAdmin()
  const { data: rows } = await sb
    .from("payments")
    .select(
      "midtrans_order_id, plan, amount, status, paid_at, created_at, duration_months, midtrans_payment_type, purpose",
    )
    .eq("phone_number", me.phone_number)
    .order("created_at", { ascending: false })
    .limit(50)

  const payments = (rows ?? []).map((r: any) => ({
    id: r.midtrans_order_id,
    plan: r.plan,
    amount: r.amount,
    status: r.status,
    paidAt: r.paid_at,
    createdAt: r.created_at,
    durationMonths: r.duration_months,
    method: r.midtrans_payment_type ?? null,
    purpose: r.purpose ?? "new",
  }))

  const now = Date.now()
  const endTs = me.subscription_end ? new Date(me.subscription_end).getTime() : 0
  const status: "active" | "expired" = endTs > now ? "active" : "expired"

  return NextResponse.json({
    isMember: false,
    plan: me.plan,
    state: me.state,
    status,
    subscriptionEnd: me.subscription_end,
    payments,
  })
}
