import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { label, street, city, state, zip } = body;

    // Validate required fields
    if (!street || !city || !state || !zip) {
      return NextResponse.json({ error: "Missing required address fields" }, { status: 400 });
    }

    await connectDB();

    // Create new address object
    const newAddress = {
      label: label || "Home",
      street,
      city,
      state,
      zip,
      isDefault: false, // New addresses are not default by default
    };

    // Add address to user's addresses array
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $push: { addresses: newAddress } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the newly created address
    return NextResponse.json(newAddress);
  } catch (error) {
    console.error("Error saving address:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}