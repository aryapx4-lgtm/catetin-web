import type { Metadata } from "next"
import Link from "next/link"
import { Clock, ArrowRight } from "lucide-react"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Menunggu Pembayaran — Finance Bot",
}

export default function CheckoutPendingPage() {
  return (
    <>
      <Navbar />
      <main className="bg-secondary/20 py-16 md:py-24">
        <div className="mx-auto w-full max-w-xl px-4 md:px-6">
          <div className="rounded-2xl border border-border bg-card p-8 text-center md:p-10">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-100 text-amber-600">
              <Clock className="h-9 w-9" aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-primary md:text-3xl">
              Menunggu pembayaran
            </h1>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
              Selesaikan pembayaran QRIS / transfer bank dalam 24 jam. Setelah
              pembayaran terdeteksi, bot otomatis menghubungi kamu di WhatsApp.
            </p>

            <div className="mt-8 rounded-xl border border-dashed border-border bg-secondary/60 p-5 text-left">
              <h2 className="text-sm font-semibold text-primary">Cek status pembayaran</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Halaman ini akan otomatis ter-update saat pembayaran sukses.
                Atau kamu bisa cek status di dashboard.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href="/dashboard/billing">
                  Cek di Dashboard
                  <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              Butuh bantuan? Email{" "}
              <a className="text-accent underline" href="mailto:halo@financebot.id">
                halo@financebot.id
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
