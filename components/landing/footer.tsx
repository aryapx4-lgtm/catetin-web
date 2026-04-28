import Link from "next/link"

export function Footer() {
  return (
    <footer className="py-10 text-center text-sm text-white/75" style={{ background: "#154418" }}>
      <div className="mx-auto max-w-[1120px] px-6">
        <p>
          &copy; {new Date().getFullYear()} Catetin. Semua hak dilindungi. ·{" "}
          <Link href="/privacy" className="text-white/70 hover:text-white">
            Kebijakan Privasi
          </Link>{" "}
          ·{" "}
          <Link href="/terms" className="text-white/70 hover:text-white">
            Syarat & Ketentuan
          </Link>
        </p>
      </div>
    </footer>
  )
}