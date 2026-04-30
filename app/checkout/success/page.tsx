import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2, MessageCircle, LayoutDashboard } from "lucide-react"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Pembayaran Berhasil — Finance Bot",
}

export default function CheckoutSuccessPage() {
  const waNumber = "6285166643014" // placeholder

  return (
    <>
      <Navbar />
      <main className="bg-secondary/20 py-16 md:py-24">
        <div className="mx-auto w-full max-w-xl px-4 md:px-6">
          <div className="rounded-2xl border border-border bg-card p-8 text-center md:p-10">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent/10">
              <CheckCircle2 className="h-9 w-9 text-accent" aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-primary md:text-3xl">
              Pembayaran berhasil!
            </h1>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
              Selamat datang di Finance Bot. Bot kami akan menghubungi kamu via
              WhatsApp dalam beberapa saat untuk memulai onboarding.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <a
                  href={`https://wa.me/${waNumber}?text=Halo%20Finance%20Bot,%20saya%20baru%20daftar`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                  Buka WhatsApp
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="flex-1">
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden="true" />
                  Ke Dashboard
                </Link>
              </Button>
            </div>

            <div className="mt-8 rounded-xl border border-border bg-secondary/60 p-4 text-left text-sm">
              <h2 className="font-semibold text-primary">Apa selanjutnya?</h2>
              <ol className="mt-3 space-y-2 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-accent">1.</span>
                  <span>Bot akan kirim pesan welcome ke WhatsApp kamu.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-accent">2.</span>
                  <span>Jawab beberapa pertanyaan onboarding singkat.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-accent">3.</span>
                  <span>Spreadsheet otomatis dibuat dan link dikirim ke kamu.</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
