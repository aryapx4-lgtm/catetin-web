import { SectionLabel } from "@/components/landing/problem"

const steps = [
  {
    n: 1,
    title: "Daftar & Hubungkan WhatsApp",
    body: "Isi form pendaftaran, hubungkan nomor WhatsApp-mu. Prosesnya cuma 2 menit.",
  },
  {
    n: 2,
    title: "Kirim Chat atau Foto Struk",
    body: "Catat pengeluaran & pemasukan cukup kirim pesan biasa ke Catetin via WhatsApp.",
  },
  {
    n: 3,
    title: "Pantau di Dashboard",
    body: "Semua tercatat rapi. Lihat ringkasan keuanganmu kapan saja lewat dashboard.",
  },
]

export function HowToUse() {
  return (
    <section
      id="cara-pakai"
      className="relative overflow-hidden py-20 md:py-24"
      style={{ background: "#164417" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-[300px] w-[300px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(167,230,102,0.12), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1120px] px-6">
        <div className="mx-auto mb-14 max-w-[680px] text-center">
          <SectionLabel variant="dark">Cara Kerja</SectionLabel>
          <h2 className="mt-4 font-display text-[clamp(1.6rem,4vw,2.4rem)] font-extrabold leading-tight text-white text-balance">
            Mulai Dalam 3 Langkah Simpel
          </h2>
          <p className="mt-3.5 text-base text-white/70">
            Gak perlu download app. Gak perlu setup ribet. Langsung jalan.
          </p>
        </div>

        <div className="mx-auto grid max-w-[400px] gap-7 md:max-w-none md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="rounded-[20px] border border-white/10 p-9 text-center transition-all hover:-translate-y-1"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-full font-display text-[1.1rem] font-extrabold text-[#164417]"
                style={{ background: "#A7E666" }}
              >
                {s.n}
              </div>
              <h3 className="mb-2.5 font-display text-lg font-extrabold text-white">
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/70">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}