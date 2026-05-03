import { redirect } from "next/navigation"
import { getDuration, getPlan } from "@/lib/plans"

export default async function CheckoutIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const planParam = typeof sp.plan === "string" ? sp.plan : null
  const durationParam =
    typeof sp.duration === "string" ? sp.duration : null

  const planId = getPlan(planParam).id
  const duration = getDuration(durationParam)
  redirect(`/checkout/${planId}/${duration}`)
}
