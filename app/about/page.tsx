"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShieldCheck, HeartPulse, Award, Clock, ArrowRight, Star } from "lucide-react"

interface Member {
  name: string
  role: string
  specialty: string
  bio: string
  rating: number
  avatarColor: string
}

const TEAM: Member[] = [
  { name: "Dr. Sarah Jenkins, MD", role: "Chief Medical Officer", specialty: "Family & Preventive Medicine", bio: "14+ years experience leading primary care networks and clinical standards.", rating: 4.9, avatarColor: "bg-emerald-600" },
  { name: "Dr. Michael Chang, MD", role: "Director of Pediatrics", specialty: "Childhood Development Care", bio: "Harvard Medical School alumnus. Specializes in child wellness guidelines.", rating: 4.8, avatarColor: "bg-blue-600" },
  { name: "Dr. Elena Rostova, MD", role: "Clinical Advisory Chair", specialty: "Cardiology", bio: "Renowned researcher in preventive cardiology and clinical heart health.", rating: 4.95, avatarColor: "bg-red-600" },
  { name: "Dr. James Carter, MD", role: "Specialty Director", specialty: "Clinical Dermatology", bio: "8+ years in telehealth medicine. Specializes in chronic skin management.", rating: 4.7, avatarColor: "bg-amber-600" },
]

export default function AboutPage() {
  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 mesh-gradient text-white">
        <div className="absolute top-[-30%] left-[-20%] w-[90%] h-[90%] rounded-full ambient-dot-1 animate-pulse-slow pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-450/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <Award className="h-3.5 w-3.5" />
            <span>Founded in 2024 • Clinical Excellence</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl max-w-3xl mx-auto leading-tight">
            Our Mission: Clinical Quality, <br />
            <span className="text-emerald-400">Accessible to All.</span>
          </h1>
          <p className="max-w-xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
            Medigo was founded by clinicians and technology builders to make primary healthcare instant, secure, and unified.
          </p>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">Our Core Pillars</h2>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl tracking-tight">
            Vetted healthcare standards.
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            We focus on three primary values to elevate the digital patient care experience.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-650 dark:bg-emerald-950/25 dark:text-emerald-450">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">HIPAA Integrity</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              We employ military grade end-to-end encryption. Your medical data, consult logs, and files are completely secure and private under GDPR guidelines.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-650 dark:bg-emerald-950/25 dark:text-emerald-450">
              <HeartPulse className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Clinical Quality</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Our clinical advisory board maintains strict care oversight standards. We guarantee that all consultations meet national healthcare quality benchmarks.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-650 dark:bg-emerald-950/25 dark:text-emerald-450">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Immediate Access</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Skip weeks of appointment backlogs. Consult a board-certified physician online in less than 15 minutes, 24 hours a day, 365 days a year.
            </p>
          </div>
        </div>
      </section>

      {/* Advisory Team Grid */}
      <section className="py-20 bg-slate-100 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">Medical Leadership</h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl tracking-tight">
              Guided by clinical experts.
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Our advisory board is composed of industry-certified medical practitioners with decades of patient care expertise.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl flex flex-col justify-between hover:shadow-lg transition-all group"
              >
                <div className="space-y-4">
                  <div className={`h-16 w-16 rounded-2xl ${member.avatarColor} text-white flex items-center justify-center font-extrabold text-2xl shadow-md`}>
                    {member.name.split(" ")[1][0]}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-650 transition-colors">
                      {member.name}
                    </h4>
                    <p className="text-xs font-bold text-slate-450 dark:text-slate-500">{member.role}</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{member.specialty}</p>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed pt-2">
                    {member.bio}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-450 text-amber-450" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-250">{member.rating} Rating</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust CTA section */}
      <section className="py-20 bg-emerald-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.2),transparent_70%)]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight">Experience unified, high-integrity care.</h2>
          <p className="text-emerald-100 max-w-lg mx-auto text-sm leading-relaxed">
            Register your secure health profile today or talk to one of our clinical consultants.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-950 hover:bg-emerald-50 active:scale-[0.98] transition-all"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-950/40 active:scale-[0.98] transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
