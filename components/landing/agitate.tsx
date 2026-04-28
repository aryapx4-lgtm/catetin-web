import { TriangleAlert } from "lucide-react"
import { SectionLabel } from "@/components/landing/problem"

export function AgitateSection() {
  return (
    <section
      className="py-20 md:py-24"
      style={{
        background: "linear-gradient(180deg, #E4EBFB 0%, #F0F6FF 100%)",
      }}
    >
      <div className="mx-auto max-w-[1120px] px-6">
        <div className="mx-auto max-w-[780px] text-center">
          <SectionLabel>
            <TriangleAlert className="h-3.5 w-3.5" strokeWidth={2.5} />
            Jangan tunggu kelamaan
          </SectionLabel>
          <h2 className="mt-4 font-display text-[clamp(1.6rem,4vw,2.4rem)] font-extrabold leading-tight text-text-dark text-balance">
            Kalau Terus Gini, Kapan Bisa
            <br className="hidden md:block" /> Punya Tabungan Darurat?
          </h2>
          <p className="mt-5 text-base leading-[1.85] text-text-body md:text-[1.05rem]">
            Setiap bulan yang berlalu tanpa catatan keuangan yang jelas artinya{" "}
            <strong className="font-bold text-text-dark">
              ratusan ribu rupiah bocor
            </strong>{" "}
            tanpa kamu sadari. Bayangkan — dalam setahun itu bisa jadi jutaan.
          </p>
          <p className="mt-4 text-base leading-[1.85] text-text-body md:text-[1.05rem]">
            Bukan soal penghasilannya kurang. Tapi soal{" "}
            <strong className="font-bold text-text-dark">
              gak punya sistem sederhana
            </strong>{" "}
            untuk pantau kemana uangmu mengalir. Kabar baiknya? Kamu cuma butuh 2 menit
            untuk ubah itu semua.
          </p>
        </div>
      </div>
    </section>
  )
}
