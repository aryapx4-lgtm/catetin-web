"use client"

import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useEffect, useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { Check, Lock, ShieldCheck, ClipboardCheck, Smartphone, CreditCard, Loader2, Eye, EyeOff } from "lucide-react"
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
import { openMayarPayment, openCenteredPopup } from "@/lib/mayar-popup"
import { cn } from "@/lib/utils"

export function CheckoutForm({
  initialPlan: initialPlanProp,
  initialDuration: initialDurationProp,
}: {
  initialPlan?: PlanId
  initialDuration?: Duration
} = {}) {
  const router = useRouter()
  const params = useSearchParams()
  const initialPlan = initialPlanProp ?? getPlan(params.get("plan")).id
  const initialDuration = initialDurationProp ?? getDuration(params.get("duration"))

  const [planId, setPlanId] = useState<PlanId>(initialPlan)
  const [duration, setDuration] = useState<Duration>(initialDuration)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [partnerName, setPartnerName] = useState("")
  const [partnerEmail, setPartnerEmail] = useState("")
  const [partnerPhone, setPartnerPhone] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreeMarketing, setAgreeMarketing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isFinalizing, setIsFinalizing] = useState(false)

  const plan = PLANS[planId]
  const data = plan.durations[duration]
  const total = data.price
  const perSuffix = duration === 1 ? "/bulan" : `/${duration} bulan`

  // Sync URL ke kombinasi plan+duration tanpa trigger navigasi/refetch.
  useEffect(() => {
    if (typeof window === "undefined") return
    const target = `/checkout/${planId}/${duration}`
    if (window.location.pathname !== target) {
      window.history.replaceState(null, "", target)
    }
  }, [planId, duration])

  const phoneValid = useMemo(
    () => /^(\+?62|0)8\d{8,12}$/.test(phone.replace(/\s|-/g, "")),
    [phone],
  )
  const emailValid = useMemo(
    () =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && /@gmail\.com$/i.test(email),
    [email],
  )
  const passwordValid = useMemo(() => password.length >= 8, [password])
  const partnerPhoneValid = useMemo(
    () => /^(\+?62|0)8\d{8,12}$/.test(partnerPhone.replace(/\s|-/g, "")),
    [partnerPhone],
  )
  const partnerEmailValid = useMemo(
    () =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partnerEmail) &&
      /@gmail\.com$/i.test(partnerEmail),
    [partnerEmail],
  )
  const partnerNameValid = useMemo(() => partnerName.trim().length >= 2, [partnerName])
  const canSubmit =
    name.trim().length >= 2 &&
    emailValid &&
    phoneValid &&
    agreeTerms &&
    passwordValid &&
    (planId === "couple"
      ? partnerNameValid && partnerEmailValid && partnerPhoneValid
      : true)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) {
      toast.error("Mohon lengkapi data dengan benar")
      return
    }
    // Open popup SYNC dari onClick supaya gak diblok browser.
    const popup = openCenteredPopup("mayar-checkout")
    if (!popup) {
      toast.error("Popup pembayaran diblok. Izinkan popup di browser lalu coba lagi.")
      return
    }
    startTransition(async () => {
      const body: Record<string, unknown> = {
        planId,
        duration,
        owner: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          consent_marketing: agreeMarketing,
        },
      }
      if (planId === "couple") {
        body.partner = {
          name: partnerName.trim(),
          email: partnerEmail.trim().toLowerCase(),
          phone: partnerPhone.trim(),
        }
      }

      let res: Response
      try {
        res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      } catch {
        try { popup.close() } catch { /* ignore */ }
        toast.error("Gagal terhubung ke server. Coba lagi.")
        return
      }

      if (!res.ok) {
        try { popup.close() } catch { /* ignore */ }
        const err = await res.json().catch(() => null)
        toast.error(err?.error || "Gagal membuat order. Coba lagi.")
        return
      }

      const data = (await res.json()) as {
        bypass?: boolean
        payment_url?: string
        order_id?: string
      }

      if (data.bypass) {
        try { popup.close() } catch { /* ignore */ }
        setIsFinalizing(true)
        await new Promise((r) => setTimeout(r, 5500))
        router.push(`/checkout/success?order_id=${data.order_id}`)
        return
      }

      if (!data.payment_url || !data.order_id) {
        try { popup.close() } catch { /* ignore */ }
        toast.error("Gagal menyiapkan pembayaran. Coba lagi.")
        return
      }

      const result = await openMayarPayment({
        popup,
        paymentUrl: data.payment_url,
        orderId: data.order_id,
      })

      if (result.outcome === "success") {
        // Tunjukkan overlay aktivasi SETELAH pembayaran valid (bukan saat popup masih terbuka)
        // supaya gak overlap. Beri waktu user lihat staged steps sebelum redirect.
        setIsFinalizing(true)
        await new Promise((r) => setTimeout(r, 5500))
        router.push(`/checkout/success?order_id=${data.order_id}`)
      } else if (result.outcome === "pending") {
        router.push(`/checkout/pending?order_id=${data.order_id}`)
      } else if (result.outcome === "closed") {
        toast.message("Pembayaran dibatalkan.")
      } else {
        toast.error(result.message || "Pembayaran gagal. Silakan coba lagi.")
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 lg:grid-cols-[1fr_380px]"
    >
      <ProcessingOverlay open={isFinalizing} />
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
                placeholder="Nama panjang"
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
                  Email harus valid dan menggunakan @gmail.com.
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
            <div className="sm:col-span-2">
              <Label htmlFor="password">Password akun</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  autoComplete="new-password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  aria-pressed={showPassword}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {password && !passwordValid && (
                <p className="mt-1 text-xs text-destructive">Password minimal 8 karakter.</p>
              )}
            </div>
          </div>
        </section>

        {planId === "couple" && (
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold text-primary">Data pasangan</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Isi data pasangan untuk membuat akun pasangan (opsional jika sudah
              punya akun).
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="partner-name">Nama lengkap</Label>
                <Input
                  id="partner-name"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="Nama lengkap pasangan"
                  className="mt-1.5"
                />
                {partnerName && !partnerNameValid && (
                  <p className="mt-1 text-xs text-destructive">Nama harus minimal 2 karakter.</p>
                )}
              </div>
              <div>
                <Label htmlFor="partner-email">Email</Label>
                <Input
                  id="partner-email"
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  placeholder="email@pasangan.com"
                  className="mt-1.5"
                />
                {partnerEmail && !partnerEmailValid && (
                  <p className="mt-1 text-xs text-destructive">
                    Email harus valid dan menggunakan @gmail.com.
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="partner-phone">Nomor WhatsApp</Label>
                <Input
                  id="partner-phone"
                  type="tel"
                  inputMode="tel"
                  value={partnerPhone}
                  onChange={(e) => setPartnerPhone(e.target.value)}
                  placeholder="08xx atau +62xx"
                  className="mt-1.5"
                />
                {partnerPhone && !partnerPhoneValid && (
                  <p className="mt-1 text-xs text-destructive">Format nomor tidak valid.</p>
                )}
              </div>
            </div>
          </section>
        )}

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
            {duration > 1 && (
              <Row
                label={`Per bulan (${duration} bulan)`}
                value={
                  <span className="font-semibold text-primary">
                    {formatRupiah(data.effectivePerMonth)}
                    <span className="font-normal text-muted-foreground">/bulan</span>
                  </span>
                }
              />
            )}
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
              Pembayaran aman diproses oleh Mayar. Mendukung QRIS, transfer
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

const PROCESSING_STEPS = [
  {
    icon: CreditCard,
    title: "Mengonfirmasi pembayaran",
    desc: "Memverifikasi transaksi kamu di Mayar…",
  },
  {
    icon: ClipboardCheck,
    title: "Menyiapkan akun kamu",
    desc: "Membuat spreadsheet & akun login…",
  },
  {
    icon: Smartphone,
    title: "Mengaktifkan bot WhatsApp",
    desc: "Bot akan menghubungi kamu sebentar lagi…",
  },
] as const

function ProcessingOverlay({ open }: { open: boolean }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!open) {
      setStep(0)
      return
    }
    // Maju ke step "verifikasi WA" setelah 1.2s, lalu "menyiapkan pembayaran" setelah 4s.
    // Step terakhir tetap menyala sampai overlay ditutup.
    const t1 = setTimeout(() => setStep(1), 1200)
    const t2 = setTimeout(() => setStep(2), 4000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [open])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mengaktifkan akun"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-accent/30" />
            <span className="absolute inset-2 rounded-full bg-accent/20" />
            <Loader2 className="relative h-8 w-8 animate-spin text-accent" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-primary">
            Pembayaran berhasil — mengaktifkan akun
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Mohon tunggu sebentar dan jangan tutup halaman ini.
          </p>
        </div>

        <ul className="mt-6 space-y-3">
          {PROCESSING_STEPS.map((s, i) => {
            const status: "done" | "active" | "pending" =
              i < step ? "done" : i === step ? "active" : "pending"
            const Icon = s.icon
            return (
              <li
                key={s.title}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3 transition-all",
                  status === "active" &&
                    "border-accent/50 bg-accent/5 ring-1 ring-accent/20",
                  status === "done" && "border-border bg-secondary/40",
                  status === "pending" && "border-border bg-background opacity-60",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    status === "done" && "bg-accent text-accent-foreground",
                    status === "active" && "bg-accent/15 text-accent",
                    status === "pending" && "bg-muted text-muted-foreground",
                  )}
                  aria-hidden="true"
                >
                  {status === "done" ? (
                    <Check className="h-4 w-4" />
                  ) : status === "active" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      "text-sm font-semibold",
                      status === "pending"
                        ? "text-muted-foreground"
                        : "text-primary",
                    )}
                  >
                    {s.title}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {s.desc}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <div className="mt-5 flex items-start gap-2 rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
          <ShieldCheck
            className="mt-0.5 h-4 w-4 shrink-0 text-accent"
            aria-hidden="true"
          />
          <span>
            Koneksi terenkripsi. Data kamu aman selama proses verifikasi dan
            pembayaran.
          </span>
        </div>
      </div>
    </div>
  )
}
