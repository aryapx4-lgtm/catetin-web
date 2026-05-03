import type { Metadata } from "next"
import { Suspense } from "react"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { Spinner } from "@/components/ui/spinner"

export const metadata: Metadata = {
  title: "Checkout — Finance Bot",
  description: "Pilih paket, isi data, dan mulai pakai Finance Bot.",
}

export default function CheckoutPage() {
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
              <CheckoutForm />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
