"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

interface User {
  id: string
  fullName: string
  email: string
  dob: string
  phone: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (data: any) => Promise<any>
  signUp: (data: any) => Promise<any>
  signOut: () => void
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Load authentication context on mount
    const storedToken = localStorage.getItem("medigo_token")
    const storedUser = localStorage.getItem("medigo_user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("Failed to parse stored user from localStorage:", e)
      }
    }
    setIsLoading(false)
  }, [])

  // Client-side route guard
  useEffect(() => {
    if (isLoading) return

    const publicPages = ["/", "/signin", "/signup", "/about", "/contact"]
    const isPublicPage = publicPages.includes(pathname)

    if (!isPublicPage && !user) {
      router.push("/signin")
    }
  }, [user, pathname, isLoading, router])

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

    setToken(resData.token)
    setUser(resData.user)
    localStorage.setItem("medigo_token", resData.token)
    localStorage.setItem("medigo_refresh_token", resData.refreshToken)
    localStorage.setItem("medigo_user", JSON.stringify(resData.user))

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
      }),
    })

    const resData = await response.json()

    if (!response.ok) {
      throw new Error(resData.message || "Failed to create account")
    }

    setToken(resData.token)
    setUser(resData.user)
    localStorage.setItem("medigo_token", resData.token)
    localStorage.setItem("medigo_refresh_token", resData.refreshToken)
    localStorage.setItem("medigo_user", JSON.stringify(resData.user))

    return resData
  }

  const signOut = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("medigo_token")
    localStorage.removeItem("medigo_refresh_token")
    localStorage.removeItem("medigo_user")
    router.push("/signin")
  }

  // Fetch wrapper that handles auto-token-refresh on 401 responses
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    let currentToken = token || localStorage.getItem("medigo_token")

    const headers = {
      ...options.headers,
      "Content-Type": "application/json",
    } as Record<string, string>

    if (currentToken) {
      headers["Authorization"] = `Bearer ${currentToken}`
    }

    let response = await fetch(url, { ...options, headers })

    if (response.status === 401) {
      const storedRefreshToken = localStorage.getItem("medigo_refresh_token")
      if (storedRefreshToken) {
        try {
          const refreshRes = await fetch("http://localhost:5000/api/auth/refresh", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken: storedRefreshToken }),
          })

          if (refreshRes.ok) {
            const refreshData = await refreshRes.ok ? await refreshRes.json() : null
            if (refreshData && refreshData.token) {
              const newAccessToken = refreshData.token
              const newRefreshToken = refreshData.refreshToken || storedRefreshToken

              setToken(newAccessToken)
              localStorage.setItem("medigo_token", newAccessToken)
              localStorage.setItem("medigo_refresh_token", newRefreshToken)

              // Retry the original request with the new access token
              headers["Authorization"] = `Bearer ${newAccessToken}`
              response = await fetch(url, { ...options, headers })
            } else {
              signOut()
            }
          } else {
            signOut()
          }
        } catch (err) {
          console.error("Error during auto-token-refresh:", err)
          signOut()
        }
      } else {
        signOut()
      }
    }

    return response
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
        signOut,
        fetchWithAuth,
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
