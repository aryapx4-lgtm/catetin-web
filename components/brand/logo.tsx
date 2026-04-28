import Link from "next/link"

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="flex shrink-0 items-center justify-center rounded-[10px] bg-green-dark"
        style={{ width: size + 8, height: size + 8 }}
      >
        <svg
          width={size - 4}
          height={size - 4}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* leaf C */}
          <path
            d="M19.5 6.5C18 4 15 3 12 3.5C8 4 5 7 5 11.5C5 15 7 18 10.5 19C13 19.7 16 19 18 17"
            stroke="#A7E666"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M14.5 11.5L17 13.5L19.5 8.5"
            stroke="#A7E666"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-display text-[1.35rem] font-extrabold tracking-tight text-text-dark">
        Catetin
      </span>
    </Link>
  )
}
