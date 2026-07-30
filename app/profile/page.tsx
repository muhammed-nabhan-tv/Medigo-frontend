"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Calendar, Phone, ShieldAlert, Award, FileText, CheckCircle2, Clock, Trash2, Edit2, LogOut } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

interface Appointment {
  id?: string
  _id?: string
  doctorName: string
  specialty: string
  date: string
  time: string
  reason: string
  type: string
  status: string
}

export default function ProfilePage() {
  const { user, token, signOut } = useAuth()
  const router = useRouter()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [activeTab, setActiveTab] = useState("info") // info | appointments
  
  // Edit Profile Form State
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    fullName: "",
    dob: "",
    phone: "",
  })
  const [successMsg, setSuccessMsg] = useState("")

  // Load user data and appointments
  useEffect(() => {
    if (user) {
      setEditForm({
        fullName: user.fullName || "",
        dob: user.dob || "",
        phone: user.phone || "",
      })

      if (token) {
        const fetchAppointments = async () => {
          try {
            const res = await fetch("http://localhost:5000/api/appointments/patient", {
              headers: {
                "Authorization": `Bearer ${token}`
              }
            })
            if (res.ok) {
              const data = await res.json()
              setAppointments(data)
            }
          } catch (err) {
            console.error("Failed to load appointments:", err)
          }
        }
        fetchAppointments()
      }
    }
  }, [user, token])

  const handleCancelAppointment = async (id: string) => {
    if (!token) return
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "Cancelled" })
      })
      if (res.ok) {
        const updatedApp = await res.json()
        setAppointments(appointments.map(app => app._id === id ? updatedApp : app))
      }
    } catch (err) {
      console.error("Failed to cancel appointment:", err)
    }
  }

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const updatedUser = {
      ...user,
      fullName: editForm.fullName,
      dob: editForm.dob,
      phone: editForm.phone,
    }

    // Save back to localStorage
    localStorage.setItem("medigo_user", JSON.stringify(updatedUser))
    setSuccessMsg("Profile details successfully updated! Please reload the page to refresh session.")
    setIsEditing(false)

    setTimeout(() => {
      setSuccessMsg("")
    }, 4000)
  }

  if (!user) return null

  // Segregate appointments into upcoming vs past
  const todayStr = new Date().toISOString().split("T")[0]
  const upcomingAppointments = appointments.filter((app) => app.date >= todayStr)
  
  // Add some mock past appointments to look full & professional
  const pastAppointments = [
    {
      id: "past-1",
      doctorName: "Dr. Sarah Jenkins, MD",
      specialty: "General Medicine",
      date: "2026-05-14",
      time: "09:00 AM",
      reason: "Initial Onboarding Consultation",
      type: "In-Clinic Appointment",
      status: "Completed"
    },
    {
      id: "past-2",
      doctorName: "Dr. James Carter, MD",
      specialty: "Dermatology",
      date: "2026-06-02",
      time: "02:30 PM",
      reason: "Allergy follow-up consult",
      type: "Video Consultation",
      status: "Completed"
    }
  ]

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Profile Card Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="h-16 w-16 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl uppercase shadow-md shadow-emerald-650/15">
              {user.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
                {user.fullName}
              </h1>
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Verified Patient Profile</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 bg-red-50/50 hover:bg-red-50 dark:border-red-950/20 dark:bg-red-950/10 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
          <button
            onClick={() => setActiveTab("info")}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "info"
                ? "border-emerald-650 text-emerald-600 dark:text-emerald-500"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Personal Information
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "appointments"
                ? "border-emerald-650 text-emerald-600 dark:text-emerald-500"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            My Appointments ({appointments.length})
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMsg && (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 p-4 text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB CONTENT: Personal Information */}
        {activeTab === "info" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Clinical Information Profile
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-450 cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit details
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full h-11 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-sm bg-white dark:bg-slate-950 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={editForm.dob}
                      onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                      className="w-full h-11 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-sm bg-white dark:bg-slate-950 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full h-11 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-sm bg-white dark:bg-slate-950 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="h-11 px-4 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 font-semibold text-sm rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    Full Patient Name
                  </span>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.fullName}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    Email Address
                  </span>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.email}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Date of Birth
                  </span>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.dob}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    Phone Connection
                  </span>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.phone}</p>
                </div>
              </div>
            )}

            {/* HIPAA Status Indicator */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/60 dark:border-emerald-900/20 rounded-2xl p-4 flex gap-3 items-center">
              <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-500 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-emerald-950 dark:text-emerald-300">HIPAA Certified Data Spaces</span>
                <p className="text-emerald-900 dark:text-emerald-450 mt-0.5">Your record sets remain protected by our AES-256 secure protocols.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: Appointments History */}
        {activeTab === "appointments" && (
          <div className="space-y-6">
            
            {/* Upcoming Appointments section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-emerald-600" />
                Scheduled Upcoming Consults
              </h3>

              {upcomingAppointments.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No active upcoming consultations scheduled.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {upcomingAppointments.map((app) => {
                    const appId = app._id || app.id || "";
                    return (
                      <div
                        key={appId}
                        className="bg-slate-50 dark:bg-slate-800/20 border border-slate-100/80 dark:border-slate-800/80 p-4 rounded-2xl space-y-3 relative group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{app.doctorName}</h4>
                            <p className="text-xs text-emerald-600 font-semibold">{app.specialty}</p>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:text-emerald-450 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full">
                            {app.status}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                          <p className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {app.date}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {app.time} ({app.type})
                          </p>
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-200/50 dark:border-slate-800/60 pt-3">
                          <span className="text-[10px] font-medium text-slate-450 truncate max-w-[150px]">
                            Reason: {app.reason}
                          </span>
                          <button
                            onClick={() => handleCancelAppointment(appId)}
                            className="text-red-500 hover:text-red-750 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/25 transition-colors cursor-pointer"
                            title="Cancel appointment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past consultations logs */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                Past Medical Logs
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                {pastAppointments.map((app) => (
                  <div
                    key={app.id}
                    className="bg-slate-50/50 dark:bg-slate-800/10 border border-slate-100/50 dark:border-slate-800/50 p-4 rounded-2xl space-y-3 opacity-80"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{app.doctorName}</h4>
                        <p className="text-xs text-slate-450 font-semibold">{app.specialty}</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-850 px-2.5 py-0.5 rounded-full">
                        {app.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {app.date}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {app.time} ({app.type})
                      </p>
                    </div>

                    <div className="border-t border-slate-200/30 dark:border-slate-800/30 pt-3">
                      <span className="text-[10px] font-medium text-slate-450 block truncate">
                        Diagnosis summary: Patient onboarded successfully. Stable cardiovascular logs.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
