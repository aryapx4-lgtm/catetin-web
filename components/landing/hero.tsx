import Link from "next/link"
import { ArrowRight, CheckCircle2, Lock, MessageCircle, Wallet, Zap } from "lucide-react"
import { HeroDashboardMock } from "@/components/landing/hero-dashboard-mock"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F4FFF4] via-white to-white pb-16 pt-16 md:pb-24 md:pt-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(167,230,102,0.18) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1120px] px-6">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="text-center md:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-light px-4 py-2 text-xs font-semibold text-green-dark">
              <Zap className="h-4 w-4" aria-hidden="true" />
              Catat keuangan semudah kirim chat
            </div>

            <h1 className="font-display text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-[1.15] tracking-tight text-text-dark text-balance mx-auto max-w-[48ch] px-4 md:mx-0 md:max-w-none md:px-0">
              <span className="text-green-dark">Gaji Udah Naik, Tapi Kok </span>
              <span className="highlight-lime text-green-dark">
                Tabungan Tetap Kosong?
              </span>
            </h1>

            <p className="mt-5 text-base leading-relaxed text-text-body md:text-lg">
              Catetin bantu kamu pantau semua keuangan — pengeluaran, pemasukan,
              hutang, sampai investasi — cukup dari{" "}
              <strong className="font-semibold text-text-dark">chat WhatsApp</strong>.
              Tanpa download app, tanpa ribet.
            </p>

            <ul className="mx-auto mt-7 flex max-w-md flex-col gap-2.5 md:mx-0">
              {[
                "Catat transaksi via chat atau foto struk",
                "Dashboard lengkap dari satu tempat",
                "Setup cuma 2 menit, langsung bisa pakai",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-sm font-medium text-text-body"
                >
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-[#A7E666]"
                    strokeWidth={2.5}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col items-center gap-3 md:items-start">
              <Link
                href="#daftar"
                className="cta-shimmer inline-flex items-center justify-center gap-2.5 rounded-full bg-[#FD8D4E] px-9 py-4 text-base font-bold text-white shadow-cta transition-all hover:-translate-y-0.5 hover:bg-[#e87a3a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD8D4E]"
              >
                Daftar Sekarang
                <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </Link>
              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" strokeWidth={2} />
                Pembayaran aman & data finansial terenkripsi
              </p>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="transform md:scale-180 md:translate-x-25">
              <HeroDashboardMock />
            </div>

            <div className="absolute -right-45 -top-20 hidden md:flex animate-float items-center gap-2.5 rounded-xl bg-white px-4 py-3 shadow-card-soft">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                style={{ background: "#E8F8D8" }}
              >
                <Wallet className="h-5 w-5 text-green-dark" strokeWidth={2.5} />
              </span>
              <span className="text-sm font-semibold text-text-dark">
                Pengeluaran terpantau!
              </span>
            </div>

            <div className="absolute left-3 -bottom-15 hidden md:flex animate-float items-center gap-2.5 rounded-xl bg-white px-4 py-3 shadow-card-soft">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                style={{ background: "#FFF0E6" }}
              >
                <MessageCircle className="h-5 w-5 text-orange" strokeWidth={2.5} />
              </span>
              <span className="text-sm font-semibold text-text-dark">
                Catat via chat!
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
