import type { Metadata } from "next"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Syarat & Ketentuan — Finance Bot",
}

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-background py-12 md:py-16">
        <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
            Syarat &amp; Ketentuan
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Terakhir diperbarui: {new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="prose prose-slate mt-8 max-w-none">
            <Section title="1. Penerimaan Syarat">
              Dengan mendaftar dan menggunakan layanan Finance Bot, kamu
              menyetujui semua syarat &amp; ketentuan yang tercantum di
              halaman ini. Jika tidak setuju, mohon untuk tidak menggunakan
              layanan kami.
            </Section>

            <Section title="2. Layanan">
              Finance Bot adalah AI financial assistant yang berjalan via
              WhatsApp. Layanan mencakup pencatatan transaksi, OCR struk,
              spreadsheet otomatis, dan saran keuangan berbasis AI.
            </Section>

            <Section title="3. Akun & Keamanan">
              Kamu bertanggung jawab menjaga kerahasiaan akun WhatsApp dan
              spreadsheet kamu. Finance Bot tidak menyimpan password apa pun.
            </Section>

            <Section title="4. Pembayaran">
              Pembayaran dilakukan via Mayar (QRIS / transfer bank). Paket
              berlaku per bulan sesuai pilihan. Refund hanya berlaku jika ada
              kegagalan teknis dari sisi kami.
            </Section>

            <Section title="5. Penggunaan yang Dilarang">
              Dilarang menggunakan layanan untuk aktivitas ilegal,
              penipuan, pencucian uang, atau pelanggaran hukum lainnya.
            </Section>

            <Section title="6. Perubahan Syarat">
              Kami dapat memperbarui syarat ini sewaktu-waktu. Perubahan akan
              dinotifikasi via WhatsApp atau email.
            </Section>

            <Section title="7. Kontak">
              Pertanyaan? Hubungi kami di{" "}
              <a className="text-accent underline" href="mailto:halo@financebot.id">
                halo@financebot.id
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
