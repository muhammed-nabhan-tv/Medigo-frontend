"use client"

import * as React from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Building2, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { PasswordInput } from "@/components/ui/PasswordInput"
import { Checkbox } from "@/components/ui/Checkbox"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

const schema = z.object({
  clinicName: z.string().min(2, "Clinic name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms",
  }),
})

type FormValues = z.infer<typeof schema>

export default function ClinicSignUpPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState("")
  const { clinicSignUp } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      clinicName: "",
      email: "",
      phone: "",
      password: "",
      agreeTerms: false,
    },
  })

  const agreeTerms = watch("agreeTerms")

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    setErrorMsg("")
    try {
      await clinicSignUp({
        clinicName: data.clinicName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        agreeTerms: true,
      })
      router.push("/clinic")
    } catch (error: any) {
      setErrorMsg(error.message || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-[440px] space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Register your clinic
          </h1>
          <p className="text-sm text-slate-500">
            Create a clinic account to invite doctors and track appointments
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Clinic name</label>
            <Input placeholder="City Care Clinic" {...register("clinicName")} />
            {errors.clinicName && <p className="text-xs text-red-600">{errors.clinicName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <Input type="email" placeholder="admin@clinic.com" {...register("email")} />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Phone</label>
            <Input type="tel" placeholder="+91 9876543210" {...register("phone")} />
            {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <PasswordInput placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              checked={!!agreeTerms}
              onCheckedChange={(checked) =>
                setValue("agreeTerms", !!checked, { shouldValidate: true })
              }
            />
            <span className="text-sm text-slate-600">I agree to the Medigo terms and privacy policy</span>
          </div>
          {errors.agreeTerms && <p className="text-xs text-red-600">{errors.agreeTerms.message}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create clinic account
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link href="/clinic/signin" className="font-semibold text-emerald-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
