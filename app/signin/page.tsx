"use client"

import * as React from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Shield, Activity, Users, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { PasswordInput } from "@/components/ui/PasswordInput"
import { Checkbox } from "@/components/ui/Checkbox"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

// Form validation schema
const signInSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean(),
})

type SignInFormValues = z.infer<typeof signInSchema>

export default function SignInPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [successMsg, setSuccessMsg] = React.useState("")
  const [errorMsg, setErrorMsg] = React.useState("")
  const [role, setRole] = React.useState<"patient" | "doctor" | "clinic">("patient")
  
  // OTP 2FA States
  const [showOTPVerify, setShowOTPVerify] = React.useState(false)
  const [otpEmail, setOtpEmail] = React.useState("")
  const [phoneObfuscated, setPhoneObfuscated] = React.useState("")
  const [debugOtp, setDebugOtp] = React.useState("")
  const [otpCode, setOtpCode] = React.useState("")
  const [isVerifying, setIsVerifying] = React.useState(false)

  const { signIn, verifyOTP, resendOTP, clinicSignIn } = useAuth()
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const onSubmit = async (data: SignInFormValues) => {
    setIsLoading(true)
    setSuccessMsg("")
    setErrorMsg("")
    try {
      if (role === "clinic") {
        const res = await clinicSignIn({
          email: data.email,
          password: data.password,
        })
        setSuccessMsg("Success! Redirecting to dashboard...")
        setTimeout(() => {
          router.push('/clinic')
        }, 1000)
      } else {
        const res = await signIn({
          email: data.email,
          password: data.password,
        })
        
        if (res && res.requireOTP) {
          setOtpEmail(res.email)
          setPhoneObfuscated(res.phoneObfuscated || "")
          if (res.debugOtp) {
            setDebugOtp(res.debugOtp)
          } else {
            setDebugOtp("")
          }
          setShowOTPVerify(true)
          setSuccessMsg("Verification code sent to your registered phone!")
        } else {
          setSuccessMsg("Success! Redirecting to dashboard...")
          const dest = role === "doctor" ? "/doctor" : "/"
          setTimeout(() => {
            router.push(dest)
          }, 1000)
        }
      }
    } catch (error: any) {
      setErrorMsg(error.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpCode.length !== 6) {
      setErrorMsg("Please enter a valid 6-digit code")
      return
    }
    setIsVerifying(true)
    setErrorMsg("")
    setSuccessMsg("")
    try {
      const res = await verifyOTP(otpEmail, otpCode, "login")
      setSuccessMsg("Verification successful! Redirecting to dashboard...")
      const role = res?.user?.role
      const dest = role === "doctor" ? "/doctor" : role === "clinic" ? "/clinic" : "/"
      setTimeout(() => {
        router.push(dest)
      }, 1000)
    } catch (error: any) {
      setErrorMsg(error.message || "Invalid or expired verification code")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    setIsVerifying(true)
    setErrorMsg("")
    setSuccessMsg("")
    try {
      const res = await resendOTP(otpEmail)
      setSuccessMsg("A new verification code has been sent!")
      if (res && res.debugOtp) {
        setDebugOtp(res.debugOtp)
      } else {
        setDebugOtp("")
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to resend code")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Left Column - Branding (Visuals) */}
      <div className="relative hidden w-full lg:flex lg:w-1/2 mesh-gradient p-16 flex-col justify-between overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full ambient-dot-1 animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full ambient-dot-2 animate-pulse-slow pointer-events-none" />

        {/* Top Branding Logo */}
        <div className="relative flex items-center gap-2 text-white animate-fade-in">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">
            Medi<span className="text-emerald-400">go</span>
          </span>
        </div>

        {/* Visual / Value Prop Section */}
        <div className="relative my-auto max-w-lg space-y-8 text-white z-10">
          <div className="space-y-4 animate-fade-in-up">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl leading-tight">
              Your health, <br />
              <span className="text-emerald-400 bg-clip-text">unified.</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Access medical records, consult with trusted clinicians, and manage prescriptions instantly all in one place.
            </p>
          </div>

          <ul className="space-y-6 pt-4 animate-fade-in-up [animation-delay:200ms] fill-mode-forwards opacity-0">
            <li className="flex gap-4 items-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-100">Secure Health Records</h4>
                <p className="text-sm text-slate-400">End-to-end encrypted storage for laboratory results, charts, and histories.</p>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-100">Instant Telehealth Access</h4>
                <p className="text-sm text-slate-400">Connect with boards-certified medical professionals anytime, anywhere.</p>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-100">Integrated Care Teams</h4>
                <p className="text-sm text-slate-400">Seamless coordination between primary care, therapists, and specialists.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="relative text-xs text-slate-500 z-10 animate-fade-in">
          &copy; {new Date().getFullYear()} Medigo Inc. All rights reserved. HIPAA Compliant & Certified.
        </div>
      </div>

      {/* Right Column - Form Container */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2 sm:px-6 lg:px-16 bg-white dark:bg-slate-900">
        <div className="w-full max-w-[420px] space-y-8 animate-fade-in-up">
          {/* Header */}
          <div className="space-y-3">
            {/* Logo display on mobile only */}
            <div className="flex lg:hidden items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Medi<span className="text-emerald-600">go</span>
              </span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter your credentials to access your patient dashboard.
            </p>
          </div>

          {/* Social login */}
          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-emerald-500/10 focus-visible:border-slate-300 active:scale-[0.99] cursor-pointer dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 dark:text-slate-400 font-medium">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          {showOTPVerify ? (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Verify Your Identity</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  We've sent a 6-digit verification code to your phone number ending in <span className="font-semibold text-slate-700 dark:text-slate-200">{phoneObfuscated || "digits"}</span>.
                </p>
              </div>

              {successMsg && (
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 text-sm font-medium text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30 animate-fade-in">
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm font-medium text-red-800 dark:text-red-300 border border-red-100 dark:border-red-900/30 animate-fade-in" role="alert">
                  {errorMsg}
                </div>
              )}

              {debugOtp && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/30 text-center animate-pulse">
                  Debug Verification Code: <span className="font-mono text-sm underline select-all">{debugOtp}</span>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="otp" className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-550 block text-center">
                  6-Digit OTP Code
                </label>
                <input
                  id="otp"
                  type="text"
                  pattern="\d*"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  disabled={isVerifying}
                  className="w-full text-center text-3xl font-mono tracking-[0.5em] pl-[0.25em] h-14 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold"
                  required
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isVerifying || otpCode.length !== 6}
                  className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/10 transition-all duration-150 hover:bg-emerald-700 hover:shadow-emerald-700/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer select-none"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Complete Sign In"
                  )}
                </button>

                <div className="flex items-center justify-between text-xs px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOTPVerify(false)
                      setErrorMsg("")
                      setSuccessMsg("")
                      setOtpCode("")
                    }}
                    disabled={isVerifying}
                    className="font-semibold text-slate-500 hover:text-slate-750 transition-colors cursor-pointer bg-transparent border-0"
                  >
                    Back to credentials
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isVerifying}
                    className="font-semibold text-emerald-600 hover:text-emerald-750 transition-colors cursor-pointer bg-transparent border-0"
                  >
                    Resend code
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {successMsg && (
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 text-sm font-medium text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30 animate-fade-in">
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm font-medium text-red-800 dark:text-red-300 border border-red-100 dark:border-red-900/30 animate-fade-in" role="alert">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">I am signing in as a</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("patient")}
                    className={`py-3 px-1 rounded-xl border text-xs font-bold transition-all select-none cursor-pointer text-center ${
                      role === "patient"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("doctor")}
                    className={`py-3 px-1 rounded-xl border text-xs font-bold transition-all select-none cursor-pointer text-center ${
                      role === "doctor"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    Practitioner
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("clinic")}
                    className={`py-3 px-1 rounded-xl border text-xs font-bold transition-all select-none cursor-pointer text-center ${
                      role === "clinic"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    Clinic
                  </button>
                </div>
              </div>

              <Input
                id="email"
                type="email"
                label="Email Address"
                placeholder="name@example.com"
                autoComplete="email"
                error={errors.email?.message}
                disabled={isLoading}
                {...register("email")}
              />

              <PasswordInput
                id="password"
                label="Password"
                placeholder="••••••••"
                autoComplete="current-password"
                forgotPasswordHref="#forgot"
                error={errors.password?.message}
                disabled={isLoading}
                {...register("password")}
              />

              {/* Checkbox and Persistence */}
              <div className="flex items-center space-x-2.5">
                <Checkbox
                  id="rememberMe"
                  onCheckedChange={(checked) => {
                    // Connect state manually with react-hook-form register
                    const checkboxElem = document.getElementById("rememberMe") as HTMLInputElement | null;
                    if (checkboxElem) {
                      checkboxElem.checked = !!checked;
                    }
                  }}
                  disabled={isLoading}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none leading-none"
                >
                  Keep me signed in for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/10 transition-all duration-150 hover:bg-emerald-700 hover:shadow-emerald-700/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer select-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In to Dashboard"
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="space-y-3 text-center text-sm">
            <div>
              <span className="text-slate-500 dark:text-slate-400">
                Don&apos;t have an account?{" "}
              </span>
              <Link
                href="/signup"
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:underline"
              >
                Sign up
              </Link>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Clinic admin?{" "}</span>
              <Link
                href="/clinic/signin"
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:underline"
              >
                Clinic sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
