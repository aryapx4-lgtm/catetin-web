import Link from "next/link"
import { ArrowRight, Shield } from "lucide-react"

export function CTA() {
  return (
    <section className="bg-[#F8FAF8] py-16 md:py-20">
      <div className="mx-auto max-w-[1120px] px-6 text-center">
        <h2 className="font-display text-[clamp(1.6rem,4vw,2.2rem)] font-extrabold leading-tight text-text-dark text-balance">
          Udah Saatnya Keuanganmu Rapi 💚
        </h2>
        <p className="mx-auto mt-4 max-w-[520px] text-base leading-relaxed text-text-body">
          Gabung ribuan pengguna lain yang udah mulai ambil kendali keuangan mereka
          lewat Catetin. Setup 2 menit, langsung jalan.
        </p>
        <div className="mt-8 flex flex-col items-center gap-5">
          <Link
            href="#daftar"
            className="cta-shimmer inline-flex items-center justify-center gap-2.5 rounded-full bg-[#154418] px-9 py-4 text-base font-bold text-white shadow-card-soft transition-all hover:-translate-y-0.5 hover:bg-[#1A5620]"
          >
            Mulai Catetin Sekarang
            <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </Link>
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" strokeWidth={2} />
            Data terenkripsi & privasi terjaga
          </p>
        </div>
      </div>
    </section>
  )
}