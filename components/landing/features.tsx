import { BarChart3, Check, Lock, MessageCircle, Sparkles } from "lucide-react"
import { SectionLabel } from "@/components/landing/problem"

const features = [
  {
    Icon: MessageCircle,
    title: "Catat via Chat & Foto",
    body: 'Kirim pesan ke WhatsApp seperti biasa — "Makan siang 35rb" atau foto struk. Catetin otomatis mencatatnya buat kamu.',
    iconBg: "#E8F8D8",
    iconColor: "#154418",
  },
  {
    Icon: BarChart3,
    title: "Dashboard Kesehatan Finansial",
    body: "Pantau pengeluaran, pemasukan, hutang, dan investasi dari satu dashboard yang clean dan mudah dipahami.",
    iconBg: "#FFF0E6",
    iconColor: "#FD8D4E",
  },
  {
    Icon: Sparkles,
    title: "Laporan & Insight Otomatis",
    body: "Dapat ringkasan mingguan dan bulanan otomatis. Tahu persis pola pengeluaranmu tanpa harus hitung manual.",
    iconBg: "#E4EBFB",
    iconColor: "#4A6EE0",
  },
  {
    Icon: Lock,
    title: "Data Aman & Privat",
    body: "Data keuanganmu terenkripsi dan hanya bisa diakses oleh kamu. Privasi adalah prioritas utama kami.",
    iconBg: "#FEF3E2",
    iconColor: "#D4830E",
  },
]

export function Features() {
  return (
    <section id="fitur" className="bg-white py-20 md:py-24">
      <div className="mx-auto max-w-[1120px] px-6">
        <div className="mx-auto mb-14 max-w-[680px] text-center">
          <SectionLabel>
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            Solusinya? Catetin.
          </SectionLabel>
          <h2 className="mt-4 font-display text-[clamp(1.6rem,4vw,2.4rem)] font-extrabold leading-tight text-text-dark text-balance">
            Semua Keuanganmu Terpantau,
            <br className="hidden md:block" /> Cukup dari Chat WhatsApp
          </h2>
          <p className="mt-3.5 text-base text-text-body">
            Catetin dirancang untuk kamu yang mau catatan keuangan rapi — tanpa effort
            berlebih.
          </p>
        </div>

        <div className="grid gap-7 md:grid-cols-2">
          {features.map((f) => {
            const Icon = f.Icon
            return (
              <div
                key={f.title}
                className="flex flex-col items-start gap-5 rounded-[20px] border border-[#F0F4F0] bg-[#F8FAF8] p-9 transition-all hover:-translate-y-1 hover:border-[rgba(167,230,102,0.45)] hover:shadow-card-soft md:flex-row"
              >
                <span
                  className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px]"
                  style={{ background: f.iconBg }}
                >
                  <Icon
                    className="h-6 w-6"
                    style={{ color: f.iconColor }}
                    strokeWidth={2}
                  />
                </span>
                <div>
                  <h3 className="mb-2 font-display text-[1.05rem] font-extrabold text-text-dark">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-text-body">{f.body}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
