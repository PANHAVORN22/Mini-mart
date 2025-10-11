"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export interface UserProfile {
  id: string
  email: string
  name: string
  role: "customer" | "admin"
  isPremium: boolean
  premiumExpiresAt?: string
  createdAt: string
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    // Get initial user
    const getInitialUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        const { data: profile } = await supabase.from("users").select("*").eq("id", authUser.id).single()

        setUser({
          id: authUser.id,
          email: authUser.email!,
          name: profile?.full_name || authUser.user_metadata?.full_name || "",
          role: profile?.role || "customer",
          isPremium: profile?.is_premium || false,
          premiumExpiresAt: profile?.premium_expires_at,
          createdAt: profile?.created_at || authUser.created_at,
        })
      }

      setIsLoading(false)
    }

    getInitialUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: profile?.full_name || session.user.user_metadata?.full_name || "",
          role: profile?.role || "customer",
          isPremium: profile?.is_premium || false,
          premiumExpiresAt: profile?.premium_expires_at,
          createdAt: profile?.created_at || session.user.created_at,
        })
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return { user, isLoading, isAuthenticated: !!user }
}
