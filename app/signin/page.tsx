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
  const { signIn } = useAuth()
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
      await signIn({
        email: data.email,
        password: data.password,
      })
      setSuccessMsg("Success! Redirecting to dashboard...")
      router.push('/')
    } catch (error: any) {
      setErrorMsg(error.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
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

          {/* Footer */}
          <div className="text-center text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Don't have an account?{" "}
            </span>
            <Link
              href="/signup"
              className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
