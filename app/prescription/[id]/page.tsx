"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Loader2, ArrowLeft, Printer } from "lucide-react"

interface Medicine {
  name: string
  frequency: string
  duration: string
  instruction: string
}

interface Prescription {
  doctorName: string
  doctorDegree: string
  clinicName: string
  clinicAddress: string
  clinicPhone: string
  patientAge: string
  patientSex: string
  rxId: string
  date: string
  medicines: Medicine[]
  advice: string
}

interface Appointment {
  _id: string
  patientName: string
  date: string
  time: string
  reason: string
  prescription?: Prescription
}

export default function PrescriptionPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const router = useRouter()
  
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (!token) return

    const fetchAppointment = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`http://localhost:5000/api/appointments/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        if (res.ok) {
          const data = await res.json()
          setAppointment(data)
        } else {
          const errData = await res.json()
          setErrorMsg(errData.message || "Failed to load prescription details.")
        }
      } catch (err) {
        console.error("Prescription fetch failed:", err)
        setErrorMsg("Failed to connect to server.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointment()
  }, [id, token])

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-500 gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold">Generating prescription report...</p>
      </div>
    )
  }

  if (errorMsg || !appointment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl text-center max-w-md space-y-4">
          <p className="text-sm font-bold text-red-650">{errorMsg || "Prescription record not found."}</p>
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-650 hover:underline cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
        </div>
      </div>
    )
  }

  const rx = appointment.prescription

  if (!rx) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl text-center max-w-md space-y-4">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-350">Prescription details haven't been added to this appointment yet.</p>
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-650 hover:underline cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-start gap-6 font-sans">
      
      {/* Header controls (hidden on print) */}
      <div className="w-full max-w-[800px] flex items-center justify-between gap-4 print:hidden">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Portal
        </button>
        <button 
          onClick={handlePrint}
          className="inline-flex items-center gap-2 text-xs font-bold text-white cursor-pointer bg-emerald-650 hover:bg-emerald-700 px-4 py-2 rounded-xl shadow-md"
        >
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </button>
      </div>

      {/* Prescription Card */}
      <div className="w-full max-w-[800px] bg-white text-slate-800 border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col justify-between min-h-[950px] print:border-none print:shadow-none print:p-0 print:my-0 print:bg-white print:text-black">
        
        {/* Header section */}
        <div>
          <header className="flex justify-between items-start border-b-2 border-sky-600 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-sky-600 text-white rounded-lg flex items-center justify-center font-bold text-2xl">
                +
              </div>
              <div className="text-2xl font-black text-sky-750 tracking-tight">Medigo</div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-slate-900 leading-snug">{rx.doctorName}</div>
              <div className="text-xs text-sky-600 font-semibold mb-1">{rx.doctorDegree || "MBBS, MD"}</div>
              <div className="text-xs text-slate-500 leading-relaxed">
                {rx.clinicName || "Medigo Care Clinic"}<br/>
                {rx.clinicAddress || "123 Health Avenue, Suite 400"}<br/>
                Phone: {rx.clinicPhone || "+1 (555) 019-2834"}
              </div>
            </div>
          </header>

          {/* Patient Details Section */}
          <section className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 my-6 grid grid-cols-2 sm:grid-cols-4 gap-4 print:bg-slate-50/20">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Patient Name</span>
              <span className="text-sm font-semibold text-slate-900 border-b border-dashed border-slate-300 pb-0.5 min-h-[22px]">
                {appointment.patientName}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Age / Sex</span>
              <span className="text-sm font-semibold text-slate-900 border-b border-dashed border-slate-300 pb-0.5 min-h-[22px]">
                {rx.patientAge || "N/A"} / {rx.patientSex || "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Date</span>
              <span className="text-sm font-semibold text-slate-900 border-b border-dashed border-slate-300 pb-0.5 min-h-[22px]">
                {rx.date}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Rx ID</span>
              <span className="text-sm font-semibold text-slate-900 border-b border-dashed border-slate-300 pb-0.5 min-h-[22px]">
                {rx.rxId}
              </span>
            </div>
          </section>

          {/* Rx Icon & Meds List */}
          <main className="flex-1 flex flex-col">
            <div className="text-3xl font-bold font-serif italic text-sky-600 mb-4 select-none">Rx</div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-[10px] text-slate-405 font-bold uppercase tracking-wider">
                  <th className="py-2 px-3 w-[5%]">#</th>
                  <th className="py-2 px-3 w-[45%]">Medicine & Dosage</th>
                  <th className="py-2 px-3 w-[25%]">Frequency</th>
                  <th className="py-2 px-3 w-[25%]">Duration</th>
                </tr>
              </thead>
              <tbody>
                {rx.medicines.map((med, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                    <td className="py-3 px-3 text-xs text-slate-400 font-bold">{index + 1}</td>
                    <td className="py-3 px-3 text-sm">
                      <strong className="text-slate-800 font-bold">{med.name}</strong>
                      {med.instruction && (
                        <div className="text-xs text-slate-500 mt-0.5">{med.instruction}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600 font-semibold">{med.frequency || "As directed"}</td>
                    <td className="py-3 px-3 text-xs text-slate-650 font-semibold">{med.duration || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Advice / Instructions */}
            {rx.advice && (
              <div className="mt-8">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Advice / Instructions</div>
                <div className="border border-dashed border-slate-200 rounded-xl p-4 text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50">
                  {rx.advice}
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Footer info */}
        <footer className="mt-12 border-t border-slate-200 pt-6 flex justify-between items-end">
          <div className="text-[10px] text-slate-400 space-y-0.5">
            <p><strong>Medigo Digital Health System</strong></p>
            <p>Valid without physical stamp if digitally verified.</p>
          </div>

          <div className="text-center w-48">
            <div className="border-b border-slate-900 mb-2 h-10"></div>
            <div className="text-xs font-bold text-slate-900">Doctor's Signature</div>
          </div>
        </footer>

      </div>
    </div>
  )
}
