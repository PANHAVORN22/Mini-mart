"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
  isPremium: boolean;
  premiumExpiresAt?: string;
  createdAt: string;
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    // Get initial user
    const getInitialUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        // Fetch profile
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();

        // Ensure a users row exists and role matches auth metadata
        const metaFullName = authUser.user_metadata?.full_name || "";
        const metaRole =
          (authUser.user_metadata?.role as "customer" | "admin" | undefined) ||
          "customer";

        if (!profile) {
          // Create profile row if missing
          await supabase
            .from("users")
            .insert({
              id: authUser.id,
              email: authUser.email,
              full_name: metaFullName,
              role: metaRole,
            });
        } else if (profile.role !== metaRole) {
          // Sync role from metadata (e.g., admin signups)
          await supabase
            .from("users")
            .update({ role: metaRole })
            .eq("id", authUser.id);
        }

        // Read (possibly updated) profile
        const { data: finalProfile } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        setUser({
          id: authUser.id,
          email: authUser.email!,
          name:
            finalProfile?.full_name || authUser.user_metadata?.full_name || "",
          role: (finalProfile?.role as "customer" | "admin") || "customer",
          isPremium: finalProfile?.is_premium || false,
          premiumExpiresAt: finalProfile?.premium_expires_at,
          createdAt: finalProfile?.created_at || authUser.created_at,
        });
      }

      setIsLoading(false);
    };

    getInitialUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        // Ensure a users row exists and role matches auth metadata
        const metaFullName = session.user.user_metadata?.full_name || "";
        const metaRole =
          (session.user.user_metadata?.role as
            | "customer"
            | "admin"
            | undefined) || "customer";

        if (!profile) {
          await supabase
            .from("users")
            .insert({
              id: session.user.id,
              email: session.user.email,
              full_name: metaFullName,
              role: metaRole,
            });
        } else if (profile.role !== metaRole) {
          await supabase
            .from("users")
            .update({ role: metaRole })
            .eq("id", session.user.id);
        }

        const { data: finalProfile } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email!,
          name:
            finalProfile?.full_name ||
            session.user.user_metadata?.full_name ||
            "",
          role: (finalProfile?.role as "customer" | "admin") || "customer",
          isPremium: finalProfile?.is_premium || false,
          premiumExpiresAt: finalProfile?.premium_expires_at,
          createdAt: finalProfile?.created_at || session.user.created_at,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, isLoading, isAuthenticated: !!user };
}
