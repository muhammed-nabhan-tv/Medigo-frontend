"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  Calendar,
  LogOut,
  UserPlus,
  Users,
  Loader2,
  CheckCircle2,
  Clock,
  Mail,
  Trash2,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { Input } from "@/components/ui/Input"
import { motion, AnimatePresence } from "framer-motion"

interface Appointment {
  _id: string
  patientName: string
  doctorName: string
  specialty?: string
  date: string
  time: string
  reason: string
  type: string
  status: string
}

interface Doctor {
  _id: string
  fullName: string
  email: string
  phone: string
  category: string
  education: string
  availableDays: string[]
  availableSlots: string[]
  isVerified: boolean
}

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "11:30 AM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
]

const emptyDoctorForm = {
  fullName: "",
  email: "",
  phone: "",
  category: "",
  education: "",
  experience: "0",
  availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as string[],
  availableSlots: ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM"] as string[],
}

export default function ClinicDashboard() {
  const { user, token, signOut } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<"appointments" | "doctors" | "add">("appointments")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [inviteLink, setInviteLink] = useState("")
  const [form, setForm] = useState(emptyDoctorForm)

  useEffect(() => {
    if (!user) return
    if (user.role !== "clinic") {
      router.push("/clinic/signin")
      return
    }
    if (!token) return

    const load = async () => {
      setIsLoading(true)
      setErrorMsg("")
      try {
        const [appsRes, docsRes] = await Promise.all([
          fetch("http://localhost:5000/api/clinic/appointments", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/clinic/doctors", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (appsRes.ok) setAppointments(await appsRes.json())
        else setErrorMsg("Could not load clinic appointments")

        if (docsRes.ok) setDoctors(await docsRes.json())
      } catch {
        setErrorMsg("Failed to connect to the server")
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [user, token, router])

  const toggleDay = (day: string) => {
    setForm((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }))
  }

  const toggleSlot = (slot: string) => {
    setForm((prev) => ({
      ...prev,
      availableSlots: prev.availableSlots.includes(slot)
        ? prev.availableSlots.filter((s) => s !== slot)
        : [...prev.availableSlots, slot],
    }))
  }

  const handleInviteDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setIsSubmitting(true)
    setErrorMsg("")
    setSuccessMsg("")
    setInviteLink("")

    try {
      const res = await fetch("http://localhost:5000/api/clinic/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          category: form.category,
          education: form.education,
          experience: Number(form.experience) || 0,
          availableDays: form.availableDays,
          availableSlots: form.availableSlots,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to invite doctor")

      setSuccessMsg(data.message || "Doctor invited successfully")
      if (data.inviteLink) setInviteLink(data.inviteLink)
      if (data.doctor) {
        setDoctors((prev) => [
          {
            _id: data.doctor.id,
            fullName: data.doctor.fullName,
            email: data.doctor.email,
            phone: data.doctor.phone,
            category: data.doctor.category,
            education: data.doctor.education,
            availableDays: data.doctor.availableDays,
            availableSlots: data.doctor.availableSlots,
            isVerified: data.doctor.isVerified,
          },
          ...prev.filter((d) => d.email !== data.doctor.email),
        ])
      }
      setForm(emptyDoctorForm)
      setActiveTab("doctors")
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to add doctor")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveDoctor = async (doctorId: string) => {
    if (!confirm("Are you sure you want to remove this doctor? This action cannot be undone.")) return
    if (!token) return
    setErrorMsg("")
    setSuccessMsg("")

    try {
      const res = await fetch(`http://localhost:5000/api/clinic/doctors/${doctorId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to remove doctor")

      setSuccessMsg(data.message || "Doctor removed successfully")
      setDoctors((prev) => prev.filter((doc) => doc._id !== doctorId))
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to remove doctor")
    }
  }

  if (!user || user.role !== "clinic") return null

  const clinicLabel = user.clinicName || user.fullName

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800 sm:p-6 lg:p-8 dark:bg-slate-950 dark:text-slate-200">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-slate-200/50 bg-white/60 p-6 shadow-sm backdrop-blur-md sm:flex-row dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Clinic portal
              </h1>
              <p className="text-xs font-medium text-slate-500">{clinicLabel}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/40 dark:text-red-400"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Appointments</p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {appointments.length}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Doctors</p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {doctors.length}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Active doctors</p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {doctors.filter((d) => d.isVerified).length}
              </h3>
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-300">
            {successMsg}
            {inviteLink && (
              <p className="mt-2 break-all text-xs font-normal text-emerald-700">
                Invite link (share manually):{" "}
                <a href={inviteLink} className="underline">
                  {inviteLink}
                </a>
              </p>
            )}
          </div>
        )}
        {errorMsg && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-800">
            {errorMsg}
          </div>
        )}

        <div className="flex gap-6 border-b border-slate-200 text-sm font-bold dark:border-slate-800">
          {(
            [
              ["appointments", "Appointments"],
              ["doctors", "Doctors"],
              ["add", "Add doctor"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`relative cursor-pointer pb-3 transition-colors ${
                activeTab === key ? "text-emerald-600" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
              {activeTab === key && (
                <div className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-emerald-600" />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "appointments" && (
            <motion.div
              key="appointments"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white">
                Clinic appointments
              </h3>
              {isLoading ? (
                <div className="flex flex-col items-center gap-2 py-12 text-slate-500">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                  <p className="text-xs font-semibold">Loading appointments...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-500">No appointments yet</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Appointments with your clinic&apos;s doctors will appear here
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-bold tracking-wider text-slate-500 uppercase dark:border-slate-800">
                        <th className="px-4 py-3">Patient</th>
                        <th className="px-4 py-3">Doctor</th>
                        <th className="px-4 py-3">Date & time</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((app) => (
                        <tr
                          key={app._id}
                          className="border-b border-slate-100 dark:border-slate-800/60"
                        >
                          <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">
                            {app.patientName}
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-semibold">{app.doctorName}</div>
                            <div className="text-xs text-slate-500">{app.specialty}</div>
                          </td>
                          <td className="px-4 py-4 font-semibold text-slate-700">
                            <div>{app.date}</div>
                            <div className="text-xs font-medium text-slate-500">{app.time}</div>
                          </td>
                          <td className="px-4 py-4 text-xs font-semibold text-emerald-600">
                            {app.type}
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "doctors" && (
            <motion.div
              key="doctors"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {doctors.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-12 text-center dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-sm font-semibold text-slate-500">No doctors yet</p>
                  <button
                    onClick={() => setActiveTab("add")}
                    className="mt-3 text-sm font-bold text-emerald-600 hover:underline"
                  >
                    Add your first doctor
                  </button>
                </div>
              ) : (
                doctors.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200/60 bg-white p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white">{doc.fullName}</h4>
                        {doc.isVerified ? (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            <Clock className="h-3 w-3" /> Pending password
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-emerald-600">{doc.category}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {doc.email} · {doc.phone}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{doc.education}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-xs text-slate-500">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">Available</p>
                        <p>{(doc.availableDays || []).join(", ")}</p>
                        <p className="mt-1">{(doc.availableSlots || []).slice(0, 4).join(" · ")}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoctor(doc._id)}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-red-200 text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/20"
                        title="Remove doctor"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === "add" && (
            <motion.form
              key="add"
              onSubmit={handleInviteDoctor}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-5 rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add a doctor
                </h3>
              </div>
              <p className="text-sm text-slate-500">
                Enter the doctor&apos;s details. They will receive an email with an activation link to set their password and access Medigo.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Full name</label>
                  <Input
                    required
                    value={form.fullName || ""}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Dr. Jane Smith"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Email</label>
                  <Input
                    required
                    type="email"
                    value={form.email || ""}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="doctor@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Phone</label>
                  <Input
                    required
                    value={form.phone || ""}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Category / specialty</label>
                  <Input
                    required
                    value={form.category || ""}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Cardiology"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-semibold">Education</label>
                  <Input
                    required
                    value={form.education || ""}
                    onChange={(e) => setForm({ ...form, education: e.target.value })}
                    placeholder="MD, Harvard Medical School"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Experience (years)</label>
                  <Input
                    type="number"
                    min={0}
                    value={form.experience || ""}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Available days</label>
                <div className="flex flex-wrap gap-2">
                  {WEEK_DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        form.availableDays.includes(day)
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Available time slots</label>
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleSlot(slot)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        form.availableSlots.includes(slot)
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60 sm:w-auto sm:px-8"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Add doctor & send invite
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
