"use client"

import { useState } from "react"
import { Logo } from "@/components/brand/logo"
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { LoginForm } from "@/components/auth/login-form"

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <header className="sticky top-0 z-50 border-b border-[rgba(21,68,24,0.06)] bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between px-6 py-3.5">
          <Logo size={28} />
          <div className="flex items-center gap-3">
            <DialogTrigger asChild>
              <button
                className="hidden items-center rounded-full px-6 py-2.5 text-sm font-semibold text-green-dark transition-colors hover:text-green-dark/80 md:inline-flex"
              >
                Masuk
              </button>
            </DialogTrigger>

            <DialogContent>
              <DialogTitle>Masuk</DialogTitle>
              <LoginForm />
            </DialogContent>

            <button
              onClick={() => document.getElementById("daftar")?.scrollIntoView({ behavior: "smooth" })}
              className="hidden items-center rounded-full bg-[#FD8D4E] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#FD8D4E]/90 md:inline-flex"
            >
              Daftar Sekarang
            </button>
          </div>
        </div>
      </header>
    </Dialog>
  )
}
