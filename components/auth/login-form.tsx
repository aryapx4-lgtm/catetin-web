"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { getSupabaseBrowser } from "@/lib/supabase/client"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.trim() || !password) {
      toast.error("Email dan password wajib diisi")
      return
    }
    startTransition(async () => {
      const sb = getSupabaseBrowser()
      const { error } = await sb.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (error) {
        toast.error(
          error.message === "Invalid login credentials"
            ? "Email atau password salah"
            : error.message,
        )
        return
      }
      toast.success("Berhasil masuk")
      router.push("/dashboard/profile")
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
      <div>
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@gmail.com"
          required
          autoComplete="off"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="new-password"
          className="mt-1.5"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
        Masuk
      </Button>
    </form>
  )
}
