"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, Beer } from "./types"

interface CartStore {
  items: CartItem[]
  addItem: (beer: Beer) => void
  removeItem: (beerId: string) => void
  updateQuantity: (beerId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (beer) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.beer.id === beer.id)
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.beer.id === beer.id ? { ...item, quantity: item.quantity + 1 } : item,
              ),
            }
          }
          return { items: [...state.items, { beer, quantity: 1 }] }
        }),
      removeItem: (beerId) =>
        set((state) => ({
          items: state.items.filter((item) => item.beer.id !== beerId),
        })),
      updateQuantity: (beerId, quantity) =>
        set((state) => ({
          items: state.items.map((item) => (item.beer.id === beerId ? { ...item, quantity } : item)),
        })),
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.beer.price * item.quantity, 0)
      },
      getItemCount: () => {
        const { items } = get()
        return items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: "beer-cart-storage",
    },
  ),
)
