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
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-3.5">
          <Logo size={28} />
          <div className="flex items-center gap-2 sm:gap-3">
            <DialogTrigger asChild>
              <button
                className="inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold text-green-dark transition-colors hover:text-green-dark/80 sm:px-6 sm:py-2.5"
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
              className="inline-flex items-center rounded-full bg-[#FD8D4E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#FD8D4E]/90 sm:px-6 sm:py-2.5"
            >
              <span className="sm:hidden">Daftar</span>
              <span className="hidden sm:inline">Daftar Sekarang</span>
            </button>
          </div>
        </div>
      </header>
    </Dialog>
  )
}
