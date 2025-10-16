"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, QrCode } from "lucide-react";
import { ABABankQRCode } from "@/components/aba-bank-qr";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "N/A";
  const amount = searchParams.get("amount") || "0.00";

  return (
    <>
      <Header />

      <main className="flex-1 flex items-center justify-center py-16">
        <div className="container max-w-4xl">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Order Confirmation Card */}
            <Card>
              <CardContent className="flex flex-col items-center gap-6 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">Order Confirmed!</h1>
                  <p className="text-muted-foreground">
                    Thank you for your purchase
                  </p>
                </div>

                <div className="w-full rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="text-lg font-mono font-semibold">{orderId}</p>
                </div>

                <div className="w-full rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">${amount}</p>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Please complete payment using the QR code.</p>
                  <p>You can track your order status in your dashboard.</p>
                </div>

                <div className="flex w-full flex-col gap-2">
                  <Link href="/orders" className="w-full">
                    <Button className="w-full">View Orders</Button>
                  </Link>
                  <Link href="/catalog" className="w-full">
                    <Button variant="outline" className="w-full bg-transparent">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  ABA Bank Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <ABABankQRCode orderId={orderId} amount={amount} />
                <div className="w-full space-y-2 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">How to pay:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Open your ABA Mobile app</li>
                    <li>Tap on "Scan QR" or "Pay"</li>
                    <li>Scan the QR code above</li>
                    <li>Confirm the payment details</li>
                    <li>Complete the transaction</li>
                  </ol>
                </div>
                <div className="w-full rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3">
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    <strong>Note:</strong> Your order will be processed once
                    payment is confirmed. This usually takes 1-2 minutes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
