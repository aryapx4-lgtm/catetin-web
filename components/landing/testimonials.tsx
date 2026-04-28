import { MessageSquare, Star } from "lucide-react"
import { SectionLabel } from "@/components/landing/problem"

const testimonials = [
  {
    initials: "RA",
    name: "Rina A.",
    role: "Karyawan Swasta",
    body: '"Akhirnya nemu cara catat keuangan yang gak bikin males. Tinggal chat, selesai. Sekarang udah 3 bulan bisa konsisten nabung."',
  },
  {
    initials: "BS",
    name: "Budi S.",
    role: "Freelancer",
    body: '"Dulu punya hutang dan cicilan di banyak tempat, gak keliatan totalnya. Sekarang semua terpantau jelas lewat dashboard Catetin."',
  },
  {
    initials: "DM",
    name: "Dina M.",
    role: "Ibu Rumah Tangga",
    body: '"Serius ini game changer. Gak perlu download app, gak perlu bikin akun ribet. Chat WhatsApp doang, done. Suami istri sekarang kompak pantau keuangan."',
  },
]

export function TestimonialsSection() {
  return (
    <section className="bg-[#F8FAF8] py-20 md:py-24">
      <div className="mx-auto max-w-[1120px] px-6">
        <div className="mb-12 text-center">
          <SectionLabel>
            <MessageSquare className="h-3.5 w-3.5" strokeWidth={2.5} />
            Kata Mereka
          </SectionLabel>
          <h2 className="mt-4 font-display text-[clamp(1.6rem,4vw,2.4rem)] font-extrabold leading-tight text-text-dark text-balance">
            Pengguna Catetin Berbagi Ceritanya
          </h2>
        </div>

        <div className="mx-auto grid max-w-[480px] gap-6 md:max-w-none md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.initials}
              className="rounded-[20px] border border-[#F0F4F0] bg-white p-8"
            >
              <div className="mb-3.5 flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-[#F5A623] text-[#F5A623]"
                    strokeWidth={0}
                  />
                ))}
              </div>
              <p className="mb-5 text-sm italic leading-[1.8] text-text-body">{t.body}</p>
              <div className="flex items-center gap-3 border-t border-[#F0F4F0] pt-4">
                <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-blue-light text-sm font-bold text-green-dark">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-text-dark">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
