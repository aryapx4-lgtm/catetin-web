import { AlertCircle, Clock, FileText, Frown } from "lucide-react"

const problems = [
  {
    Icon: Frown,
    title: "Gaji Habis Duluan",
    body: 'Gaji udah naik, tapi tetap aja bingung uangnya lari kemana tiap bulan. Mau nabung, tapi selalu "nanti aja".',
    iconBg: "#FFF0E6",
    iconColor: "#FD8D4E",
  },
  {
    Icon: FileText,
    title: "Catatan Keuangan Berantakan",
    body: "Punya hutang, cicilan, dan investasi di mana-mana — tapi gak punya gambaran jelas posisi keuangan sekarang.",
    iconBg: "#E4EBFB",
    iconColor: "#4A6EE0",
  },
  {
    Icon: Clock,
    title: "Males Ribet Catat Manual",
    body: "Udah coba beberapa app, tapi tetap males karena harus buka app, pilih kategori, isi angka — ujungnya berhenti dalam seminggu.",
    iconBg: "#E8F8D8",
    iconColor: "#154418",
  },
]

export function ProblemSection() {
  return (
    <section className="bg-white py-20 md:py-24">
      <div className="mx-auto max-w-[1120px] px-6">
        <div className="mx-auto mb-12 max-w-[680px] text-center">
          <SectionLabel>
            <AlertCircle className="h-3.5 w-3.5" strokeWidth={2.5} />
            Kenal masalah ini?
          </SectionLabel>
          <h2 className="mt-4 font-display text-[clamp(1.6rem,4vw,2.4rem)] font-extrabold leading-tight text-text-dark text-balance">
            Keuangan Terasa Berantakan,
            <br className="hidden md:block" /> Padahal Penghasilan Udah Cukup?
          </h2>
        </div>

        <div className="mx-auto grid max-w-[480px] gap-6 md:max-w-none md:grid-cols-3">
          {problems.map((p) => {
            const Icon = p.Icon
            return (
              <div
                key={p.title}
                className="relative overflow-hidden rounded-[20px] border border-[#F0F4F0] bg-[#F8FAF8] p-8 transition-all hover:-translate-y-1 hover:shadow-card-soft"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-[3px]"
                  style={{
                    background: "linear-gradient(90deg, #FD8D4E, #ffb380)",
                  }}
                />
                <span
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: p.iconBg }}
                >
                  <Icon
                    className="h-6 w-6"
                    style={{ color: p.iconColor }}
                    strokeWidth={2}
                  />
                </span>
                <h3 className="mb-2.5 font-display text-lg font-extrabold text-text-dark">
                  {p.title}
                </h3>
                <p className="text-[0.92rem] leading-relaxed text-text-body">
                  {p.body}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function SectionLabel({
  children,
  variant = "default",
}: {
  children: React.ReactNode
  variant?: "default" | "dark"
}) {
  if (variant === "dark") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(167,230,102,0.15)] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.06em] text-[#A7E666]">
        {children}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(167,230,102,0.18)] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.06em] text-green-dark">
      {children}
    </span>
  )
}
