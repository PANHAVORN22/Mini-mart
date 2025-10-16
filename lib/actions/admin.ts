"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getAllOrders() {
  const supabase = await getSupabaseServerClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        beers (*)
      ),
      users (
        full_name,
        email
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all orders:", error);
    return [];
  }

  return orders.map((order) => ({
    id: order.id,
    status: order.status,
    total: Number(order.total),
    createdAt: order.created_at,
    userName: order.users?.full_name || "Unknown",
    userEmail: order.users?.email || "",
    itemCount: order.order_items.length,
  }));
}

export async function updateBeerStock(
  beerId: string,
  stock: number,
  price: number
) {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("beers")
    .update({ stock, price })
    .eq("id", beerId);

  if (error) {
    console.error("Error updating beer stock:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/catalog");
  return { success: true };
}

export async function getAllUsers() {
  const supabase = await getSupabaseServerClient();

  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return users.map((user) => ({
    id: user.id,
    name: user.full_name || "Unknown",
    email: user.email,
    role: user.role,
    isPremium: user.is_premium,
    createdAt: user.created_at,
  }));
}

export async function toggleUserPremium(userId: string, isPremium: boolean) {
  const supabase = await getSupabaseServerClient();

  const premiumExpiresAt = isPremium
    ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { error } = await supabase
    .from("users")
    .update({
      is_premium: isPremium,
      premium_expires_at: premiumExpiresAt,
    })
    .eq("id", userId);

  if (error) {
    console.error("Error toggling premium:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function createBeer(beerData: {
  name: string;
  type: string;
  description?: string;
  price: number;
  alcohol_content?: number;
  volume?: number;
  stock: number;
  image_url?: string;
  is_premium?: boolean;
}) {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("beers")
    .insert(beerData)
    .select()
    .single();

  if (error) {
    console.error("Error creating beer:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/catalog");
  return { success: true, beer: data };
}

export async function updateBeer(
  beerId: string,
  beerData: {
    name?: string;
    type?: string;
    description?: string;
    price?: number;
    alcohol_content?: number;
    volume?: number;
    stock?: number;
    image_url?: string;
    is_premium?: boolean;
  }
) {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("beers")
    .update(beerData)
    .eq("id", beerId);

  if (error) {
    console.error("Error updating beer:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/catalog");
  return { success: true };
}

export async function deleteBeer(beerId: string) {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase.from("beers").delete().eq("id", beerId);

  if (error) {
    console.error("Error deleting beer:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/catalog");
  return { success: true };
}

export async function getAdminStats() {
  const supabase = await getSupabaseServerClient();

  // Get total stock
  const { data: beers } = await supabase.from("beers").select("stock");
  const totalStock = beers?.reduce((sum, beer) => sum + beer.stock, 0) || 0;

  // Get total revenue
  const { data: orders } = await supabase
    .from("orders")
    .select("total, status");
  const totalRevenue =
    orders
      ?.filter((o) => o.status !== "cancelled")
      .reduce((sum, order) => sum + Number(order.total), 0) || 0;

  // Get order count
  const orderCount = orders?.length || 0;

  // Get user count
  const { count: userCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  return {
    totalStock,
    totalRevenue,
    orderCount,
    userCount: userCount || 0,
  };
}
