"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Heart,
  Lock,
  Plus,
  RefreshCw,
  Sparkles,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { formatRupiah, PLANS, DURATIONS, type Duration, type PlanId } from "@/lib/plans"
import { authedFetch } from "@/lib/api-fetch"
import { getSupabaseBrowser } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

type SnapCallbacks = {
  onSuccess?: (result: unknown) => void
  onPending?: (result: unknown) => void
  onError?: (result: unknown) => void
  onClose?: () => void
}
type SnapInstance = { pay: (token: string, callbacks?: SnapCallbacks) => void }

type Payment = {
  id: string
  plan: PlanId
  amount: number
  status: string
  paidAt: string | null
  createdAt: string
  durationMonths: number | null
  method: string | null
}

type BillingData = {
  isMember: boolean
  plan: PlanId
  state?: string
  status?: "active" | "expired"
  subscriptionEnd: string | null
  payments: Payment[]
}

export default function BillingPage() {
  const router = useRouter()
  const [data, setData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [duration, setDuration] = useState<Duration>(1)
  const [isRenewing, startRenew] = useTransition()
  const [showUpgrade, setShowUpgrade] = useState(false)

  const refresh = async () => {
    const res = await authedFetch("/api/billing")
    if (res.ok) {
      const json = (await res.json()) as BillingData
      setData(json)
    }
  }

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
        const res = await authedFetch("/api/billing")
        if (res.status === 401) {
          router.replace("/login")
          return
        }
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          toast.error(j.error || "Gagal memuat data tagihan")
          return
        }
        const json = (await res.json()) as BillingData
        if (!cancelled) setData(json)
      } catch {
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

  const renewPrice = useMemo(() => {
    if (!data) return 0
    const plan = PLANS[data.plan]
    return plan?.durations[duration]?.price ?? 0
  }, [data, duration])

  function handleRenew() {
    if (!data) return
    startRenew(async () => {
      const res = await authedFetch("/api/checkout/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        toast.error(err?.error || "Gagal memulai pembayaran")
        return
      }
      const json = (await res.json()) as {
        bypass?: boolean
        snap_token?: string
        order_id?: string
      }

      if (json.bypass) {
        toast.success("Subscription diperpanjang!")
        await refresh()
        return
      }

      const snap = (window as unknown as { snap?: SnapInstance }).snap
      if (!snap || !json.snap_token) {
        toast.error("Midtrans Snap belum siap. Refresh halaman lalu coba lagi.")
        return
      }

      snap.pay(json.snap_token, {
        onSuccess: async () => {
          toast.success("Pembayaran berhasil. Subscription diperpanjang.")
          await refresh()
        },
        onPending: () => {
          toast.message("Pembayaran sedang diproses…")
        },
        onError: () => toast.error("Pembayaran gagal."),
        onClose: () => toast.message("Pembayaran dibatalkan."),
      })
    })
  }

  if (loading) return <BillingSkeleton />
  if (!data) return null

  if (data.isMember) return <MemberBilling data={data} />

  const planMeta = PLANS[data.plan]
  const status = data.status ?? "expired"
  const endFmt = data.subscriptionEnd ? formatDate(data.subscriptionEnd) : "-"
  const daysLeft = data.subscriptionEnd
    ? Math.max(0, Math.ceil((new Date(data.subscriptionEnd).getTime() - Date.now()) / 86400000))
    : 0

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl">
          Tagihan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola subscription, perpanjang, dan lihat riwayat pembayaran.
        </p>
      </header>

      {/* Active subscription hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary to-primary/85 p-6 text-primary-foreground shadow-sm md:p-8">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/70">
              Subscription aktif
              <Badge
                className={cn(
                  "border-0",
                  status === "active"
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : "bg-destructive/90 text-white hover:bg-destructive",
                )}
              >
                {status === "active" ? (
                  <>
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Aktif
                  </>
                ) : (
                  <>
                    <XCircle className="mr-1 h-3 w-3" /> Kedaluwarsa
                  </>
                )}
              </Badge>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{planMeta.name}</span>
              <span className="text-sm text-white/80">
                — {formatRupiah(planMeta.durations[1].price)}/bulan
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-white/85">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>
                Berakhir {endFmt}
                {status === "active" && daysLeft > 0 ? (
                  <span className="text-white/70"> · {daysLeft} hari lagi</span>
                ) : null}
              </span>
            </div>
          </div>

          {data.plan === "single" ? (
            <Button
              type="button"
              onClick={() => setShowUpgrade(true)}
              className="bg-white text-primary hover:bg-white/90"
            >
              <ArrowUpRight className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Upgrade ke Couple
            </Button>
          ) : null}
        </div>
      </section>

      {/* Top up / extend section */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-accent" aria-hidden="true" />
            <h2 className="text-base font-semibold text-primary">Top up & Perpanjang</h2>
          </div>
          <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih durasi perpanjangan. Tambahan masa aktif akan disambung dari tanggal berakhir saat ini.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {DURATIONS.map((d) => {
            const price = planMeta.durations[d.value].price
            const oldPrice = planMeta.durations[d.value].oldPrice
            const active = duration === d.value
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => setDuration(d.value)}
                className={cn(
                  "flex flex-col rounded-xl border-2 p-4 text-left transition-all",
                  active
                    ? "border-accent bg-accent/5 shadow-sm"
                    : "border-border bg-secondary/30 hover:border-accent/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">{d.label}</span>
                  {d.sub ? (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                      {d.sub}
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 text-lg font-bold tracking-tight text-primary">
                  {formatRupiah(price)}
                </div>
                {oldPrice ? (
                  <div className="text-xs text-muted-foreground line-through">
                    {formatRupiah(oldPrice)}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    {formatRupiah(planMeta.durations[d.value].effectivePerMonth)}/bulan
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary/40 p-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total
            </div>
            <div className="text-xl font-bold text-primary">{formatRupiah(renewPrice)}</div>
          </div>
          <Button
            type="button"
            size="lg"
            onClick={handleRenew}
            disabled={isRenewing}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isRenewing ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Memproses…
              </>
            ) : (
              <>
                <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Perpanjang sekarang
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Payment history */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-accent" aria-hidden="true" />
          <h2 className="text-base font-semibold text-primary">Riwayat pembayaran</h2>
        </div>

        {data.payments.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-border bg-secondary/30 px-6 py-10 text-center">
            <Clock className="mx-auto h-8 w-8 text-muted-foreground/60" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-primary">Belum ada riwayat pembayaran</p>
            <p className="text-xs text-muted-foreground">
              Pembayaran akan muncul di sini setelah transaksi berhasil.
            </p>
          </div>
        ) : (
          <div className="-mx-6 mt-4 overflow-x-auto px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{truncateId(p.id)}</TableCell>
                    <TableCell className="font-semibold capitalize text-primary">
                      {p.plan}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.durationMonths ? `${p.durationMonths} bln` : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(p.paidAt || p.createdAt)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatRupiah(p.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <PaymentStatusBadge status={p.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <UpgradeDialog
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        onSuccess={refresh}
      />
    </div>
  )
}

/* ---------------- Upgrade Dialog ---------------- */

function UpgradeDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess: () => Promise<void> | void
}) {
  const [duration, setDuration] = useState<Duration>(1)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [pending, startTransition] = useTransition()

  const planMeta = PLANS.couple
  const total = planMeta.durations[duration].price

  const phoneValid = /^(\+?62|0)8\d{8,12}$/.test(phone.replace(/\s|-/g, ""))
  const emailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && /@gmail\.com$/i.test(email)
  const nameValid = name.trim().length >= 2
  const canSubmit = nameValid && emailValid && phoneValid

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) {
      toast.error("Lengkapi data pasangan dengan benar")
      return
    }
    startTransition(async () => {
      const res = await authedFetch("/api/checkout/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration,
          partner: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
          },
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        toast.error(err?.error || "Gagal memulai upgrade")
        return
      }

      const json = (await res.json()) as {
        bypass?: boolean
        snap_token?: string
        order_id?: string
      }

      if (json.bypass) {
        toast.success("Akun di-upgrade ke Couple!")
        onOpenChange(false)
        await onSuccess()
        return
      }

      const snap = (window as unknown as { snap?: SnapInstance }).snap
      if (!snap || !json.snap_token) {
        toast.error("Midtrans Snap belum siap. Refresh halaman lalu coba lagi.")
        return
      }

      snap.pay(json.snap_token, {
        onSuccess: async () => {
          toast.success("Upgrade berhasil! Pasangan akan menerima email aktivasi.")
          onOpenChange(false)
          await onSuccess()
        },
        onPending: () => toast.message("Pembayaran sedang diproses…"),
        onError: () => toast.error("Pembayaran gagal."),
        onClose: () => toast.message("Pembayaran dibatalkan."),
      })
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Heart className="h-5 w-5 text-accent" aria-hidden="true" />
            Upgrade ke Couple
          </DialogTitle>
          <DialogDescription>
            Tambahkan data pasangan. Spreadsheet kamu akan otomatis di-share dan masa aktif diperpanjang.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Duration */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Durasi
            </Label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {DURATIONS.map((d) => {
                const active = duration === d.value
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDuration(d.value)}
                    className={cn(
                      "rounded-lg border-2 px-3 py-2.5 text-sm font-semibold transition-all",
                      active
                        ? "border-accent bg-accent/5 text-primary"
                        : "border-border bg-background text-foreground/70 hover:border-accent/40",
                    )}
                  >
                    <div>{d.label}</div>
                    <div className="mt-0.5 text-[0.65rem] font-medium text-accent">
                      {formatRupiah(planMeta.durations[d.value].price)}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Partner data */}
          <div className="space-y-3 rounded-lg border border-border bg-secondary/30 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Data pasangan
            </div>
            <div>
              <Label htmlFor="up-name">Nama lengkap</Label>
              <Input
                id="up-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama panjang pasangan"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="up-email">Email (Gmail)</Label>
              <Input
                id="up-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@gmail.com"
                className="mt-1.5"
              />
              {email && !emailValid ? (
                <p className="mt-1 text-xs text-destructive">
                  Email harus valid dan @gmail.com
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="up-phone">Nomor WhatsApp</Label>
              <Input
                id="up-phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xx atau +62xx"
                className="mt-1.5"
              />
              {phone && !phoneValid ? (
                <p className="mt-1 text-xs text-destructive">Format nomor tidak valid</p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-4 py-3">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total
              </div>
              <div className="text-xl font-bold text-primary">{formatRupiah(total)}</div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || pending}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {pending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Memproses…
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" aria-hidden="true" />
                  Bayar & Upgrade
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function MemberBilling({ data }: { data: BillingData }) {
  const endFmt = data.subscriptionEnd ? formatDate(data.subscriptionEnd) : "-"
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl">
          Tagihan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kamu tergabung di akun couple. Billing dikelola oleh owner.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-gradient-to-br from-primary to-primary/85 p-6 text-primary-foreground shadow-sm md:p-8">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/70">
          Member couple
        </div>
        <div className="mt-2 text-2xl font-bold capitalize">{data.plan}</div>
        <p className="mt-3 text-sm text-white/85">
          <Calendar className="mr-1 inline h-4 w-4 align-text-bottom" aria-hidden="true" />
          Plan aktif sampai <span className="font-semibold">{endFmt}</span>
        </p>
      </section>

      <section className="rounded-2xl border border-dashed border-border bg-secondary/30 p-6 text-sm text-muted-foreground">
        Untuk perpanjang atau melihat riwayat pembayaran, hubungi owner akun couple kamu.
      </section>
    </div>
  )
}

function PaymentStatusBadge({ status }: { status: string }) {
  if (status === "settlement" || status === "paid" || status === "bypassed") {
    return (
      <Badge className="bg-accent/15 text-accent hover:bg-accent/20">
        <CheckCircle2 className="mr-1 h-3 w-3" /> Lunas
      </Badge>
    )
  }
  if (status === "pending") {
    return (
      <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/20">
        <Clock className="mr-1 h-3 w-3" /> Pending
      </Badge>
    )
  }
  return (
    <Badge className="bg-destructive/15 text-destructive hover:bg-destructive/20">
      <XCircle className="mr-1 h-3 w-3" /> {status}
    </Badge>
  )
}

function BillingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
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

function truncateId(id: string): string {
  if (id.length <= 18) return id
  return id.slice(0, 8) + "…" + id.slice(-6)
}
