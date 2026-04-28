"use client"

import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { Check, Lock, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import {
  DURATIONS,
  PLAN_LIST,
  PLANS,
  formatRupiah,
  getDuration,
  getPlan,
  type Duration,
  type PlanId,
} from "@/lib/plans"
import { cn } from "@/lib/utils"

export function CheckoutForm() {
  const router = useRouter()
  const params = useSearchParams()
  const initialPlan = getPlan(params.get("plan")).id
  const initialDuration = getDuration(params.get("duration"))

  const [planId, setPlanId] = useState<PlanId>(initialPlan)
  const [duration, setDuration] = useState<Duration>(initialDuration)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreeMarketing, setAgreeMarketing] = useState(false)
  const [isPending, startTransition] = useTransition()

  const plan = PLANS[planId]
  const data = plan.durations[duration]
  const total = data.price
  const perSuffix = duration === 1 ? "/bulan" : `/${duration} bulan`

  const phoneValid = useMemo(
    () => /^(\+?62|0)8\d{8,12}$/.test(phone.replace(/\s|-/g, "")),
    [phone],
  )
  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email],
  )
  const canSubmit =
    name.trim().length >= 2 && emailValid && phoneValid && agreeTerms

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) {
      toast.error("Mohon lengkapi data dengan benar")
      return
    }
    startTransition(() => {
      setTimeout(() => {
        toast.success("Order dibuat. Lanjut ke pembayaran…")
        router.push(`/checkout/pending?plan=${plan.id}&duration=${duration}`)
      }, 600)
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 lg:grid-cols-[1fr_380px]"
    >
      <div className="space-y-8">
        {/* Plan selection */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-primary">1. Pilih paket</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Bisa upgrade kapan saja dari dashboard.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {PLAN_LIST.map((p) => {
              const selected = planId === p.id
              const d = p.durations[duration]
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlanId(p.id)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-all",
                    selected
                      ? "border-accent bg-accent/5 ring-2 ring-accent/30"
                      : "border-border bg-background hover:border-foreground/30",
                  )}
                  aria-pressed={selected}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      {p.name}
                    </span>
                    {selected && <Check className="h-4 w-4 text-accent" />}
                  </div>
                  <div className="mt-2 text-lg font-bold text-primary">
                    {formatRupiah(d.price)}
                  </div>
                  <div className="text-xs text-muted-foreground">{perSuffix}</div>
                </button>
              )
            })}
          </div>

          {/* Duration toggle */}
          <div className="mt-5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Durasi langganan
            </Label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {DURATIONS.map((d) => {
                const active = duration === d.value
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDuration(d.value)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-sm font-semibold transition-all",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground/70 hover:border-foreground/30",
                    )}
                  >
                    <div>{d.label}</div>
                    {d.sub && (
                      <div
                        className={cn(
                          "mt-0.5 text-[0.65rem] font-medium",
                          active ? "text-accent-foreground/80" : "text-accent",
                        )}
                      >
                        {d.sub}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Customer data */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-primary">2. Data kamu</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Nomor WhatsApp digunakan untuk akses bot setelah pembayaran.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Nama lengkap</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama sesuai panggilan"
                autoComplete="name"
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@email.com"
                autoComplete="email"
                required
                className="mt-1.5"
              />
              {email && !emailValid && (
                <p className="mt-1 text-xs text-destructive">
                  Format email tidak valid.
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Nomor WhatsApp</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xx atau +62xx"
                autoComplete="tel"
                required
                className="mt-1.5"
              />
              {phone && !phoneValid && (
                <p className="mt-1 text-xs text-destructive">
                  Format nomor tidak valid (gunakan 08xx atau +62xx).
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="plan-select">Paket</Label>
              <Select
                value={planId}
                onValueChange={(v) => setPlanId(v as PlanId)}
              >
                <SelectTrigger id="plan-select" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_LIST.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — {formatRupiah(p.durations[duration].price)}
                      {perSuffix}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Consent */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-primary">3. Persetujuan</h2>
          <div className="mt-4 space-y-4">
            <label className="flex items-start gap-3 text-sm">
              <Checkbox
                checked={agreeTerms}
                onCheckedChange={(v) => setAgreeTerms(Boolean(v))}
                aria-label="Setuju syarat & ketentuan"
                className="mt-0.5"
              />
              <span className="leading-relaxed text-foreground/80">
                Saya menyetujui{" "}
                <Link href="/terms" className="text-accent underline">
                  Syarat &amp; Ketentuan
                </Link>{" "}
                dan{" "}
                <Link href="/privacy" className="text-accent underline">
                  Kebijakan Privasi
                </Link>
                . <span className="text-destructive">*</span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <Checkbox
                checked={agreeMarketing}
                onCheckedChange={(v) => setAgreeMarketing(Boolean(v))}
                aria-label="Setuju marketing"
                className="mt-0.5"
              />
              <span className="leading-relaxed text-foreground/80">
                Saya bersedia menerima tips keuangan &amp; promo via WhatsApp
                (opsional).
              </span>
            </label>
          </div>
        </section>
      </div>

      {/* Order summary */}
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-primary">Ringkasan order</h2>
          <div className="mt-5 flex items-center justify-between border-b border-border pb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-primary">
                {plan.name}
              </div>
              <div className="text-sm text-muted-foreground">{plan.tagline}</div>
            </div>
            <div className="text-right">
              {data.oldPrice && (
                <div className="text-xs text-muted-foreground line-through">
                  {formatRupiah(data.oldPrice)}
                </div>
              )}
              <div className="font-semibold text-primary">
                {formatRupiah(data.price)}
              </div>
              <div className="text-xs text-muted-foreground">{perSuffix}</div>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <Row label="Subtotal" value={formatRupiah(data.price)} />
            <Row label="Biaya admin" value="Rp 0" />
            {data.savingsLabel && (
              <Row
                label="Penghematan"
                value={
                  <span className="font-semibold text-accent">
                    {data.savingsLabel}
                  </span>
                }
              />
            )}
            <div className="my-2 border-t border-border" />
            <Row
              label={<span className="font-semibold text-primary">Total</span>}
              value={
                <span className="text-lg font-bold text-primary">
                  {formatRupiah(total)}
                </span>
              }
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={!canSubmit || isPending}
            className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isPending ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Memproses…
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" aria-hidden="true" />
                Bayar Sekarang
              </>
            )}
          </Button>

          <div className="mt-4 flex items-start gap-2 rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
            <ShieldCheck
              className="mt-0.5 h-4 w-4 shrink-0 text-accent"
              aria-hidden="true"
            />
            <span>
              Pembayaran aman diproses oleh Midtrans. Mendukung QRIS, transfer
              bank, dan virtual account.
            </span>
          </div>
        </div>
      </aside>
    </form>
  )
}

function Row({
  label,
  value,
}: {
  label: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}
