import { Lock, Shield, Smile } from "lucide-react"

const items = [
  {
    Icon: Lock,
    text: (
      <>
        Transaksi Aman ·{" "}
        <strong className="font-bold text-green-dark">256-bit Encrypted</strong>
      </>
    ),
  },
  {
    Icon: Shield,
    text: (
      <>
        Data Finansial{" "}
        <strong className="font-bold text-green-dark">Terenkripsi & Privat</strong>
      </>
    ),
  },
  {
    Icon: Smile,
    text: (
      <>
        Rating <strong className="font-bold text-green-dark">4.9/5</strong> dari pengguna
      </>
    ),
  },
]

export function SocialProof() {
  return (
    <div className="border-y border-[#F0F4F0] bg-[#F8FAF8] py-7">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6">
        {items.map((item, i) => {
          const Icon = item.Icon
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 text-sm font-medium text-text-body"
            >
              <Icon className="h-[18px] w-[18px] text-green-dark" strokeWidth={2.5} />
              <span>{item.text}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
