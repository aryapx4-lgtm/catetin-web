import Link from "next/link"
import { ArrowUpRight, Calendar, CreditCard, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatRupiah } from "@/lib/plans"

// Mock data — to be replaced with real Supabase data later
const SUBSCRIPTION = {
  plan: "SINGLE",
  price: 39000,
  status: "active" as "active" | "expired",
  start: "2026-04-28",
  end: "2026-05-28",
}

const PAYMENT_HISTORY = [
  {
    id: "P-2026-04-001",
    plan: "SINGLE",
    amount: 39000,
    status: "paid" as const,
    paidAt: "2026-04-28T09:14:00",
    method: "QRIS",
  },
  {
    id: "P-2026-03-001",
    plan: "SINGLE",
    amount: 39000,
    status: "paid" as const,
    paidAt: "2026-03-28T11:02:00",
    method: "Transfer BCA",
  },
  {
    id: "P-2026-02-001",
    plan: "SINGLE",
    amount: 39000,
    status: "paid" as const,
    paidAt: "2026-02-28T18:45:00",
    method: "QRIS",
  },
]

export default function BillingPage() {
  const startFmt = formatDate(SUBSCRIPTION.start)
  const endFmt = formatDate(SUBSCRIPTION.end)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl">
          Tagihan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola subscription dan lihat riwayat pembayaran.
        </p>
      </header>

      {/* Active subscription */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-primary">
                Subscription aktif
              </h2>
              <Badge
                className={
                  SUBSCRIPTION.status === "active"
                    ? "bg-accent/15 text-accent hover:bg-accent/20"
                    : "bg-destructive/15 text-destructive hover:bg-destructive/20"
                }
              >
                {SUBSCRIPTION.status === "active" ? "Aktif" : "Kedaluwarsa"}
              </Badge>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold tracking-tight text-primary">
                {SUBSCRIPTION.plan}
              </span>
              <span className="text-sm text-muted-foreground">
                — {formatRupiah(SUBSCRIPTION.price)}/bulan
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>
                Periode: {startFmt} — <span className="font-medium text-foreground">{endFmt}</span>
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href={`/checkout?plan=single`}>
                <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Perpanjang
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pricing">
                <ArrowUpRight className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Upgrade
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Payment history */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-accent" aria-hidden="true" />
          <h2 className="text-base font-semibold text-primary">
            Riwayat pembayaran
          </h2>
        </div>

        <div className="-mx-6 mt-4 overflow-x-auto px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PAYMENT_HISTORY.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.id}</TableCell>
                  <TableCell className="font-semibold text-primary">
                    {p.plan}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.method}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(p.paidAt)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatRupiah(p.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className="bg-accent/15 text-accent hover:bg-accent/20">
                      Lunas
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
