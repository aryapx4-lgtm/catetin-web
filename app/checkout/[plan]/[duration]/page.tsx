import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { Spinner } from "@/components/ui/spinner"
import { PLANS, formatRupiah, type Duration, type PlanId } from "@/lib/plans"

const VALID_PLANS = ["single", "couple"] as const
const VALID_DURATIONS = ["1", "3", "12"] as const

type RouteParams = { plan: string; duration: string }

function parseParams(plan: string, duration: string):
  | { ok: true; planId: PlanId; duration: Duration }
  | { ok: false } {
  if (!VALID_PLANS.includes(plan as (typeof VALID_PLANS)[number])) return { ok: false }
  if (!VALID_DURATIONS.includes(duration as (typeof VALID_DURATIONS)[number])) return { ok: false }
  return {
    ok: true,
    planId: plan as PlanId,
    duration: Number(duration) as Duration,
  }
}

export async function generateStaticParams() {
  return VALID_PLANS.flatMap((plan) =>
    VALID_DURATIONS.map((duration) => ({ plan, duration })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { plan, duration } = await params
  const parsed = parseParams(plan, duration)
  if (!parsed.ok) {
    return { title: "Checkout — Catetin.co" }
  }
  const planMeta = PLANS[parsed.planId]
  const price = planMeta.durations[parsed.duration].price
  return {
    title: `Checkout ${planMeta.name} ${parsed.duration} bulan — Catetin.co`,
    description: `Daftar paket ${planMeta.name} ${parsed.duration} bulan (${formatRupiah(price)}). ${planMeta.tagline}.`,
  }
}

export default async function CheckoutDynamicPage({
  params,
}: {
  params: Promise<RouteParams>
}) {
  const { plan, duration } = await params
  const parsed = parseParams(plan, duration)
  if (!parsed.ok) notFound()

  return (
    <>
      <Navbar />
      <main className="bg-secondary/20">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <header className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Checkout
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Selangkah lagi sebelum kamu mulai. Pilih paket, isi data, lalu
              bayar via QRIS atau transfer bank.
            </p>
          </header>

          <div className="mt-10">
            <Suspense
              fallback={
                <div className="flex h-40 items-center justify-center">
                  <Spinner className="h-6 w-6" />
                </div>
              }
            >
              <CheckoutForm
                initialPlan={parsed.planId}
                initialDuration={parsed.duration}
              />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
