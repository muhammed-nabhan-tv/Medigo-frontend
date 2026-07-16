"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Activity,
  Calendar,
  Shield,
  Users,
  ArrowRight,
  TrendingUp,
  FileText,
  MessageSquare,
  Clock,
  Heart,
  Droplet,
  Scale,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"

interface Appointment {
  id: string
  doctorName: string
  specialty: string
  date: string
  time: string
  reason: string
  type: string
  status: string
}

export default function Home() {
  const { user, isAuthenticated, signOut } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [showLogModal, setShowLogModal] = useState(false)
  const [healthMetrics, setHealthMetrics] = useState({
    bloodPressure: "120/80",
    heartRate: "72",
    bmi: "22.4"
  })
  const [newMetric, setNewMetric] = useState({
    systolic: "",
    diastolic: "",
    heartRate: "",
    weight: ""
  })
  const [metricSuccess, setMetricSuccess] = useState("")

  // Load appointments from localStorage
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`medigo_appointments_${user.id}`)
      if (stored) {
        try {
          setAppointments(JSON.parse(stored))
        } catch (e) {
          console.error("Error loading appointments:", e)
        }
      } else {
        // Mock default appointment if none exists
        const mockAppointments: Appointment[] = [
          {
            id: "mock-1",
            doctorName: "Dr. Sarah Jenkins",
            specialty: "General Medicine",
            date: "2026-08-10",
            time: "10:00 AM",
            reason: "Annual physical checkup",
            type: "Video Consultation",
            status: "Confirmed"
          }
        ]
        localStorage.setItem(`medigo_appointments_${user.id}`, JSON.stringify(mockAppointments))
        setAppointments(mockAppointments)
      }
    }
  }, [user])

  const handleCancelAppointment = (id: string) => {
    if (!user) return
    const updated = appointments.filter((app) => app.id !== id)
    setAppointments(updated)
    localStorage.setItem(`medigo_appointments_${user.id}`, JSON.stringify(updated))
  }

  const handleLogMetrics = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMetric.systolic || !newMetric.diastolic || !newMetric.heartRate) return

    setHealthMetrics({
      bloodPressure: `${newMetric.systolic}/${newMetric.diastolic}`,
      heartRate: newMetric.heartRate,
      bmi: newMetric.weight ? (parseFloat(newMetric.weight) / 3.2).toFixed(1) : healthMetrics.bmi
    })

    setNewMetric({ systolic: "", diastolic: "", heartRate: "", weight: "" })
    setMetricSuccess("Metrics successfully recorded!")
    setTimeout(() => {
      setMetricSuccess("")
      setShowLogModal(false)
    }, 1500)
  }

  // Greeting based on time of day
  const getGreeting = () => {
    const hr = new Date().getHours()
    if (hr < 12) return "Good morning"
    if (hr < 17) return "Good afternoon"
    return "Good evening"
  }

  // LOGGED OUT LANDING PAGE
  if (!user) {
    return (
      <div className="flex flex-col flex-1 bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-24 mesh-gradient text-white">
          <div className="absolute top-[-30%] left-[-20%] w-[90%] h-[90%] rounded-full ambient-dot-1 animate-pulse-slow pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full ambient-dot-2 animate-pulse-slow pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7 space-y-6 text-left animate-fade-in-up">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <Activity className="h-3 w-3" />
                  <span>★ 4.9/5 Clinical Satisfaction Rating</span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
                  Your Healthcare, <br />
                  <span className="text-emerald-400">Simplified and Unified.</span>
                </h1>
                <p className="max-w-xl text-lg text-slate-300 leading-relaxed">
                  Connect instantly with board-certified physicians, request prescription renewals, and access fully encrypted medical records. Professional care whenever you need it.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <Link
                    href="/signup"
                    className="flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-[0.98]"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href="/about"
                    className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/50 backdrop-blur-xs px-6 py-3.5 text-sm font-semibold hover:bg-slate-800 transition-all active:scale-[0.98]"
                  >
                    How it Works
                  </Link>
                </div>
              </div>

              {/* Dynamic Hero Graphic Card */}
              <div className="lg:col-span-5 animate-fade-in-up [animation-delay:200ms] fill-mode-forwards opacity-0">
                <div className="bg-slate-950/40 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-sm trust-card-glow hover:translate-y-[-4px] transition-transform duration-300">
                  <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Live Platform Activity</span>
                    </div>
                    <span className="text-xs text-slate-400">Updated just now</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4 items-center bg-slate-900/40 border border-slate-800/50 p-3 rounded-xl">
                      <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-100">45k+ Patients Care Onboarded</h4>
                        <p className="text-xs text-slate-400">Registered globally under HIPAA guidelines.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-center bg-slate-900/40 border border-slate-800/50 p-3 rounded-xl">
                      <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-100">Average On-call Wait &lt; 15m</h4>
                        <p className="text-xs text-slate-400">Video consultation connect speed.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-center bg-slate-900/40 border border-slate-800/50 p-3 rounded-xl">
                      <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-100">AES-256 Record Safety</h4>
                        <p className="text-xs text-slate-400">Military grade encrypted patient logs.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Services Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">Comprehensive Clinical Services</h2>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl tracking-tight">
                Designed to make healthcare seamless.
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Get full access to board-certified professionals and secure cloud charts without leaving your home.
              </p>
            </div>

            <div className="grid gap-8 mt-12 sm:grid-cols-2 lg:grid-cols-3">
              {/* Card 1 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 mb-6">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">24/7 Urgent Care Telehealth</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Skip the waiting room. Consult with clinical physicians online via our end-to-end encrypted audio-video platform.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 mb-6">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Clinical Diagnostics Vault</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Access lab tests, medication records, and physician recommendations securely in one unified HIPAA-compliant dashboard.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 mb-6">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Specialist Referrals</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Book direct, prompt consultations with verified practitioners in Pediatrics, Cardiology, Psychiatry, and Dermatology.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted Clinical Panel */}
        <section className="py-16 bg-slate-100 dark:bg-slate-900/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-5 space-y-4">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Guided by medical ethics & clinical excellence.
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Every doctor listed on the Medigo platform undergoes a rigorous vetting process. Our clinical review board monitors service delivery guidelines to maintain the highest levels of safety and quality of care.
                </p>
                <div className="flex gap-8 pt-4">
                  <div>
                    <h4 className="text-3xl font-bold text-slate-900 dark:text-white">250+</h4>
                    <p className="text-xs text-slate-400">Board-Certified Clinicians</p>
                  </div>
                  <div>
                    <h4 className="text-3xl font-bold text-slate-900 dark:text-white">99.8%</h4>
                    <p className="text-xs text-slate-400">Accuracy & Care Compliance</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 grid gap-6 sm:grid-cols-2">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 flex gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold text-lg">
                    SJ
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Dr. Sarah Jenkins, MD</h4>
                    <p className="text-xs text-emerald-600 font-semibold mb-2">Chief of General Practice</p>
                    <p className="text-xs text-slate-400">14+ years experience in Family & Preventive Medicine.</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 flex gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold text-lg">
                    MC
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Dr. Michael Chang, MD</h4>
                    <p className="text-xs text-emerald-600 font-semibold mb-2">Pediatric Medicine Director</p>
                    <p className="text-xs text-slate-400">Harvard Medical Alumnus. Specialty in child development care.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Sign-up Block */}
        <section className="py-20 bg-emerald-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.3),transparent_70%)]" />
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl leading-tight">
              Ready to unify your patient medical space?
            </h2>
            <p className="max-w-xl mx-auto text-emerald-100 text-sm leading-relaxed">
              Join thousands of patients who enjoy clinical grade convenience. Sign up for a free, HIPAA-compliant patient profile in less than 5 minutes.
            </p>
            <div className="pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-emerald-950 hover:bg-emerald-50 active:scale-[0.98] transition-all"
              >
                Create Free Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // LOGGED IN DASHBOARD
  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">PATIENT PORTAL DASHBOARD</span>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                {getGreeting()}, {user.fullName}!
              </h1>
              <p className="text-slate-400 text-sm">
                Access consultations, test logs, and check appointment bookings.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/booking"
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 transition-all active:scale-[0.98]"
              >
                <Calendar className="h-4.5 w-4.5" />
                Schedule Appointment
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Left Column: Quick Actions, Metrics, Clinical Alerts */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Quick Actions Panel */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-6 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Patient Actions</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <Link
                  href="/booking"
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 hover:bg-emerald-50 hover:dark:bg-emerald-950/20 border border-slate-100 dark:border-slate-800 text-center transition-all group"
                >
                  <Calendar className="h-6 w-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-slate-850 dark:text-slate-200 mt-2.5">Book Appointment</span>
                  <span className="text-xs text-slate-450 dark:text-slate-400 mt-1">Virtual or clinic visit</span>
                </Link>

                <Link
                  href="/profile"
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 hover:bg-emerald-50 hover:dark:bg-emerald-950/20 border border-slate-100 dark:border-slate-800 text-center transition-all group"
                >
                  <FileText className="h-6 w-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-slate-850 dark:text-slate-200 mt-2.5">Patient Profile</span>
                  <span className="text-xs text-slate-450 dark:text-slate-400 mt-1">Check medical histories</span>
                </Link>

                <Link
                  href="/contact"
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 hover:bg-emerald-50 hover:dark:bg-emerald-950/20 border border-slate-100 dark:border-slate-800 text-center transition-all group"
                >
                  <MessageSquare className="h-6 w-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-slate-850 dark:text-slate-200 mt-2.5">Message Staff</span>
                  <span className="text-xs text-slate-450 dark:text-slate-400 mt-1">Ask clinic directions</span>
                </Link>
              </div>
            </div>

            {/* Health Logs / Metrics */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-6 shadow-xs">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Patient Health Metrics</h2>
                  <p className="text-xs text-slate-400">Track key vitals recorded during clinician visits.</p>
                </div>
                <button
                  onClick={() => setShowLogModal(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-650/20 bg-emerald-50/40 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Log Vitals
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/80 flex items-center gap-4">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400">
                    <Heart className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Heart Rate</p>
                    <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {healthMetrics.heartRate} <span className="text-xs font-semibold text-slate-405">bpm</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/80 flex items-center gap-4">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-400">
                    <Droplet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Blood Pressure</p>
                    <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {healthMetrics.bloodPressure} <span className="text-xs font-semibold text-slate-405">mmHg</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/80 flex items-center gap-4">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-650 dark:bg-blue-950/20 dark:text-blue-400">
                    <Scale className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">BMI Value</p>
                    <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {healthMetrics.bmi} <span className="text-xs font-semibold text-slate-405">Normal</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Guideline Tips */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/60 dark:border-emerald-900/20 rounded-3xl p-6 flex gap-4 items-start">
              <AlertCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-emerald-950 dark:text-emerald-300 text-sm">Clinical Guideline Reminder</h4>
                <p className="text-emerald-900 dark:text-emerald-450 text-xs leading-relaxed">
                  Drinking at least 2.5L of water daily and aiming for 7-8 hours of sleep are the baseline steps to cardiovascular efficiency. Remember to log your vitals regularly.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Upcoming Appointments */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-6 shadow-xs flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Consults</h2>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/25 px-2 py-0.5 rounded-full">
                    {appointments.length} Active
                  </span>
                </div>

                {appointments.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <Calendar className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No scheduled visits</p>
                      <p className="text-xs text-slate-400 max-w-[200px] mx-auto">Need clinical advice? Arrange a digital or clinic consult now.</p>
                    </div>
                    <Link
                      href="/booking"
                      className="inline-flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 transition-all dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                    >
                      Book Visit
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                    {appointments.map((app) => (
                      <div
                        key={app.id}
                        className="bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/80 p-4 rounded-2xl space-y-3 relative group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{app.doctorName}</h4>
                            <p className="text-xs text-emerald-600 font-semibold">{app.specialty}</p>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:text-emerald-450 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
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
                            onClick={() => handleCancelAppointment(app.id)}
                            className="text-red-500 hover:text-red-750 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/25 cursor-pointer"
                            title="Cancel appointment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/30 p-3 flex justify-between items-center text-xs text-slate-500 dark:text-slate-450">
                  <span>Registered Name:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                    {user.fullName}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Log Vitals Modal Popup */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl animate-fade-in-up [animation-duration:200ms]">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Vitals Log</h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {metricSuccess && (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 text-sm font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2 animate-fade-in">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                {metricSuccess}
              </div>
            )}

            <form onSubmit={handleLogMetrics} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 120"
                    required
                    value={newMetric.systolic}
                    onChange={(e) => setNewMetric({ ...newMetric, systolic: e.target.value })}
                    className="w-full h-11 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-sm bg-white dark:bg-slate-950"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 80"
                    required
                    value={newMetric.diastolic}
                    onChange={(e) => setNewMetric({ ...newMetric, diastolic: e.target.value })}
                    className="w-full h-11 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-sm bg-white dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 72"
                    required
                    value={newMetric.heartRate}
                    onChange={(e) => setNewMetric({ ...newMetric, heartRate: e.target.value })}
                    className="w-full h-11 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-sm bg-white dark:bg-slate-950"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Body Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 70"
                    value={newMetric.weight}
                    onChange={(e) => setNewMetric({ ...newMetric, weight: e.target.value })}
                    className="w-full h-11 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-sm bg-white dark:bg-slate-950"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
              >
                Log Vitals Details
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

// Simple absolute close SVG
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  )
}
