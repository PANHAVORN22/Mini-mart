import { NextResponse } from "next/server";
import { getNotifications } from "@/lib/actions/admin";

export async function GET() {
  try {
    const notifications = await getNotifications(50);
    return NextResponse.json({ success: true, data: notifications });
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 });
  }
}
