"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseServerClient } from "@/lib/supabase/server"

interface OrderItem {
  beerId: string
  quantity: number
  price: number
}

interface CheckoutData {
  fullName: string
  email: string
  phone: string
  houseNumber: string
  street: string
  city: string
  zipCode: string
}

export async function createOrder(items: OrderItem[], checkoutData: CheckoutData, userId: string) {
  const supabase = await getSupabaseServerClient()

  // Calculate total
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      status: "pending",
      total,
      shipping_address: {
        houseNumber: checkoutData.houseNumber,
        street: checkoutData.street,
        city: checkoutData.city,
        zipCode: checkoutData.zipCode,
      },
      contact_info: {
        fullName: checkoutData.fullName,
        email: checkoutData.email,
        phone: checkoutData.phone,
      },
    })
    .select()
    .single()

  if (orderError || !order) {
    console.error("Error creating order:", orderError)
    return { success: false, error: "Failed to create order" }
  }

  // Create order items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    beer_id: item.beerId,
    quantity: item.quantity,
    price: item.price,
  }))

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

  if (itemsError) {
    console.error("Error creating order items:", itemsError)
    // Rollback order if items fail
    await supabase.from("orders").delete().eq("id", order.id)
    return { success: false, error: "Failed to create order items" }
  }

  // Update beer stock
  for (const item of items) {
    const { data: beer } = await supabase.from("beers").select("stock").eq("id", item.beerId).single()

    if (beer) {
      await supabase
        .from("beers")
        .update({ stock: beer.stock - item.quantity })
        .eq("id", item.beerId)
    }
  }

  revalidatePath("/orders")
  revalidatePath("/admin")

  return { success: true, orderId: order.id }
}

export async function getUserOrders(userId: string) {
  const supabase = await getSupabaseServerClient()

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        beers (*)
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
    return []
  }

  return orders.map((order) => ({
    id: order.id,
    status: order.status,
    total: Number(order.total),
    createdAt: order.created_at,
    shippingAddress: order.shipping_address,
    contactInfo: order.contact_info,
    items: order.order_items.map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      beer: {
        id: item.beers.id,
        name: item.beers.name,
        type: item.beers.type,
        price: Number(item.beers.price),
        imageUrl: item.beers.image_url || "/placeholder.svg",
      },
    })),
  }))
}

export async function getOrderById(orderId: string) {
  const supabase = await getSupabaseServerClient()

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        beers (*)
      )
    `,
    )
    .eq("id", orderId)
    .single()

  if (error || !order) {
    return null
  }

  return {
    id: order.id,
    status: order.status,
    total: Number(order.total),
    createdAt: order.created_at,
    shippingAddress: order.shipping_address,
    contactInfo: order.contact_info,
    items: order.order_items.map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      beer: {
        id: item.beers.id,
        name: item.beers.name,
        type: item.beers.type,
        price: Number(item.beers.price),
        imageUrl: item.beers.image_url || "/placeholder.svg",
      },
    })),
  }
}
