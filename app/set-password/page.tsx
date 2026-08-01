"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ShieldCheck, ShieldAlert, Lock, Loader2, ArrowRight, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/Input"
import { PasswordInput } from "@/components/ui/PasswordInput"

export default function SetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [isValidating, setIsValidating] = React.useState(true)
  const [tokenError, setTokenError] = React.useState("")
  const [doctorInfo, setDoctorInfo] = React.useState<{ fullName: string; email: string; category: string } | null>(null)

  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [successMsg, setSuccessMsg] = React.useState("")
  const [errorMsg, setErrorMsg] = React.useState("")

  // Validate the invitation token on load
  React.useEffect(() => {
    if (!token) {
      setTokenError("No invitation token found in the URL. Please make sure you clicked the full link.")
      setIsValidating(false)
      return
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/clinic/invite/validate?token=${token}`)
        const data = await response.json()
        if (!response.ok || !data.valid) {
          setTokenError(data.message || "This invitation link is invalid or has expired.")
        } else {
          setDoctorInfo({
            fullName: data.fullName,
            email: data.email,
            category: data.category,
          })
        }
      } catch (err) {
        setTokenError("Unable to connect to the verification server. Please try again later.")
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

  // Password strength logic
  const getStrengthScore = (pass: string) => {
    if (!pass) return 0
    let score = 0
    if (pass.length >= 8) score += 1
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1
    return score
  }

  const score = getStrengthScore(password)

  const getStrengthMeta = (score: number) => {
    switch (score) {
      case 0:
        return { label: "None", color: "bg-slate-200" }
      case 1:
        return { label: "Weak", color: "bg-red-500" }
      case 2:
        return { label: "Fair", color: "bg-amber-400" }
      case 3:
        return { label: "Good", color: "bg-emerald-500" }
      case 4:
        return { label: "Strong", color: "bg-emerald-600" }
      default:
        return { label: "None", color: "bg-slate-200" }
    }
  }

  const strength = getStrengthMeta(score)

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long")
      return
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match")
      return
    }

    setIsSubmitting(true)
    setErrorMsg("")
    setSuccessMsg("")

    try {
      const response = await fetch("http://localhost:5000/api/clinic/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Failed to set password")
      }

      setSuccessMsg("Password set successfully! Your account is now active.")
      setTimeout(() => {
        router.push("/Login")
      }, 2000)
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 font-sans">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute -top-[30%] -right-[30%] w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-[30%] -left-[30%] w-64 h-64 rounded-full bg-emerald-600/5 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col items-center text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-600 shadow-sm mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Activate Doctor Account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Set your secure password to complete activation
          </p>
        </div>

        <AnimatePresence mode="wait">
          {isValidating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-10 space-y-3"
            >
              <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
              <p className="text-sm text-slate-500 font-medium">Validating invitation token...</p>
            </motion.div>
          ) : tokenError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center py-6 space-y-4"
            >
              <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="space-y-1 text-center">
                <h3 className="font-bold text-slate-900 dark:text-white">Link Invalid or Expired</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                  {tokenError}
                </p>
              </div>
              <button
                onClick={() => router.push("/")}
                className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-800 underline transition-all"
              >
                Go back to home page
              </button>
            </motion.div>
          ) : successMsg ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-8 space-y-4 text-center"
            >
              <div className="h-14 w-14 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-455 border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Activation Successful!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {successMsg}
                </p>
              </div>
              <p className="text-xs text-slate-400">Redirecting to login...</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmitPassword}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {doctorInfo && (
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-955/50 p-4 border border-slate-100 dark:border-slate-900 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider">Doctor Profile</span>
                    <span className="bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 rounded-full text-emerald-700 dark:text-emerald-400 font-bold">
                      {doctorInfo.category}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{doctorInfo.fullName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{doctorInfo.email}</p>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="rounded-xl bg-red-50 dark:bg-red-955/20 border border-red-100 dark:border-red-900/30 p-3 text-xs font-semibold text-red-800 dark:text-red-400 leading-relaxed">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-550 block">
                    Choose Password
                  </label>
                  <PasswordInput
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="h-11 rounded-xl"
                  />
                </div>

                {password && (
                  <div className="space-y-1.5 animate-fade-in">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Password Strength:</span>
                      <span className={score === 4 ? "text-emerald-600" : score >= 2 ? "text-amber-500" : "text-red-500"}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="flex h-1.5 gap-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-full flex-1 transition-all duration-300 ${
                            score >= step ? strength.color : "bg-transparent"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-550 block">
                    Confirm Password
                  </label>
                  <PasswordInput
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Verify your password"
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || password.length < 8 || password !== confirmPassword}
                className="flex w-full items-center justify-center rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/10 transition duration-150 hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 select-none cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Activating Account...
                  </>
                ) : (
                  <>
                    Set Password & Activate
                    <ArrowRight className="ml-2 h-4.5 w-4.5" />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
