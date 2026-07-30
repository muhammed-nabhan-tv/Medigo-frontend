"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, Video, Home as HomeIcon, CheckCircle2, User, ChevronRight, ChevronLeft, Search, Star } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

interface Doctor {
  _id: string
  fullName: string
  category: string
  experience: number
  rating: number
  education: string
  availableDays?: string[]
  availableSlots?: string[]
}

const SPECIALTIES = ["General Medicine", "Pediatrics", "Cardiology", "Dermatology", "Neurology"]
const TIMESLOTS = ["09:00 AM", "10:00 AM", "11:30 AM", "01:30 PM", "02:00 PM", "03:30 PM", "04:30 PM"]

const getAvatarColor = (specialty: string) => {
  switch (specialty) {
    case "General Medicine": return "bg-emerald-600"
    case "Cardiology": return "bg-red-600"
    case "Pediatrics": return "bg-blue-600"
    case "Dermatology": return "bg-amber-600"
    case "Neurology": return "bg-purple-600"
    default: return "bg-slate-600"
  }
}

export default function BookingPage() {
  const { user, token } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [consultType, setConsultType] = useState("Video Consultation")
  const [reason, setReason] = useState("")
  const [symptoms, setSymptoms] = useState("")

  const [doctorsList, setDoctorsList] = useState<Doctor[]>([])
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch verified doctors list
  React.useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/doctors")
        if (res.ok) {
          const data = await res.json()
          setDoctorsList(data)
        } else {
          setErrorMsg("Could not fetch practitioner directory.")
        }
      } catch (err) {
        console.error("Fetch doctors failed:", err)
        setErrorMsg("Network error loading physician list.")
      } finally {
        setIsLoadingDoctors(false)
      }
    }
    fetchDoctors()
  }, [])

  // Filter doctors by specialty
  const filteredDoctors = selectedSpecialty
    ? doctorsList.filter((doc) => doc.category === selectedSpecialty)
    : doctorsList

  const handleNextStep = () => {
    setErrorMsg("")
    if (step === 1) {
      if (!selectedDoctor) {
        setErrorMsg("Please select a physician to continue.")
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!selectedDate || !selectedTime) {
        setErrorMsg("Please select a date and an available timeslot.")
        return
      }
      setStep(3)
    }
  }

  const handleBackStep = () => {
    setErrorMsg("")
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setErrorMsg("Please summarize the reason for your visit.")
      return
    }

    if (!user || !selectedDoctor || !token) return

    setIsSubmitting(true)
    setErrorMsg("")
    try {
      const response = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoctor._id,
          date: selectedDate,
          time: selectedTime,
          type: consultType,
          reason: reason,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Failed to confirm scheduled appointment")
      }

      setStep(4)
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong confirming your slot.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="mx-auto max-w-3xl space-y-8">
        
        {/* Header */}
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Schedule Clinical Consult
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Book an appointment with board-certified practitioners in few quick steps.
          </p>
        </div>

        {/* Stepper Progress Bar */}
        {step < 4 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-450 dark:text-slate-550 mb-3">
              <span>STEP {step} OF 3</span>
              <span>
                {step === 1 ? "Select Physician" : step === 2 ? "Pick Schedule Slot" : "Consultation Details"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 ease-in-out"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 p-4 text-sm font-semibold text-red-800 dark:text-red-300 animate-fade-in" role="alert">
            {errorMsg}
          </div>
        )}

        <div className="relative">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Select Specialty & Doctor */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {/* Specialty filters */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Filter by Specialty</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedSpecialty("")
                        setSelectedDoctor(null)
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        selectedSpecialty === ""
                          ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
                          : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-emerald-650"
                      }`}
                    >
                      All Specialties
                    </button>
                    {SPECIALTIES.map((spec) => (
                      <button
                        key={spec}
                        onClick={() => {
                          setSelectedSpecialty(spec)
                          setSelectedDoctor(null)
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          selectedSpecialty === spec
                            ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
                            : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-emerald-650"
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Doctors list */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Available Clinicians</label>
                  {filteredDoctors.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-8 rounded-3xl text-center text-slate-500">
                      No practitioners available in this specialty currently.
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {filteredDoctors.map((doc) => {
                        const avatarColor = getAvatarColor(doc.category);
                        const initials = doc.fullName.replace("Dr. ", "").trim()[0] || "D";
                        return (
                          <div
                            key={doc._id}
                            onClick={() => setSelectedDoctor(doc)}
                            className={`bg-white dark:bg-slate-900 border p-5 rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-200 ${
                              selectedDoctor?._id === doc._id
                                ? "border-emerald-600 ring-2 ring-emerald-600/10 dark:border-emerald-500 dark:ring-emerald-500/10"
                                : "border-slate-200/60 dark:border-slate-800 hover:border-emerald-500/60"
                            }`}
                          >
                            <div className="flex gap-4">
                              <div className={`h-12 w-12 shrink-0 rounded-full ${avatarColor} text-white flex items-center justify-center font-bold text-lg`}>
                                {initials}
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-bold text-slate-900 dark:text-white leading-snug">{doc.fullName}</h4>
                                <p className="text-xs text-emerald-600 font-semibold">{doc.category}</p>
                                <div className="flex items-center gap-1 text-slate-450">
                                  <Star className="h-3.5 w-3.5 fill-amber-450 text-amber-450" />
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{doc.rating}</span>
                                  <span className="text-[10px] text-slate-400">({doc.experience} yrs exp)</span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                              <span>Education:</span>
                              <span className="font-semibold text-slate-650 dark:text-slate-300 truncate max-w-[150px]">{doc.education}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleNextStep}
                    className="flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-3 transition-all cursor-pointer dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    Select Schedule Slot
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Pick Date & Time */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full ${getAvatarColor(selectedDoctor?.category || "")} text-white flex items-center justify-center font-bold`}>
                    {selectedDoctor?.fullName.replace("Dr. ", "").trim()[0] || "D"}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedDoctor?.fullName}</h4>
                    <p className="text-xs text-emerald-600 font-semibold">{selectedDoctor?.category}</p>
                  </div>
                </div>

                {/* Date Picker Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Choose Consultation Date</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full h-11 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                {/* Time selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Select Available Timeslot</label>
                  <div className="grid gap-2 grid-cols-3 sm:grid-cols-4">
                    {(selectedDoctor?.availableSlots && selectedDoctor.availableSlots.length > 0 ? selectedDoctor.availableSlots : TIMESLOTS).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTime(t)}
                        className={`py-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                          selectedTime === t
                            ? "bg-emerald-600 text-white border-emerald-650 ring-2 ring-emerald-600/10"
                            : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-emerald-500/60"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between pt-4">
                  <button
                    onClick={handleBackStep}
                    className="flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm px-5 py-3 transition-all cursor-pointer dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-3 transition-all cursor-pointer dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    Provide Details
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Consult Details */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl flex flex-wrap justify-between items-center gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full ${getAvatarColor(selectedDoctor?.category || "")} text-white flex items-center justify-center font-bold text-sm`}>
                      {selectedDoctor?.fullName?.replace("Dr. ", "").trim()[0] || "D"}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{selectedDoctor?.fullName}</h4>
                      <p className="text-[10px] text-emerald-600 font-semibold">{selectedDoctor?.category}</p>
                    </div>
                  </div>
                  <div className="text-right text-slate-500 dark:text-slate-400 font-medium">
                    <p>{selectedDate}</p>
                    <p className="font-bold text-slate-700 dark:text-slate-350">{selectedTime}</p>
                  </div>
                </div>

                <form onSubmit={handleConfirmBooking} className="space-y-5">
                  {/* Consult Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Consultation Type</label>
                    <div className="grid gap-3 grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setConsultType("Video Consultation")}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                          consultType === "Video Consultation"
                            ? "bg-emerald-50 border-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-500"
                            : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-emerald-500"
                        }`}
                      >
                        <Video className="h-5 w-5 text-emerald-600" />
                        <span className="text-xs font-bold">Video Consult</span>
                        <span className="text-[10px] text-slate-400">Join virtual room link</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setConsultType("In-Clinic Appointment")}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                          consultType === "In-Clinic Appointment"
                            ? "bg-emerald-50 border-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-500"
                            : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-emerald-500"
                        }`}
                      >
                        <HomeIcon className="h-5 w-5 text-emerald-600" />
                        <span className="text-xs font-bold">In-Clinic Visit</span>
                        <span className="text-[10px] text-slate-400">Visit physical building</span>
                      </button>
                    </div>
                  </div>

                  {/* Reason Summary */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Chief Complaint (Reason for Visit)</label>
                    <input
                      type="text"
                      placeholder="e.g. Annual physical, persistent sore throat, prescription renewal"
                      required
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full h-11 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Symptoms details */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Detailed Symptoms Description (Optional)</label>
                    <textarea
                      rows={3}
                      placeholder="Briefly describe when the symptoms started, severity, or any medications currently being taken..."
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Footer Controls */}
                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={handleBackStep}
                      className="flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm px-5 py-3 transition-all cursor-pointer dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-3 transition-all shadow-md shadow-emerald-650/10 cursor-pointer"
                    >
                      Confirm Scheduled Visit
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 4: Success confirmation screen */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-xl animate-fade-in"
              >
                <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto dark:bg-emerald-950/20 dark:text-emerald-400">
                  <CheckCircle2 className="h-10 w-10" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Appointment Confirmed!</h2>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                    Your appointment has been successfully recorded in our care system schedules.
                  </p>
                </div>

                {/* Recap Details Card */}
                <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl max-w-md mx-auto text-left space-y-3">
                  <div className="flex justify-between items-center text-xs border-b border-slate-200/50 dark:border-slate-800/50 pb-2 mb-2">
                    <span className="text-slate-400">Practitioner</span>
                    <span className="font-bold text-slate-800 dark:text-slate-250">{selectedDoctor?.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-slate-200/50 dark:border-slate-800/50 pb-2 mb-2">
                    <span className="text-slate-400">Date & Time</span>
                    <span className="font-bold text-slate-800 dark:text-slate-250">{selectedDate} at {selectedTime}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-slate-200/50 dark:border-slate-800/50 pb-2 mb-2">
                    <span className="text-slate-400">Type</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{consultType}</span>
                  </div>
                  <div className="flex justify-between items-start text-xs">
                    <span className="text-slate-400 shrink-0">Reason</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-350 truncate max-w-[200px]">{reason}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-450 dark:text-slate-500 max-w-md mx-auto leading-relaxed">
                  {consultType === "Video Consultation" ? (
                    <span>A clinical video room URL link will be sent to your email 15 minutes before your schedule time. Please make sure to check your spam/inbox.</span>
                  ) : (
                    <span>Please arrive at the clinic building (Suite 402, Medigo Medical Center) 10 minutes before your scheduled appointment time to complete vitals logs.</span>
                  )}
                </div>

                <div className="flex justify-center gap-3 pt-4">
                  <button
                    onClick={() => router.push("/")}
                    className="flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-3 transition-all cursor-pointer dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => router.push("/profile")}
                    className="flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-750 font-semibold text-sm px-5 py-3 transition-all cursor-pointer dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Check History
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}
