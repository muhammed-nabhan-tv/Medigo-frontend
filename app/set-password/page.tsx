"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, KeyRound, CheckCircle2 } from "lucide-react"
import { PasswordInput } from "@/components/ui/PasswordInput"

export default function SetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <SetPasswordForm />
    </React.Suspense>
  )
}

function SetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [doctorName, setDoctorName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [validating, setValidating] = React.useState(true)
  const [valid, setValid] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState("")
  const [done, setDone] = React.useState(false)

  React.useEffect(() => {
    if (!token) {
      setValidating(false)
      setValid(false)
      setErrorMsg("Missing invite token")
      return
    }

    const validate = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/clinic/invite/validate?token=${encodeURIComponent(token)}`
        )
        const data = await res.json()
        if (!res.ok || !data.valid) {
          setValid(false)
          setErrorMsg(data.message || "Invalid or expired invite link")
        } else {
          setValid(true)
          setDoctorName(data.fullName || "")
          setEmail(data.email || "")
        }
      } catch {
        setValid(false)
        setErrorMsg("Could not validate invite link")
      } finally {
        setValidating(false)
      }
    }

    validate()
  }, [token])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters")
      return
    }
    if (password !== confirm) {
      setErrorMsg("Passwords do not match")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("http://localhost:5000/api/clinic/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to set password")
      setDone(true)
      setTimeout(() => router.push("/signin"), 2500)
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to set password")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-[420px] space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white">
            {done ? <CheckCircle2 className="h-6 w-6" /> : <KeyRound className="h-6 w-6" />}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {done ? "You're all set" : "Set your password"}
          </h1>
          {!done && doctorName && (
            <p className="text-sm text-slate-500">
              Welcome, <span className="font-semibold text-slate-700">{doctorName}</span>
              {email ? ` (${email})` : ""}
            </p>
          )}
          {done && (
            <p className="text-sm text-slate-500">
              Your doctor account is active. Redirecting to sign in…
            </p>
          )}
        </div>

        {validating && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        )}

        {!validating && !valid && !done && (
          <div className="space-y-4 text-center">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMsg || "This invite link is invalid or has expired."}
            </div>
            <Link href="/signin" className="text-sm font-semibold text-emerald-600 hover:underline">
              Go to sign in
            </Link>
          </div>
        )}

        {!validating && valid && !done && (
          <form onSubmit={onSubmit} className="space-y-5">
            {errorMsg && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMsg}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">New password</label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Confirm password</label>
              <PasswordInput
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Activate account
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
