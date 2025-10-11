"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"

interface ABABankQRCodeProps {
  orderId: string
  amount: string
}

export function ABABankQRCode({ orderId, amount }: ABABankQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Format: ABA Bank KHQR standard format
    // In production, this should use the actual ABA Bank API format
    const paymentData = {
      merchantId: "MINIMART_BEER_SHOP",
      orderId: orderId,
      amount: amount,
      currency: "USD",
      description: `Beer Order #${orderId}`,
    }

    // Generate QR code with payment data
    const qrData = JSON.stringify(paymentData)

    QRCode.toCanvas(
      canvasRef.current,
      qrData,
      {
        width: 280,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      },
      (error) => {
        if (error) {
          console.error(" QR Code generation error:", error)
        }
      },
    )
  }, [orderId, amount])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-lg border-2 border-primary/20 p-4 bg-white">
        <canvas ref={canvasRef} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">Scan with ABA Mobile</p>
        <p className="text-xs text-muted-foreground">Order #{orderId}</p>
      </div>
    </div>
  )
}
