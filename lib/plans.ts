export type PlanId = "single" | "couple"
export type Duration = 1 | 3 | 12

export type DurationData = {
  price: number
  oldPrice: number | null
  effectivePerMonth: number
  savingsLabel: string | null
  discountPercent: number
}

export type Plan = {
  id: PlanId
  name: string
  tagline: string
  durations: Record<Duration, DurationData>
  features: string[]
  highlight?: boolean
}

export const NEW_USER_DISCOUNT = 0.15
export const REFERRAL_DISCOUNT = 0.1

export const PLANS: Record<PlanId, Plan> = {
  single: {
    id: "single",
    name: "Single",
    tagline: "Untuk kamu yang pegang keuangan sendiri",
    durations: {
      1: {
        price: 39000,
        oldPrice: null,
        effectivePerMonth: 39000,
        savingsLabel: null,
        discountPercent: 0,
      },
      3: {
        price: 99000,
        oldPrice: 117000,
        effectivePerMonth: 33000,
        savingsLabel: "Hemat Rp 18.000",
        discountPercent: 15,
      },
      12: {
        price: 329000,
        oldPrice: 468000,
        effectivePerMonth: 27417,
        savingsLabel: "Hemat Rp 139.000",
        discountPercent: 30,
      },
    },
    features: [
      "Catat via WhatsApp chat & foto struk",
      "AI financial advisor unlimited",
      "Dashboard real-time & laporan otomatis",
      "Tracking hutang & investasi",
      "1 akun pengguna",
    ],
  },
  couple: {
    id: "couple",
    name: "Couple",
    tagline: "Untuk pasangan yang atur keuangan bareng",
    highlight: true,
    durations: {
      1: {
        price: 69000,
        oldPrice: null,
        effectivePerMonth: 69000,
        savingsLabel: null,
        discountPercent: 0,
      },
      3: {
        price: 179000,
        oldPrice: 207000,
        effectivePerMonth: 59667,
        savingsLabel: "Hemat Rp 28.000",
        discountPercent: 15,
      },
      12: {
        price: 589000,
        oldPrice: 828000,
        effectivePerMonth: 49083,
        savingsLabel: "Hemat Rp 239.000",
        discountPercent: 30,
      },
    },
    features: [
      "Semua fitur di Single",
      "2 akun shared, data sinkron real-time",
      "Dashboard keuangan rumah tangga",
      "Split expense tracking otomatis",
      "Laporan keuangan bersama",
    ],
  },
}

export const PLAN_LIST: Plan[] = [PLANS.single, PLANS.couple]

export const DURATIONS: { value: Duration; label: string; sub?: string }[] = [
  { value: 1, label: "1 Bulan" },
  { value: 3, label: "3 Bulan", sub: "Hemat 15%" },
  { value: 12, label: "12 Bulan", sub: "Hemat 30%" },
]

export function getPlan(id: string | null | undefined): Plan {
  if (id && id in PLANS) return PLANS[id as PlanId]
  return PLANS.single
}

export function getDuration(d: string | number | null | undefined): Duration {
  const n = typeof d === "string" ? parseInt(d, 10) : d
  if (n === 3 || n === 12) return n
  return 1
}

export function formatRupiah(value: number): string {
  return "Rp " + Math.round(value).toLocaleString("id-ID")
}

export function getDurationLabel(d: Duration): string {
  return d === 1 ? "1 Bulan" : `${d} Bulan`
}
