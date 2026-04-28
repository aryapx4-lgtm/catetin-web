"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Check, Lock, Shield } from "lucide-react"
import {
  DURATIONS,
  PLANS,
  type Duration,
  type PlanId,
  formatRupiah,
} from "@/lib/plans"
import { SectionLabel } from "@/components/landing/problem"
import { Countdown } from "@/components/landing/countdown"
import { cn } from "@/lib/utils"

export function Pricing() {
  const [duration, setDuration] = useState<Duration>(1)

  return (
    <section
      id="daftar"
      className="relative overflow-hidden py-20 md:py-24"
      style={{
        background: "linear-gradient(175deg, #154418 0%, #0D2E10 100%)",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(253,141,78,0.12), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1120px] px-6">
        <div className="mx-auto max-w-[900px] text-center">
          <SectionLabel variant="dark">Penawaran Spesial</SectionLabel>
          <h2 className="mt-4 font-display text-[clamp(1.6rem,4vw,2.4rem)] font-extrabold leading-tight text-white text-balance">
            Mulai Kendalikan Keuanganmu Hari Ini
          </h2>
          <p className="mt-3 text-base text-white/70 md:text-[1.05rem]">
            Pilih durasi, pilih plan. Makin lama, makin hemat.
          </p>

          <div className="mt-9">
            <Countdown />
          </div>

          {/* Duration toggle */}
          <div className="mb-9 flex justify-center">
            <div className="inline-flex max-w-full items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] p-1.5 backdrop-blur-sm">
              {DURATIONS.map((d) => {
                const active = duration === d.value
                return (
                  <button
  key={d.value}
  type="button"
  onClick={() => setDuration(d.value)}
  aria-pressed={active}
  className={cn(
    "inline-flex flex-col md:flex-row items-center gap-1 md:gap-2 whitespace-nowrap rounded-full px-4 md:px-5 py-2.5 md:py-3 text-sm font-semibold transition-all",
    active
      ? "bg-[#A7E666] text-green-dark shadow-[0_2px_12px_rgba(167,230,102,0.3)]"
      : "text-white hover:text-white/90",
  )}
>
  <span>{d.label}</span>
  {d.sub && (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[0.6rem] md:text-[0.7rem] font-bold leading-none",
        active
          ? "bg-green-dark text-[#A7E666]"
          : "bg-[rgba(167,230,102,0.15)] text-[#A7E666]",
      )}
    >
      {d.sub}
    </span>
  )}
</button>
                )
              })}
            </div>
          </div>

          {/* Pricing cards */}
          <div className="grid gap-6 text-left md:grid-cols-2">
            {(["single", "couple"] as PlanId[]).map((id) => (
              <PricingCard key={id} planId={id} duration={duration} />
            ))}
          </div>

          {/* Guarantee row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[0.82rem] text-white/55">
            <span className="inline-flex items-center gap-2">
              <Lock className="h-3.5 w-3.5" strokeWidth={2} />
              Transaksi Aman ·{" "}
              <strong className="font-semibold text-[#A7E666]">256-bit Encrypted</strong>
            </span>
            <span className="inline-flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" strokeWidth={2} />
              Data Finansial{" "}
              <strong className="font-semibold text-[#A7E666]">
                Terenkripsi & Privat
              </strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

function PricingCard({
  planId,
  duration,
}: {
  planId: PlanId
  duration: Duration
}) {
  const plan = PLANS[planId]
  const data = plan.durations[duration]
  const perSuffix = duration === 1 ? "/bulan" : `/${duration} bulan`

  return (
    <article className="flex flex-col rounded-[28px] border border-white/12 bg-white/[0.07] p-9 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-[rgba(167,230,102,0.3)]">
      <header className="mb-1.5 flex items-center gap-2.5">
        <h3 className="font-display text-xl font-extrabold text-white">{plan.name}</h3>
      </header>
      <p className="mb-6 text-sm text-white/60">{plan.tagline}</p>

      <div className="mb-6">
        {data.oldPrice && (
          <div className="mb-1 text-sm font-medium text-white/40 line-through">
            {formatRupiah(data.oldPrice)}
          </div>
        )}
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-[2.4rem] font-extrabold leading-none text-[#A7E666]">
            {formatRupiah(data.price)}
          </span>
          <span className="text-sm font-medium text-white/50">{perSuffix}</span>
        </div>
        {duration !== 1 && (
          <div className="mt-2 text-xs text-white/55">
            Setara{" "}
            <strong className="font-bold text-white/85">
              {formatRupiah(data.effectivePerMonth)}
            </strong>
            /bulan
          </div>
        )}
        {data.savingsLabel && (
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[rgba(253,141,78,0.15)] px-3 py-1 text-xs font-bold text-[#FD8D4E]">
            {data.savingsLabel}
          </span>
        )}
      </div>

      <ul className="mb-6 flex grow flex-col gap-2 text-sm text-white/85">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Check
              className="mt-0.5 h-4 w-4 shrink-0 text-[#A7E666]"
              strokeWidth={2.5}
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/checkout?plan=${planId}&duration=${duration}`}
        className="cta-shimmer inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FD8D4E] px-6 py-3.5 text-base font-bold text-white shadow-cta transition-all hover:-translate-y-0.5 hover:bg-[#e87a3a]"
      >
        Daftar {formatRupiah(data.price)}
        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
      </Link>

      <p className="mt-3 inline-flex items-center justify-center gap-2 text-center text-xs font-medium text-[#FD8D4E]">
        <span className="rounded-full bg-[#FD8D4E] px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white">
          Baru
        </span>
        +15% diskon khusus new user
      </p>
    </article>
  )
}
