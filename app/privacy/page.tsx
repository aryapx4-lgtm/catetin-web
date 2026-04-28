import type { Metadata } from "next"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Kebijakan Privasi — Finance Bot",
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-background py-12 md:py-16">
        <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
            Kebijakan Privasi
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Terakhir diperbarui:{" "}
            {new Date().toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <div className="mt-8 max-w-none">
            <Section title="1. Data yang Kami Kumpulkan">
              Kami mengumpulkan: nama, email, nomor WhatsApp, data transaksi
              yang kamu kirim ke bot, dan preferensi keuangan untuk
              personalisasi AI.
            </Section>

            <Section title="2. Cara Kami Menggunakan Data">
              Data digunakan untuk: menjalankan layanan, memberi saran AI yang
              relevan, kirim notifikasi keuangan, dan mengirim promo (hanya
              jika kamu setuju).
            </Section>

            <Section title="3. Penyimpanan & Keamanan">
              Data transaksi dienkripsi at-rest dan in-transit. Spreadsheet
              kamu disimpan di akun Google milik kamu sendiri — kami hanya
              memiliki akses tulis sesuai izin yang kamu berikan.
            </Section>

            <Section title="4. Pembagian Data">
              Kami TIDAK menjual data pengguna. Data hanya dibagikan ke
              pihak ketiga seperlunya: Midtrans (untuk pembayaran), Supabase
              (database), dan Google (spreadsheet).
            </Section>

            <Section title="5. Hak Kamu">
              Kamu berhak: meminta salinan data kamu, meminta penghapusan
              akun &amp; data, mencabut izin marketing kapan saja.
            </Section>

            <Section title="6. Cookies">
              Website ini menggunakan cookies untuk autentikasi dan analytics.
              Tidak ada tracking cookies dari pihak ketiga selain Vercel
              Analytics.
            </Section>

            <Section title="7. Kontak">
              Pertanyaan terkait privasi? Email:{" "}
              <a className="text-accent underline" href="mailto:privacy@financebot.id">
                privacy@financebot.id
              </a>
              .
            </Section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-primary">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-foreground/80">
        {children}
      </p>
    </section>
  )
}
