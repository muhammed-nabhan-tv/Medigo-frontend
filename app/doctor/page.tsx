"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Calendar, 
  Clock, 
  User, 
  Award, 
  CheckCircle2, 
  XCircle, 
  LogOut, 
  Users, 
  Star, 
  Briefcase,
  TrendingUp,
  Loader2
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"

interface Appointment {
  _id: string
  patientName: string
  date: string
  time: string
  reason: string
  type: string
  status: string
}

export default function DoctorDashboard() {
  const { user, token, signOut } = useAuth()
  const router = useRouter()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [activeTab, setActiveTab] = useState("schedule") // schedule | profile
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Doctor availability editing states (mock settings)
  const [availableDays, setAvailableDays] = useState<string[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])

  const weekDaysList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const timeSlotsList = ["09:00 AM", "10:00 AM", "11:00 AM", "11:30 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "04:30 PM"]

  // Load doctor profile and appointments
  useEffect(() => {
    if (!user || user.role !== "doctor") {
      router.push("/signin")
      return
    }

    // Set availability days/slots
    setAvailableDays((user as any).availableDays || ["Monday", "Wednesday", "Friday"])
    setAvailableSlots((user as any).availableSlots || ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM"])

    if (token) {
      const fetchDoctorSchedule = async () => {
        try {
          setIsLoading(true)
          const res = await fetch("http://localhost:5000/api/appointments/doctor", {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          })
          if (res.ok) {
            const data = await res.json()
            setAppointments(data)
          } else {
            setErrorMsg("Could not fetch schedules from server.")
          }
        } catch (err) {
          console.error("Failed to load doctor appointments:", err)
          setErrorMsg("Failed to connect to appointments server.")
        } finally {
          setIsLoading(false)
        }
      }
      fetchDoctorSchedule()
    }
  }, [user, token, router])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!token) return
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        const updated = await res.json()
        setAppointments(appointments.map(app => app._id === id ? updated : app))
        setSuccessMsg(`Appointment successfully marked as ${newStatus}!`)
        setTimeout(() => setSuccessMsg(""), 3000)
      } else {
        setErrorMsg("Failed to update status on server.")
        setTimeout(() => setErrorMsg(""), 3000)
      }
    } catch (err) {
      console.error("Failed to update appointment:", err)
      setErrorMsg("Network error updating appointment status.")
      setTimeout(() => setErrorMsg(""), 3000)
    }
  }

  const toggleDay = (day: string) => {
    setAvailableDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const toggleSlot = (slot: string) => {
    setAvailableSlots(prev => 
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    )
  }

  const handleSaveAvailability = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg("Availability schedules updated successfully!")
    setTimeout(() => setSuccessMsg(""), 4000)
  }

  if (!user || user.role !== "doctor") return null

  // Calculate stats
  const totalConsults = appointments.length
  const completedConsults = appointments.filter(app => app.status === "Completed").length
  const pendingConsults = appointments.filter(app => app.status === "Confirmed").length

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-4 sm:p-6 lg:p-8 font-sans min-h-screen">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Top Navigation / Portal Header */}
        <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-850/50 backdrop-blur-md rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">PRACTITIONER PORTAL</h1>
              <p className="text-xs text-slate-550 dark:text-slate-400 font-medium">MediGo Automated Healthcare Scheduler</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.fullName}</p>
              <p className="text-xs text-slate-550 dark:text-slate-400 font-semibold">{(user as any).category || "Specialist"}</p>
            </div>
            <button 
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer select-none transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pending Consults</p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{pendingConsults}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Patient Logs</p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{totalConsults}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-950/20 dark:text-amber-400 flex items-center justify-center">
              <Star className="h-5 w-5 fill-amber-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Specialist Rating</p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{(user as any).rating || "4.9"}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400 flex items-center justify-center">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Experience</p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{(user as any).experience || 10} Yrs</h3>
            </div>
          </div>
        </div>

        {/* Messaging Area */}
        {successMsg && (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 p-4 text-sm font-semibold text-emerald-800 dark:text-emerald-300 animate-fade-in">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 p-4 text-sm font-semibold text-red-800 dark:text-red-300 animate-fade-in">
            {errorMsg}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-bold">
          <button 
            onClick={() => setActiveTab("schedule")}
            className={`pb-3 transition-colors relative cursor-pointer ${
              activeTab === "schedule" ? "text-emerald-600 dark:text-emerald-450" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Schedules & Log list
            {activeTab === "schedule" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-450 rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab("availability")}
            className={`pb-3 transition-colors relative cursor-pointer ${
              activeTab === "availability" ? "text-emerald-600 dark:text-emerald-450" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Define Available slots
            {activeTab === "availability" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-450 rounded-full" />}
          </button>
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {activeTab === "schedule" && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Patient Appointment Requests</h3>

                {isLoading ? (
                  <div className="flex flex-col items-center py-12 text-slate-500 gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    <p className="text-xs font-semibold">Retrieving patient schedules...</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-12 text-slate-450 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <p className="text-sm font-semibold">No scheduled patient visits found.</p>
                    <p className="text-xs text-slate-400 mt-1">When patients schedule consults, they will show up here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Patient Name</th>
                          <th className="py-3 px-4">Schedule Date & Time</th>
                          <th className="py-3 px-4">Consult Type</th>
                          <th className="py-3 px-4">Visit Reason</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((app) => (
                          <tr key={app._id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                            <td className="py-4 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-400">
                                {app.patientName[0]}
                              </div>
                              {app.patientName}
                            </td>
                            <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-350">
                              <div>{app.date}</div>
                              <div className="text-xs text-slate-500 font-medium">{app.time}</div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:text-emerald-450 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-500/10">
                                {app.type}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 max-w-[150px] truncate" title={app.reason}>
                              {app.reason}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                app.status === "Completed"
                                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
                                  : app.status === "Cancelled"
                                  ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"
                                  : "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              {app.status === "Confirmed" && (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleUpdateStatus(app._id, "Completed")}
                                    className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 cursor-pointer transition-colors"
                                    title="Mark completed"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(app._id, "Cancelled")}
                                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-600 dark:text-red-400 cursor-pointer transition-colors"
                                    title="Cancel request"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                              {app.status !== "Confirmed" && (
                                <span className="text-xs text-slate-400 italic">No actions</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "availability" && (
            <motion.div
              key="availability"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <form onSubmit={handleSaveAvailability} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Configure Availability slots</h3>
                  <p className="text-xs text-slate-500">Edit the schedule properties patients can book against your profile.</p>
                </div>

                {/* Available Days */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Available days</label>
                  <div className="flex flex-wrap gap-2">
                    {weekDaysList.map((day) => {
                      const active = availableDays.includes(day)
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            active
                              ? "bg-emerald-600 text-white border-emerald-650"
                              : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-400"
                          }`}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Available Timeslots */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Time Slots slots</label>
                  <div className="grid gap-2 grid-cols-3 sm:grid-cols-5">
                    {timeSlotsList.map((slot) => {
                      const active = availableSlots.includes(slot)
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => toggleSlot(slot)}
                          className={`py-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                            active
                              ? "bg-emerald-600 text-white border-emerald-650"
                              : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-400"
                          }`}
                        >
                          {slot}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-5 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-3 shadow-md shadow-emerald-600/10 cursor-pointer active:scale-[0.98] transition-transform select-none"
                  >
                    Save availability details
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
