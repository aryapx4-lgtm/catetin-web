"use client"

import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { usePathname, useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import {
  CreditCard,
  LogOut,
  Menu,
  User,
  X,
  MessageCircle,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getSupabaseBrowser } from "@/lib/supabase/client"

const NAV = [
  { href: "/dashboard/profile", label: "Profil", icon: User },
  { href: "/dashboard/billing", label: "Tagihan", icon: CreditCard },
]

const WA_BOT_NUMBER = "6285166643014"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      const sb = getSupabaseBrowser()
      const { error } = await sb.auth.signOut()
      if (error) {
        toast.error("Gagal logout: " + error.message)
        return
      }
      toast.success("Berhasil keluar")
      router.replace("/login")
      router.refresh()
    })
  }

  return (
    <div className="min-h-svh bg-secondary/20">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-[rgba(21,68,24,0.06)] bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
          <Logo size={28} />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
              <a
                href={`https://wa.me/${WA_BOT_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Chat Bot
              </a>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isPending}
              className="hidden md:inline-flex"
            >
              <LogOut className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Keluar
            </Button>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={open}
              className="grid h-10 w-10 place-items-center rounded-md border border-border md:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 md:grid-cols-[220px_1fr] md:px-6 md:py-10">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block">
          <nav className="sticky top-24 space-y-1" aria-label="Dashboard">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:bg-secondary hover:text-primary",
                  )}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              )
            })}

            <div className="my-3 h-px bg-border" />

            <a
              href={`https://wa.me/${WA_BOT_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-secondary hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Chat Bot
            </a>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Keluar
            </button>
          </nav>
        </aside>

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden">
            <nav className="grid grid-cols-2 gap-2" aria-label="Dashboard">
              {NAV.map((item) => {
                const active = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground/80",
                    )}
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                )
              })}
              <a
                href={`https://wa.me/${WA_BOT_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground/80"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Chat Bot
              </a>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  handleLogout()
                }}
                disabled={isPending}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-destructive"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Keluar
              </button>
            </nav>
          </div>
        )}

        <main>{children}</main>
      </div>
    </div>
  )
}
