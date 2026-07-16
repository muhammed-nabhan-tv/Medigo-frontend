"use client"

import * as React from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ShieldAlert, ShieldCheck, Lock, Loader2, ArrowRight, ArrowLeft, Phone, Calendar } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/Input"
import { PasswordInput } from "@/components/ui/PasswordInput"
import { Checkbox } from "@/components/ui/Checkbox"
import { DatePicker } from "@/components/ui/DatePicker"
import { useAuth } from "@/context/AuthContext"



// Define complete schema
const signUpSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Full Name must be at least 2 characters" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  dob: z
    .string()
    .min(1, { message: "Date of Birth is required" }),
  phone: z
    .string()
    .min(10, { message: "Please enter a valid phone number" }),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must authorize the HIPAA and Privacy Policy terms to continue.",
  }),
})

type SignUpFormValues = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const [step, setStep] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(false)
  const [successMsg, setSuccessMsg] = React.useState("")
  const [errorMsg, setErrorMsg] = React.useState("")
  const [passwordValue, setPasswordValue] = React.useState("")
  const { signUp } = useAuth()
  const router = useRouter()
  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      dob: "",
      phone: "",
      agreeTerms: false,
    },
    mode: "onTouched",
  })

  // Watch password field for real-time strength meter
  const password = watch("password")
  React.useEffect(() => {
    setPasswordValue(password || "")
  }, [password])

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

  const score = getStrengthScore(passwordValue)

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

  // Navigate to Step 2 if Step 1 inputs are valid
  const handleContinue = async () => {
    const isStep1Valid = await trigger(["fullName", "email", "password"])
    if (isStep1Valid) {
      setStep(2)
    }
  }

  // Handle final submission
  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true)
    setSuccessMsg("")
    setErrorMsg("")
    try {
      await signUp({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        dob: data.dob,
        phone: data.phone,
        agreeTerms: data.agreeTerms,
      })
      setSuccessMsg("Account successfully created!")
      router.push('/signin')
      
    } catch (error: any) {
      setErrorMsg(error.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Left Column - Trust Section */}
      <div className="relative hidden w-full lg:flex lg:w-1/2 mesh-gradient p-16 flex-col justify-between overflow-hidden">
        {/* Decorative ambient spots */}
        <div className="absolute top-[20%] right-[-10%] w-[70%] h-[70%] rounded-full ambient-dot-1 animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full ambient-dot-2 animate-pulse-slow pointer-events-none" />

        {/* Top Logo */}
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

        {/* Trust Card Block with Entrance Animation */}
        <div className="relative my-auto max-w-md mx-auto z-10 space-y-8 animate-fade-in-up">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Create a secure health profile
            </h2>
            <p className="text-slate-400 text-sm">
              Your patient health space is backed by military-grade encryption compliance schemas.
            </p>
          </div>

          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 text-white shadow-xl shadow-emerald-950/10 backdrop-blur-sm trust-card-glow hover:translate-y-[-4px] transition-transform duration-300">
            <div className="flex items-center gap-4 border-b border-slate-800/80 pb-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100">HIPAA Compliant & Encrypted Data</h3>
                <p className="text-xs text-slate-400">Rest assured that your records are safe and secure.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Data Storage Standard</span>
                <span className="font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">AES-256 Bit</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Network Transmission Security</span>
                <span className="font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">SSL/TLS 1.3</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Infrastructure Schema</span>
                <span className="font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">SOC2 Type II</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 text-slate-500 text-xs">
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              <span>E2E Encrypted</span>
            </div>
            <div className="h-1 w-1 bg-slate-700 rounded-full" />
            <span>GDPR Ready</span>
            <div className="h-1 w-1 bg-slate-700 rounded-full" />
            <span>2FA Support</span>
          </div>
        </div>

        {/* Footer */}
        <div className="relative text-xs text-slate-500 z-10 animate-fade-in">
          &copy; {new Date().getFullYear()} Medigo Inc. HIPAA Privacy Compliant Platform.
        </div>
      </div>

      {/* Right Column - Form Container */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2 sm:px-6 lg:px-16 bg-white dark:bg-slate-900">
        <div className="w-full max-w-[460px] space-y-8 animate-fade-in-up">
          {/* Header */}
          <div className="space-y-2">
            {/* Logo on mobile only */}
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

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create your health profile
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:underline"
              >
                Log in
              </Link>
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>STEP {step} OF 2</span>
              <span>{step === 1 ? "Account Credentials" : "Basic Identification"}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 ease-in-out"
                style={{ width: step === 1 ? "50%" : "100%" }}
              />
            </div>
          </div>

          {/* Multi-step Form Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="space-y-5"
                >
                  <Input
                    id="fullName"
                    type="text"
                    label="Full Name"
                    placeholder="John Doe"
                    autoComplete="name"
                    error={errors.fullName?.message}
                    disabled={isLoading}
                    {...register("fullName")}
                  />

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

                  <div className="space-y-2">
                    <PasswordInput
                      id="password"
                      label="Password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      error={errors.password?.message}
                      disabled={isLoading}
                      {...register("password")}
                    />

                    {/* Password Strength Meter */}
                    <div className="space-y-1.5 pt-1.5">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-500">Password Strength</span>
                        <span className={score === 0 ? "text-slate-400" : score <= 2 ? "text-amber-500" : "text-emerald-600"}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 h-1">
                        {[1, 2, 3, 4].map((barIndex) => (
                          <div
                            key={barIndex}
                            className={`h-full rounded-full transition-all duration-300 ${
                              barIndex <= score ? strength.color : "bg-slate-200 dark:bg-slate-800"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleContinue}
                    disabled={isLoading}
                    className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-slate-800 active:scale-[0.98] transition-all select-none cursor-pointer dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    Continue to profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="space-y-5"
                >
                  <DatePicker
                    id="dob"
                    label="Date of Birth"
                    error={errors.dob?.message}
                    disabled={isLoading}
                    {...register("dob")}
                  />

                  <Input
                    id="phone"
                    type="tel"
                    label="Phone Number"
                    placeholder="(555) 000-0000"
                    autoComplete="tel"
                    error={errors.phone?.message}
                    disabled={isLoading}
                    {...register("phone")}
                  />

                  {/* HIPAA checkbox terms */}
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2.5">
                      <Checkbox
                        id="agreeTerms"
                        onCheckedChange={(checked) => {
                          setValue("agreeTerms", !!checked, { shouldValidate: true })
                        }}
                        disabled={isLoading}
                      />
                      <label
                        htmlFor="agreeTerms"
                        className="text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none leading-tight"
                      >
                        I agree to the Patient Privacy Policy and HIPAA Authorization terms.
                      </label>
                    </div>
                    {errors.agreeTerms && (
                      <p className="text-xs font-medium text-red-600 dark:text-red-400 transition-all animate-fade-in" role="alert">
                        {errors.agreeTerms.message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={isLoading}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 active:scale-[0.98] transition-all select-none cursor-pointer dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex flex-1 items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/10 transition-all duration-150 hover:bg-emerald-700 hover:shadow-emerald-700/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 select-none cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Secure Account"
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  )
}
