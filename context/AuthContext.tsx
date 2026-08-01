"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"

interface User {
  id: string
  fullName: string
  email: string
  dob?: string
  phone: string
  role?: string
  clinicName?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (data: any) => Promise<any>
  signUp: (data: any) => Promise<any>
  clinicSignIn: (data: { email: string; password: string }) => Promise<any>
  clinicSignUp: (data: {
    clinicName: string
    email: string
    password: string
    phone: string
    agreeTerms: boolean
  }) => Promise<any>
  verifyOTP: (email: string, otp: string, purpose: string) => Promise<any>
  resendOTP: (email: string) => Promise<any>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const getJwtExpiry = (token: string): number | null => {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const payload = JSON.parse(window.atob(parts[1]))
    return payload.exp ? payload.exp * 1000 : null
  } catch (e) {
    return null
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const scheduleTokenRefresh = (tokenStr: string) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    const expiry = getJwtExpiry(tokenStr)
    if (!expiry) return

    const now = Date.now()
    const timeUntilExpiry = expiry - now
    
    // Refresh 1 minute before expiry or halfway if it's very short
    const safetyMargin = Math.min(60 * 1000, timeUntilExpiry / 2)
    const delay = Math.max(0, timeUntilExpiry - safetyMargin)

    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        await refreshTokens()
      } catch (err) {
        console.error("Auto refresh token failed:", err)
      }
    }, delay)
  }

  const refreshTokens = async () => {
    const storedRefreshToken = localStorage.getItem("medigo_refresh_token")
    if (!storedRefreshToken) {
      signOut()
      return null
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      })

      const resData = await response.json()

      if (!response.ok) {
        throw new Error(resData.message || "Failed to refresh token")
      }

      setToken(resData.token)
      localStorage.setItem("medigo_token", resData.token)
      if (resData.refreshToken) {
        localStorage.setItem("medigo_refresh_token", resData.refreshToken)
      }

      scheduleTokenRefresh(resData.token)
      return resData.token
    } catch (error) {
      console.error("Token refresh failed, logging out user:", error)
      signOut()
      throw error
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("medigo_token")
      const storedUser = localStorage.getItem("medigo_user")
      const storedRefreshToken = localStorage.getItem("medigo_refresh_token")

      if (storedToken && storedUser) {
        const expiry = getJwtExpiry(storedToken)
        const now = Date.now()

        // If token expires in less than 10 seconds, try to refresh immediately on mount
        if (expiry && expiry - now < 10000 && storedRefreshToken) {
          try {
            const newToken = await refreshTokens()
            if (newToken) {
              setToken(newToken)
              setUser(JSON.parse(storedUser))
            }
          } catch (e) {
            console.error("Failed to initialize auth with refreshed token:", e)
            signOut()
          }
        } else {
          setToken(storedToken)
          try {
            setUser(JSON.parse(storedUser))
            scheduleTokenRefresh(storedToken)
          } catch (e) {
            console.error("Failed to parse stored user from localStorage:", e)
          }
        }
      }
      setIsLoading(false)
    }

    initializeAuth()

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [])

  // Client-side route guard
  useEffect(() => {
    if (isLoading) return

    const publicPages = ["/", "/Login", "/signup", "/about", "/contact", "/set-password"]
    const isClinicAuthPage =
      pathname === "/clinic/signin" || pathname === "/clinic/signup"
    const isPublicPage = publicPages.includes(pathname) || isClinicAuthPage

    if (!user) {
      if (!isPublicPage) {
        if (pathname.startsWith("/clinic")) {
          router.push("/clinic/signin")
        } else {
          router.push("/Login")
        }
      }
      return
    }

    if (user.role === "clinic") {
      if (
        pathname === "/" ||
        pathname.startsWith("/booking") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/doctor") ||
        pathname === "/Login" ||
        pathname === "/signup" ||
        pathname === "/clinic/signin" ||
        pathname === "/clinic/signup"
      ) {
        router.push("/clinic")
      }
      return
    }

    if (user.role === "doctor") {
      if (
        pathname === "/" ||
        pathname.startsWith("/booking") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/clinic")
      ) {
        router.push("/doctor")
      }
      return
    }

    // Patients should not visit doctor / clinic dashboards
    if (pathname.startsWith("/doctor") || pathname === "/clinic") {
      router.push("/")
    }
  }, [user, pathname, isLoading, router])

  const persistSession = (resData: any) => {
    setToken(resData.token)
    setUser(resData.user)
    localStorage.setItem("medigo_token", resData.token)
    localStorage.setItem("medigo_user", JSON.stringify(resData.user))
    if (resData.refreshToken) {
      localStorage.setItem("medigo_refresh_token", resData.refreshToken)
    }
    scheduleTokenRefresh(resData.token)
  }

  const signIn = async (data: any) => {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    })

    const resData = await response.json()

    if (!response.ok) {
      throw new Error(resData.message || "Failed to sign in")
    }

    // If 2FA OTP is required, stop here and let frontend component handle it
    if (resData.requireOTP) {
      return resData
    }

    persistSession(resData)
    return resData
  }

  const clinicSignIn = async (data: { email: string; password: string }) => {
    const response = await fetch("http://localhost:5000/api/clinic/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const resData = await response.json()
    if (!response.ok) {
      throw new Error(resData.message || "Failed to sign in")
    }
    persistSession(resData)
    return resData
  }

  const clinicSignUp = async (data: {
    clinicName: string
    email: string
    password: string
    phone: string
    agreeTerms: boolean
  }) => {
    const response = await fetch("http://localhost:5000/api/clinic/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const resData = await response.json()
    if (!response.ok) {
      throw new Error(resData.message || "Failed to register clinic")
    }
    persistSession(resData)
    return resData
  }

  const signUp = async (data: any) => {
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        dob: data.dob,
        phone: data.phone,
        agreeTerms: data.agreeTerms,
        role: data.role || "patient",
        category: data.category || null,
        education: data.education || null,
        experience: data.experience || 0,
      }),
    })

    const resData = await response.json()

    if (!response.ok) {
      throw new Error(resData.message || "Failed to create account")
    }

    // If 2FA OTP is required, stop here and let frontend component handle it
    if (resData.requireOTP) {
      return resData
    }

    persistSession(resData)
    return resData
  }

  const verifyOTP = async (email: string, otp: string, purpose: string) => {
    const response = await fetch("http://localhost:5000/api/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp, purpose }),
    })

    const resData = await response.json()

    if (!response.ok) {
      throw new Error(resData.message || "Failed to verify verification code")
    }

    persistSession(resData)
    return resData
  }

  const resendOTP = async (email: string) => {
    const response = await fetch("http://localhost:5000/api/auth/resend-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })

    const resData = await response.json()

    if (!response.ok) {
      throw new Error(resData.message || "Failed to resend code")
    }

    return resData
  }

  const signOut = async () => {
    const storedRefreshToken = localStorage.getItem("medigo_refresh_token")
    if (storedRefreshToken) {
      try {
        await fetch("http://localhost:5000/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        })
      } catch (e) {
        console.error("Failed to notify logout to backend:", e)
      }
    }

    setToken(null)
    setUser(null)
    localStorage.removeItem("medigo_token")
    localStorage.removeItem("medigo_refresh_token")
    localStorage.removeItem("medigo_user")
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }
    if (pathname.startsWith("/clinic")) {
      router.push("/clinic/signin")
    } else {
      router.push("/signin")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        signIn,
        signUp,
        clinicSignIn,
        clinicSignUp,
        verifyOTP,
        resendOTP,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
