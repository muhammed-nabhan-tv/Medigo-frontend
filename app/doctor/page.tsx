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

  // Prescription Modal States
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [prescriptionForm, setPrescriptionForm] = useState({
    doctorDegree: "MBBS, MD (General Medicine)",
    clinicName: "Medigo Care Clinic",
    clinicAddress: "123 Health Avenue, Suite 400",
    clinicPhone: "+1 (555) 019-2834",
    patientAge: "30",
    patientSex: "M",
    advice: "• Drink plenty of warm water.\n• Adequate rest for 3 days.\n• Follow up if symptoms persist.",
  })
  const [medicines, setMedicines] = useState<Array<{ name: string; frequency: string; duration: string; instruction: string }>>([
    { name: "", frequency: "", duration: "", instruction: "" },
  ])
  const [isPrescriptionSubmitting, setIsPrescriptionSubmitting] = useState(false)

  // Doctor availability editing states (mock settings)
  const [availableDays, setAvailableDays] = useState<string[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])

  const weekDaysList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const timeSlotsList = ["09:00 AM", "10:00 AM", "11:00 AM", "11:30 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "04:30 PM"]

  // Load doctor profile and appointments
  useEffect(() => {
    if (!user || user.role !== "doctor") {
      router.push("/Login")
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

  const handleAddMedicineRow = () => {
    setMedicines([...medicines, { name: "", frequency: "", duration: "", instruction: "" }])
  }

  const handleRemoveMedicineRow = (index: number) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, idx) => idx !== index))
    } else {
      setMedicines([{ name: "", frequency: "", duration: "", instruction: "" }])
    }
  }

  const handleMedicineChange = (index: number, field: string, value: string) => {
    setMedicines(medicines.map((med, idx) => idx === index ? { ...med, [field]: value } : med))
  }

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedApp || !token) return

    const cleanMeds = medicines.filter(m => m.name.trim() !== "")
    if (cleanMeds.length === 0) {
      setErrorMsg("Please add at least one medicine.")
      return
    }

    setIsPrescriptionSubmitting(true)
    setErrorMsg("")
    setSuccessMsg("")

    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${selectedApp._id}/prescription`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorName: user?.fullName  || "",
          doctorDegree: prescriptionForm.doctorDegree,
          clinicName: prescriptionForm.clinicName,
          clinicAddress: prescriptionForm.clinicAddress,
          clinicPhone: prescriptionForm.clinicPhone,
          patientAge: prescriptionForm.patientAge,
          patientSex: prescriptionForm.patientSex,
          medicines: cleanMeds,
          advice: prescriptionForm.advice,
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit prescription")
      }

      setAppointments(appointments.map(app => app._id === selectedApp._id ? data : app))
      setSuccessMsg("Prescription submitted successfully and appointment marked completed!")
      setShowPrescriptionModal(false)
      setSelectedApp(null)
      setMedicines([{ name: "", frequency: "", duration: "", instruction: "" }])
      setTimeout(() => setSuccessMsg(""), 4000)
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong saving the prescription.")
      setTimeout(() => setErrorMsg(""), 4000)
    } finally {
      setIsPrescriptionSubmitting(false)
    }
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
                                    onClick={() => {
                                      setSelectedApp(app)
                                      setShowPrescriptionModal(true)
                                    }}
                                    className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 cursor-pointer transition-colors flex items-center gap-1 text-[10px] font-bold"
                                    title="Write Prescription & Complete"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Prescribe
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
                              {app.status === "Completed" && (
                                <button
                                  onClick={() => router.push(`/prescription/${app._id}`)}
                                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                                >
                                  View Rx
                                </button>
                              )}
                              {app.status === "Cancelled" && (
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

        {/* Prescription Modal */}
        {showPrescriptionModal && selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Create Digital Prescription</h3>
                  <p className="text-xs text-slate-500">For Patient: <span className="font-bold text-slate-700 dark:text-slate-350">{selectedApp.patientName}</span></p>
                </div>
                <button 
                  onClick={() => {
                    setShowPrescriptionModal(false)
                    setSelectedApp(null)
                  }}
                  className="text-slate-400 hover:text-slate-650 cursor-pointer"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSavePrescription} className="space-y-6">
                
                {/* Doctor Degree & Clinic Details */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Qualifications / Degree</label>
                    <input 
                      type="text" 
                      required
                      value={prescriptionForm.doctorDegree}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, doctorDegree: e.target.value })}
                      className="w-full h-10 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-xs bg-white dark:bg-slate-950 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinic Name</label>
                    <input 
                      type="text" 
                      required
                      value={prescriptionForm.clinicName}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, clinicName: e.target.value })}
                      className="w-full h-10 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-xs bg-white dark:bg-slate-950 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinic Address</label>
                    <input 
                      type="text" 
                      required
                      value={prescriptionForm.clinicAddress}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, clinicAddress: e.target.value })}
                      className="w-full h-10 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-xs bg-white dark:bg-slate-950 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinic Phone</label>
                    <input 
                      type="text" 
                      required
                      value={prescriptionForm.clinicPhone}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, clinicPhone: e.target.value })}
                      className="w-full h-10 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-xs bg-white dark:bg-slate-950 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Patient Demographics */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Age</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 32 Y"
                      value={prescriptionForm.patientAge}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, patientAge: e.target.value })}
                      className="w-full h-10 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-xs bg-white dark:bg-slate-950 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Sex</label>
                    <select 
                      value={prescriptionForm.patientSex}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, patientSex: e.target.value })}
                      className="w-full h-10 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-xs bg-white dark:bg-slate-950 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="M">Male (M)</option>
                      <option value="F">Female (F)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Medicines Table */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Prescribed Medicines</label>
                    <button 
                      type="button"
                      onClick={handleAddMedicineRow}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                    >
                      + Add Medicine
                    </button>
                  </div>

                  <div className="space-y-3">
                    {medicines.map((med, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-slate-50/50 dark:bg-slate-950/15 p-3 rounded-2xl border border-slate-100 dark:border-slate-850">
                        <span className="text-xs text-slate-400 font-bold shrink-0">#{idx + 1}</span>
                        <div className="grid gap-2 grid-cols-1 sm:grid-cols-4 flex-1">
                          <input 
                            type="text" 
                            required
                            placeholder="Medicine Name"
                            value={med.name}
                            onChange={(e) => handleMedicineChange(idx, "name", e.target.value)}
                            className="h-9 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 text-xs bg-white dark:bg-slate-950 focus:outline-none"
                          />
                          <input 
                            type="text" 
                            placeholder="Frequency"
                            value={med.frequency}
                            onChange={(e) => handleMedicineChange(idx, "frequency", e.target.value)}
                            className="h-9 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 text-xs bg-white dark:bg-slate-950 focus:outline-none"
                          />
                          <input 
                            type="text" 
                            placeholder="Duration"
                            value={med.duration}
                            onChange={(e) => handleMedicineChange(idx, "duration", e.target.value)}
                            className="h-9 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 text-xs bg-white dark:bg-slate-950 focus:outline-none"
                          />
                          <input 
                            type="text" 
                            placeholder="Instructions"
                            value={med.instruction}
                            onChange={(e) => handleMedicineChange(idx, "instruction", e.target.value)}
                            className="h-9 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 text-xs bg-white dark:bg-slate-950 focus:outline-none"
                          />
                        </div>
                        {medicines.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => handleRemoveMedicineRow(idx)}
                            className="text-red-500 hover:text-red-755 p-1.5 cursor-pointer shrink-0"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advice / Instructions */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Clinical Advice / Instructions</label>
                  <textarea 
                    rows={3}
                    placeholder="General recommendations for the patient..."
                    value={prescriptionForm.advice}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, advice: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs bg-white dark:bg-slate-950 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Submit button */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowPrescriptionModal(false)
                      setSelectedApp(null)
                    }}
                    className="h-11 px-4 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-450 font-semibold text-sm rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isPrescriptionSubmitting}
                    className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    {isPrescriptionSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Issue Prescription"
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  )
}
