import { connectDB } from "@/lib/mongodb";
import Registration from "@/models/Registration";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();
  try {
    const body = await req.json();
    const { workshopSlug, name, email } = body;
    if (!workshopSlug || !name || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const reg = await Registration.create({ workshopSlug, name, email });
    return NextResponse.json({ success: true, registration: reg }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
