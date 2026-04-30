"use client"

import { Heart, Mail, Phone, User2 } from "lucide-react"

interface CoupleCardProps {
  role: "owner" | "member" | null
  partner?: { name: string; email: string; phone: string } | null
  owner?: { name: string; email: string; phone: string } | null
}

export function CoupleCard({ role, partner, owner }: CoupleCardProps) {
  if (!role) return null

  const target = role === "owner" ? partner : owner
  const labelTitle = role === "owner" ? "Pasangan kamu" : "Owner akun"
  const description =
    role === "owner"
      ? target
        ? "Pasangan kamu sudah tergabung. Spreadsheet & data tersinkron."
        : "Belum ada pasangan tergabung di akun couple ini."
      : "Kamu tergabung sebagai member. Akses spreadsheet sama dengan owner."

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent">
          <Heart className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-primary">Couple Mode</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {target ? (
        <div className="mt-5 rounded-xl border border-dashed border-border bg-secondary/40 p-5">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {labelTitle}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <DetailLine icon={User2} label="Nama" value={target.name} />
            <DetailLine icon={Phone} label="WhatsApp" value={formatPhone(target.phone)} />
            <DetailLine icon={Mail} label="Email" value={target.email} />
          </div>
        </div>
      ) : null}
    </section>
  )
}

function DetailLine({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-card text-accent">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-sm font-semibold text-primary">{value}</div>
      </div>
    </div>
  )
}

function formatPhone(p: string): string {
  if (!p) return "-"
  if (p.startsWith("62")) return "+62 " + p.slice(2).replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3")
  return p
}
