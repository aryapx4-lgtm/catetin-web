import type { Metadata } from "next"
import { Navbar } from "@/components/landing/navbar"
import { Pricing } from "@/components/landing/pricing"
import { FAQ } from "@/components/landing/faq"
import { Footer } from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Harga — Finance Bot",
  description:
    "Mulai dari Rp 29.000/bulan. Pilih paket yang sesuai kebutuhan kamu.",
}

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main>
        <div className="border-b border-border bg-secondary/30 py-12 md:py-16">
          <div className="mx-auto w-full max-w-4xl px-4 text-center md:px-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Harga
            </span>
            <h1 className="mt-3 text-balance text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
              Harga sederhana, tanpa biaya tersembunyi
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
              Bayar bulanan, tidak ada kontrak. Pilih paket di bawah, bayar
              sekali, langsung pakai di WhatsApp.
            </p>
          </div>
        </div>
        <Pricing showHeader={false} />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}
