"use client"

import React, { useState } from "react"
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle, AlertCircle } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) return

    setIsSubmitting(true)

    // Mock send request
    setTimeout(() => {
      setIsSubmitting(false)
      setSuccessMsg("Thank you! Your message has been routed to our care staff. We will reply within 2 hours.")
      setFormData({ name: "", email: "", subject: "", message: "" })
    }, 1200)
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="mx-auto max-w-6xl space-y-12">
        
        {/* Header Title */}
        <div className="space-y-3 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Contact Our Support & Clinical Teams
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Have questions about clinical standards, HIPAA compliance, or scheduling? Reach out to us.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Column 1: Contact Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                Send a Message
              </h2>
              <p className="text-xs text-slate-400">Our patient relations team is online to assist you.</p>
            </div>

            {successMsg && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 p-4 text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-3 animate-fade-in">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-11 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-sm bg-white dark:bg-slate-950 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-11 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-sm bg-white dark:bg-slate-950 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Billing query, technical issues, clinical request"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full h-11 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-sm bg-white dark:bg-slate-950 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Message Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type your message details here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm bg-white dark:bg-slate-950 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                {isSubmitting ? (
                  "Sending message..."
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Support Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Column 2: Details & SVG Map */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Info Cards */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex gap-4 items-start">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Medical Center Address</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Suite 402, Medigo Health Building, 784 Care Parkway, Boston, MA 02111.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Priority Contact Lines</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Nurse Triage: (555) 123-4567 • Customer Service: (555) 123-8900
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Working Hours</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Mon - Fri: 8:00 AM - 6:00 PM • Telehealth: Online 24/7
                  </p>
                </div>
              </div>
            </div>

            {/* Styled SVG Clinic Location Map */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl overflow-hidden relative group">
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-xs border border-slate-800 rounded-lg px-2.5 py-1 z-10">
                <p className="text-[10px] font-bold text-emerald-400">MEDIGO CLINIC LOCATOR</p>
              </div>

              {/* Responsive custom SVG map representation */}
              <svg viewBox="0 0 400 240" className="w-full h-auto bg-slate-950 rounded-2xl border border-slate-800/80">
                {/* Grid Lines */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Styled Map Rivers / Pathways */}
                <path d="M 0 100 Q 120 120 200 90 T 400 130" fill="none" stroke="rgba(16,185,129,0.1)" strokeWidth="12" />
                <path d="M 80 0 L 160 240" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <path d="M 0 180 Q 200 150 400 190" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />

                {/* Metro line */}
                <path d="M 320 0 L 100 240" fill="none" stroke="rgba(16,185,129,0.2)" strokeWidth="2" strokeDasharray="5,5" />

                {/* Suburbs representation blocks */}
                <rect x="30" y="40" width="60" height="40" rx="4" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.05)" />
                <text x="60" y="63" fill="rgba(255,255,255,0.2)" fontSize="9" textAnchor="middle" fontWeight="bold">East Plaza</text>

                <rect x="260" y="160" width="80" height="50" rx="4" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.05)" />
                <text x="300" y="188" fill="rgba(255,255,255,0.2)" fontSize="9" textAnchor="middle" fontWeight="bold">Care Parkway</text>

                {/* Location Marker Radar Pulse */}
                <circle cx="160" cy="115" r="16" fill="rgba(16,185,129,0.15)" className="animate-pulse" />
                <circle cx="160" cy="115" r="28" fill="none" stroke="rgba(16,185,129,0.15)" strokeWidth="1" className="animate-pulse" />

                {/* Clinic Location Marker Pin */}
                <g transform="translate(160, 115)">
                  <path d="M 0 -12 C -6 -12 -8 -6 0 0 C 8 -6 6 -12 0 -12" fill="#10b981" />
                  <circle cx="0" cy="-8" r="2.5" fill="#ffffff" />
                </g>

                <text x="160" y="132" fill="#10b981" fontSize="9" textAnchor="middle" fontWeight="bold">Medigo Building</text>
              </svg>

              <div className="pt-2 text-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Easily accessible via Metro Line 2 or I-93 Transit Parkway
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
