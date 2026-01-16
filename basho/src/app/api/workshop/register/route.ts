import { connectDB } from "@/lib/mongodb";
import Registration from "@/models/Registration";
import { sendWorkshopRegistrationEmail } from "@/lib/email";
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
    
    // Send confirmation emails
    try {
      console.log(`Sending workshop registration emails to ${email} and admin`);
      await sendWorkshopRegistrationEmail(email, name, workshopSlug);
      console.log("Workshop registration emails sent successfully");
    } catch (emailError) {
      console.error("Failed to send workshop registration email:", emailError);
      // Don't fail the registration if email fails
    }
    
    return NextResponse.json({ success: true, registration: reg }, { status: 201 });
  } catch (err) {
    console.error("Workshop registration error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
