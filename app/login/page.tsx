import type { Metadata } from "next"
import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Masuk — Catetin.co",
  description: "Masuk dengan nomor WhatsApp untuk akses dashboard kamu.",
}

export default function LoginPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-secondary/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Logo />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-primary">Masuk</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Masuk dengan email dan password kamu.
          </p>

          <div className="mt-6">
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="/checkout" className="font-semibold text-accent">
              Daftar sekarang
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            ← Kembali ke beranda
          </Link>
        </p>
      </div>
    </main>
  )
}
