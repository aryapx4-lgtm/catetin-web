"use client"

import { useState } from "react"
import { Copy, RefreshCw, Heart } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface CoupleCardProps {
  role: "owner" | "member" | null
  ownerName?: string
}

export function CoupleCard({ role, ownerName }: CoupleCardProps) {
  const [code, setCode] = useState("482917")

  function generateNew() {
    const next = String(Math.floor(100000 + Math.random() * 900000))
    setCode(next)
    toast.success("Kode invite baru di-generate")
  }

  function copyCode() {
    navigator.clipboard.writeText(code)
    toast.success("Kode disalin")
  }

  if (!role) {
    return null
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent">
          <Heart className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-primary">Couple Mode</h2>
          <p className="text-sm text-muted-foreground">
            {role === "owner"
              ? "Undang pasangan kamu untuk berbagi spreadsheet."
              : `Tergabung dengan ${ownerName ?? "pasangan kamu"}.`}
          </p>
        </div>
      </div>

      {role === "owner" ? (
        <div className="mt-5 rounded-xl border border-dashed border-border bg-secondary/40 p-5">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Kode invite
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="font-mono text-2xl font-bold tracking-[0.4em] text-primary">
              {code}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyCode}>
                <Copy className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Salin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generateNew}
                className="text-accent"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Generate baru
              </Button>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Bagikan kode ini ke pasangan. Mereka tinggal kirim ke bot:{" "}
            <span className="font-medium text-foreground">join {code}</span>
          </p>
        </div>
      ) : null}
    </section>
  )
}
