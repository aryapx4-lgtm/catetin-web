"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ExternalLink,
  FileSpreadsheet,
  MessageCircle,
  Mail,
  Phone,
  User2,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CoupleCard } from "@/components/dashboard/couple-card"
import { authedFetch } from "@/lib/api-fetch"
import { getSupabaseBrowser } from "@/lib/supabase/client"

const WA_BOT_NUMBER = "6285166643014"

type ProfileData = {
  name: string
  email: string
  phone: string
  plan: "single" | "couple"
  state: string
  subscriptionEnd: string | null
  spreadsheetId: string | null
  spreadsheetUrl: string | null
  groupRole: "owner" | "member" | null
  partner: { name: string; email: string; phone: string } | null
  owner: { name: string; email: string; phone: string } | null
}

export default function ProfilePage() {
  const router = useRouter()
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const sb = getSupabaseBrowser()
      const { data: sess } = await sb.auth.getSession()
      if (!sess.session) {
        router.replace("/login")
        return
      }
      try {
        const res = await authedFetch("/api/me")
        if (res.status === 401) {
          router.replace("/login")
          return
        }
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          toast.error(j.error || "Gagal memuat profil")
          return
        }
        const json = (await res.json()) as ProfileData
        if (!cancelled) setData(json)
      } catch (e) {
        toast.error("Gagal terhubung ke server")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [router])

  if (loading) return <ProfileSkeleton />
  if (!data) return null

  const subEndFormatted = data.subscriptionEnd
    ? new Date(data.subscriptionEnd).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-"

  const planLabel = data.plan === "couple" ? "COUPLE" : "SINGLE"
  const phoneFormatted = formatPhone(data.phone)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl">
          Profil
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Data akun dan akses cepat ke spreadsheet & WhatsApp bot.
        </p>
      </header>

      {/* Hero / account card */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary to-primary/85 p-6 text-primary-foreground shadow-sm md:p-8">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur">
              {initials(data.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">{data.name}</h2>
                {data.groupRole === "owner" ? (
                  <Badge className="bg-white/20 text-white hover:bg-white/30">Owner</Badge>
                ) : data.groupRole === "member" ? (
                  <Badge className="bg-white/20 text-white hover:bg-white/30">Member</Badge>
                ) : null}
              </div>
              <p className="text-sm text-white/80">
                Plan aktif sampai{" "}
                <span className="font-semibold text-white">{subEndFormatted}</span>
              </p>
            </div>
          </div>
          <Badge className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Sparkles className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            {planLabel}
          </Badge>
        </div>
      </section>

      {/* Account info */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-base font-semibold text-primary">Detail akun</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <InfoRow icon={User2} label="Nama" value={data.name} />
          <InfoRow icon={Mail} label="Email" value={data.email} />
          <InfoRow icon={Phone} label="Nomor WhatsApp" value={phoneFormatted} />
          <InfoRow icon={Sparkles} label="Plan" value={planLabel} />
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid gap-4 md:grid-cols-2">
        <ActionCard
          icon={FileSpreadsheet}
          title="Buka Spreadsheet"
          description="Lihat & edit semua transaksi keuangan kamu di Google Sheets."
          href={data.spreadsheetUrl || "#"}
          disabled={!data.spreadsheetUrl}
          external
          ctaLabel="Buka Sheets"
        />
        <ActionCard
          icon={MessageCircle}
          title="Chat WhatsApp Bot"
          description="Kirim pesan ke bot untuk catat transaksi atau tanya AI."
          href={`https://wa.me/${WA_BOT_NUMBER}`}
          external
          ctaLabel="Buka WhatsApp"
        />
      </section>

      {/* Couple section */}
      {data.plan === "couple" ? (
        <CoupleCard
          role={data.groupRole}
          partner={data.partner}
          owner={data.owner}
        />
      ) : null}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
      </div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/40 p-4">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-card text-accent">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-0.5 truncate text-sm font-semibold text-primary">
          {value}
        </div>
      </div>
    </div>
  )
}

function ActionCard({
  icon: Icon,
  title,
  description,
  href,
  external,
  ctaLabel,
  disabled,
}: {
  icon: React.ElementType
  title: string
  description: string
  href: string
  external?: boolean
  ctaLabel: string
  disabled?: boolean
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-primary">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-5">
        <Button
          asChild={!disabled}
          disabled={disabled}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {disabled ? (
            <span>Belum tersedia</span>
          ) : (
            <a
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
            >
              {ctaLabel}
              <ExternalLink className="ml-1 h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </Button>
      </div>
    </article>
  )
}

function initials(name: string): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase()).join("")
}

function formatPhone(p: string): string {
  if (!p) return "-"
  if (p.startsWith("62")) return "+62 " + p.slice(2).replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3")
  return p
}
