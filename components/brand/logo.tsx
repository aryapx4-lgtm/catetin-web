import Image from "next/image"
import Link from "next/link"

export function Logo({ size = 28 }: { size?: number }) {
  const box = size + 8
  return (
    <Link href="/" className="inline-flex items-center gap-2.5">
      <Image
        src="/Catetin logo.png"
        alt="Catetin"
        width={box}
        height={box}
        priority
        className="shrink-0 rounded-full"
        style={{ width: box, height: box }}
      />
      <span className="font-display text-[1.35rem] font-extrabold tracking-tight text-text-dark">
        Catetin
      </span>
    </Link>
  )
}
