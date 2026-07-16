"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, User, LogOut, ChevronDown, Calendar, Info, Phone } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Do not render navbar on auth pages
  const authPaths = ["/signin", "/signup"]
  if (authPaths.includes(pathname)) return null

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/booking", label: "Book Appointment", protected: true },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 dark:shadow-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4.5 w-4.5"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Medi<span className="text-emerald-600">go</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              // Hide protected links if not logged in
              if (link.protected && !user) return null

              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-semibold transition-colors py-2 px-1 relative",
                    isActive
                      ? "text-emerald-600 dark:text-emerald-500"
                      : "text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-500"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 h-[2px] w-full bg-emerald-600 dark:bg-emerald-500 rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* User Auth Buttons / Profile Dropdown */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1 pr-3 hover:bg-slate-100 transition-all select-none cursor-pointer dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white uppercase">
                    {getInitials(user.fullName)}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {user.fullName.split(" ")[0]}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900 focus:outline-hidden animate-fade-in-up [animation-duration:150ms]">
                    <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                      <p className="text-xs text-slate-400 dark:text-slate-500">Signed in as</p>
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <User className="h-4 w-4 text-slate-500" />
                        My Profile
                      </Link>
                      <Link
                        href="/booking"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Calendar className="h-4 w-4 text-slate-500" />
                        Book Appointment
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
                      <button
                        onClick={signOut}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/signin"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/10 hover:bg-emerald-700 transition-all active:scale-[0.98] dark:shadow-none"
                >
                  Create Profile
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Burger Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 focus:outline-hidden dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white cursor-pointer"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 py-3 space-y-3 shadow-lg dark:border-slate-800/80 dark:bg-slate-950/95 animate-fade-in-up [animation-duration:200ms]">
          <div className="space-y-1">
            {navLinks.map((link) => {
              if (link.protected && !user) return null
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-base font-semibold transition-all",
                    isActive
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-500"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {user ? (
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex items-center gap-3 px-3 pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-bold text-white uppercase">
                  {getInitials(user.fullName)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {user.fullName}
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[200px]">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-base font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  <User className="h-5 w-5 text-slate-400" />
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    signOut()
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-base font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer"
                >
                  <LogOut className="h-5 w-5 text-red-400" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t border-slate-100 pt-4 space-y-2 dark:border-slate-800">
              <Link
                href="/signin"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition-all"
              >
                Create Profile
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
