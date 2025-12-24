import { connectDB } from "../../../lib/mongodb";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ success: true, message: "MongoDB connected ✅" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "MongoDB connection failed ❌" },
      { status: 500 }
    );
  }
}
