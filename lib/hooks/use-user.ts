"use client";

import { useEffect, useRef, useState } from "react";
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
  const channelRef = useRef<any>(null);

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

        // Ensure a users row exists. Use the users table as the source of truth for role.
        const metaFullName = authUser.user_metadata?.full_name || "";
        const metaRole =
          (authUser.user_metadata?.role as "customer" | "admin" | undefined) ||
          "customer";

        if (!profile) {
          // Create profile row if missing using metadata as initial values
          await supabase.from("users").insert({
            id: authUser.id,
            email: authUser.email,
            full_name: metaFullName,
            role: metaRole,
          });
        }

        // Read (possibly created) profile and use it as canonical
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
          // Use the role from the users table (finalProfile) as source of truth
          role: (finalProfile?.role as "customer" | "admin") || metaRole,
          isPremium: finalProfile?.is_premium || false,
          premiumExpiresAt: finalProfile?.premium_expires_at,
          createdAt: finalProfile?.created_at || authUser.created_at,
        });

        // Subscribe to realtime changes to this user's row so role updates propagate to the client
        try {
          // Clean up previous channel if any
          if (channelRef.current) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await supabase.removeChannel(channelRef.current);
            channelRef.current = null;
          }

          const channel = supabase
            .channel(`user-profile-${authUser.id}`)
            .on(
              "postgres_changes",
              {
                event: "UPDATE",
                schema: "public",
                table: "users",
                filter: `id=eq.${authUser.id}`,
              },
              (payload: any) => {
                const updated = payload.new as any;
                setUser((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    name: updated.full_name || prev.name,
                    role: (updated.role as "customer" | "admin") || prev.role,
                    isPremium: updated.is_premium ?? prev.isPremium,
                    premiumExpiresAt:
                      updated.premium_expires_at ?? prev.premiumExpiresAt,
                  };
                });
              }
            )
            .subscribe();

          channelRef.current = channel;
        } catch (err) {
          // If realtime isn't available or fails, ignore — it's a best-effort feature
          console.warn(
            "Failed to subscribe to user profile realtime updates",
            err
          );
        }
      }

      setIsLoading(false);
    };

    getInitialUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      // Clean up any existing realtime channel on auth change
      if (channelRef.current) {
        try {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          await supabase.removeChannel(channelRef.current);
        } catch {}
        channelRef.current = null;
      }

      if (session?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        const metaFullName = session.user.user_metadata?.full_name || "";
        const metaRole =
          (session.user.user_metadata?.role as
            | "customer"
            | "admin"
            | undefined) || "customer";

        if (!profile) {
          await supabase.from("users").insert({
            id: session.user.id,
            email: session.user.email,
            full_name: metaFullName,
            role: metaRole,
          });
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
          role: (finalProfile?.role as "customer" | "admin") || metaRole,
          isPremium: finalProfile?.is_premium || false,
          premiumExpiresAt: finalProfile?.premium_expires_at,
          createdAt: finalProfile?.created_at || session.user.created_at,
        });

        // Subscribe to realtime changes for this user
        try {
          const channel = supabase
            .channel(`user-profile-${session.user.id}`)
            .on(
              "postgres_changes",
              {
                event: "UPDATE",
                schema: "public",
                table: "users",
                filter: `id=eq.${session.user.id}`,
              },
              (payload: any) => {
                const updated = payload.new as any;
                setUser((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    name: updated.full_name || prev.name,
                    role: (updated.role as "customer" | "admin") || prev.role,
                    isPremium: updated.is_premium ?? prev.isPremium,
                    premiumExpiresAt:
                      updated.premium_expires_at ?? prev.premiumExpiresAt,
                  };
                });
              }
            )
            .subscribe();

          channelRef.current = channel;
        } catch (err) {
          console.warn(
            "Failed to subscribe to user profile realtime updates",
            err
          );
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      // cleanup realtime channel
      if (channelRef.current) {
        try {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          supabase.removeChannel(channelRef.current);
        } catch {}
        channelRef.current = null;
      }
    };
  }, [supabase]);

  return { user, isLoading, isAuthenticated: !!user };
}
