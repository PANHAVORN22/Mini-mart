"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getSubscription(userId: string) {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }

  return data;
}

export async function subscribe(userId: string, plan: "monthly" | "yearly") {
  const supabase = await getSupabaseServerClient();

  const durationDays = plan === "monthly" ? 30 : 365;
  const expiresAt = new Date(
    Date.now() + durationDays * 24 * 60 * 60 * 1000
  ).toISOString();

  // Upsert active subscription
  const { data, error } = await supabase
    .from("subscriptions")
    .insert({ user_id: userId, plan, status: "active", expires_at: expiresAt })
    .select()
    .single();

  if (error) {
    console.error("Error creating subscription:", error);
    return { success: false, error: error.message };
  }

  // Reflect on users table for quick checks
  const { error: userError } = await supabase
    .from("users")
    .update({ is_premium: true, premium_expires_at: expiresAt })
    .eq("id", userId);

  if (userError) {
    console.error("Error updating user premium state:", userError);
    return { success: false, error: userError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/subscription");
  return { success: true, subscription: data };
}

export async function cancelSubscription(userId: string) {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    console.error("Error cancelling subscription:", error);
    return { success: false, error: error.message };
  }

  const { error: userError } = await supabase
    .from("users")
    .update({ is_premium: false, premium_expires_at: null })
    .eq("id", userId);

  if (userError) {
    console.error("Error updating user premium state:", userError);
    return { success: false, error: userError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/subscription");
  return { success: true };
}
