"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

export function LoginForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(() => {
      setTimeout(() => {
        toast.success("Berhasil masuk")
        router.push("/dashboard/profile")
      }, 600)
    })
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div>
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="nama@example.com"
          autoComplete="email"
          required
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
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
