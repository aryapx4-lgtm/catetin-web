"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

function getInitial() {
  // Stable countdown that persists per browser session — 24h window
  if (typeof window === "undefined") {
    return { h: 23, m: 59, s: 59 }
  }
  const KEY = "catetin-countdown-end"
  let end = Number(localStorage.getItem(KEY))
  const now = Date.now()
  if (!end || end < now) {
    end = now + 24 * 60 * 60 * 1000
    localStorage.setItem(KEY, String(end))
  }
  const diff = Math.max(0, end - now)
  return {
    h: Math.floor(diff / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1000),
  }
}

export function Countdown() {
  const [time, setTime] = useState({ h: 23, m: 59, s: 59 })

  useEffect(() => {
    setTime(getInitial())
    const id = setInterval(() => setTime(getInitial()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="mb-8 flex flex-col items-center gap-3">
      <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#FD8D4E]">
        <Clock className="h-4 w-4" strokeWidth={2.5} />
        Promo berakhir dalam:
      </div>
      <div className="flex gap-2.5">
        <Box value={time.h} label="Jam" />
        <Box value={time.m} label="Menit" />
        <Box value={time.s} label="Detik" />
      </div>
    </div>
  )
}

function Box({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-[64px] rounded-lg border border-white/10 bg-white/10 px-3.5 py-2.5 text-center backdrop-blur-sm">
      <div className="font-display text-2xl font-extrabold leading-none text-white">
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-1.5 text-[0.6rem] uppercase tracking-[0.08em] text-white/80">
        {label}
      </div>
    </div>
  )
}
