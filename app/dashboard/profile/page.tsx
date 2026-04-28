import { ExternalLink, FileSpreadsheet, MessageCircle, Mail, Phone, User2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CoupleCard } from "@/components/dashboard/couple-card"

// Mock data — to be replaced with real Supabase data later
const USER = {
  name: "Andre Pratama",
  email: "andre.pratama@gmail.com",
  phone: "+62 851-6664-1234",
  plan: "STARTER" as const,
  subscriptionEnd: "2026-05-28",
  spreadsheetUrl: "https://docs.google.com/spreadsheets/d/example",
  groupRole: "owner" as "owner" | "member" | null,
  groupOwnerName: "Andre Pratama",
}

const WA_BOT_NUMBER = "628516664000"

export default function ProfilePage() {
  const subEndFormatted = new Date(USER.subscriptionEnd).toLocaleDateString(
    "id-ID",
    { year: "numeric", month: "long", day: "numeric" },
  )

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

      {/* Account info */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-primary">Akun kamu</h2>
            <p className="text-sm text-muted-foreground">
              Plan aktif sampai{" "}
              <span className="font-medium text-foreground">{subEndFormatted}</span>
            </p>
          </div>
          <Badge className="bg-accent/15 text-accent hover:bg-accent/20">
            {USER.plan}
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <InfoRow icon={User2} label="Nama" value={USER.name} />
          <InfoRow icon={Mail} label="Email" value={USER.email} />
          <InfoRow icon={Phone} label="Nomor WhatsApp" value={USER.phone} />
          <InfoRow icon={FileSpreadsheet} label="Plan" value={USER.plan} />
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid gap-4 md:grid-cols-2">
        <ActionCard
          icon={FileSpreadsheet}
          title="Buka Spreadsheet"
          description="Lihat & edit semua transaksi keuangan kamu di Google Sheets."
          href={USER.spreadsheetUrl}
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
      {USER.plan === "STARTER" || USER.plan === "COUPLE" ? null : null}
      <CoupleCard role={USER.groupRole} ownerName={USER.groupOwnerName} />
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
}: {
  icon: React.ElementType
  title: string
  description: string
  href: string
  external?: boolean
  ctaLabel: string
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-6">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-primary">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-5">
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
          >
            {ctaLabel}
            <ExternalLink className="ml-1 h-4 w-4" aria-hidden="true" />
          </a>
        </Button>
      </div>
    </article>
  )
}
