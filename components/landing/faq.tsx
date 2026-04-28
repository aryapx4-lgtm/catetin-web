"use client"

import { HelpCircle } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { SectionLabel } from "@/components/landing/problem"

const faqs = [
  {
    q: "Ribet gak sih pakainya?",
    a: "Sama sekali enggak! Catetin bekerja lewat WhatsApp yang udah kamu pakai setiap hari. Gak perlu download app baru. Setup cuma 2 menit — langsung bisa mulai catat keuangan.",
  },
  {
    q: "Data keuangan gua aman gak?",
    a: "Keamanan data adalah prioritas utama kami. Semua data terenkripsi dan hanya bisa diakses oleh kamu sendiri. Kami tidak membagikan data ke pihak ketiga manapun.",
  },
  {
    q: "Kalau udah bayar, bisa cancel gak?",
    a: "Bisa banget! Kamu bisa cancel kapan saja tanpa biaya tambahan. Fleksibel, tanpa komitmen jangka panjang yang memberatkan.",
  },
  {
    q: "Ini cocok buat yang penghasilannya gak tetap?",
    a: "Justru sangat cocok! Freelancer, pemilik usaha kecil, atau siapapun dengan income yang fluktuatif bisa lebih mudah pantau cashflow lewat Catetin. Banyak pengguna kami adalah freelancer.",
  },
  {
    q: "Bisa track hutang dan investasi juga?",
    a: "Bisa! Catetin bukan cuma soal pengeluaran harian. Kamu bisa pantau hutang, cicilan, dan investasi sekaligus — semua dari satu dashboard yang gampang dipahami.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="bg-white py-20 md:py-24">
      <div className="mx-auto max-w-[1120px] px-6">
        <div className="mb-12 text-center">
          <SectionLabel>
            <HelpCircle className="h-3.5 w-3.5" strokeWidth={2.5} />
            Pertanyaan Umum
          </SectionLabel>
          <h2 className="mt-4 font-display text-[clamp(1.6rem,4vw,2.4rem)] font-extrabold leading-tight text-text-dark text-balance">
            Mungkin Ini yang Kamu Pikirin
          </h2>
        </div>

        <Accordion
          type="single"
          collapsible
          defaultValue="item-0"
          className="mx-auto flex max-w-[740px] flex-col gap-3.5"
        >
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="overflow-hidden rounded-xl border border-[#F0F4F0] bg-[#F8FAF8] transition-colors hover:border-[rgba(167,230,102,0.4)]"
            >
              <AccordionTrigger className="px-6 py-5 text-left font-display text-base font-bold text-text-dark hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-5 text-sm leading-[1.8] text-text-body">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
