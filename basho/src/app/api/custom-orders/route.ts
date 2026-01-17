import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CustomOrder from "@/models/CustomOrder";
import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendCustomOrderRequestEmail } from "@/lib/email";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const dummyCustomOrders = [
  {
    _id: "co1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+91 9876543210",
    description: "Custom wedding vase with floral motifs",
    referenceImages: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop&crop=center"
    ],
    notes: "White and blue theme, 12 inches tall",
    status: "completed",
    quotedPrice: 3500,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-02-20"),
  },
  {
    _id: "co2",
    name: "Mike Chen",
    email: "mike@example.com",
    phone: "+91 9876543211",
    description: "Personalized coffee mug set for office",
    referenceImages: [
      "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=300&h=200&fit=crop&crop=center"
    ],
    notes: "6 mugs with different inspirational quotes",
    status: "in-progress",
    quotedPrice: 4800,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-15"),
  },
  {
    _id: "co3",
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "+91 9876543212",
    description: "Custom dinnerware set for 4",
    referenceImages: [
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop&crop=center"
    ],
    notes: "Traditional Indian design with modern twist",
    status: "quoted",
    quotedPrice: 8500,
    createdAt: new Date("2024-01-28"),
    updatedAt: new Date("2024-02-05"),
  },
  {
    _id: "co4",
    name: "David Wilson",
    email: "david@example.com",
    phone: "+91 9876543213",
    description: "Ceramic planter for indoor plants",
    referenceImages: [
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop&crop=center"
    ],
    notes: "Drainage holes, 8 inch diameter",
    status: "completed",
    quotedPrice: 2200,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-25"),
  },
];

export async function GET() {
  try {
    // Try to return real data from DB; fallback to dummy data if DB unavailable
    try {
      await connectDB();
      const orders = await CustomOrder.find({}).sort({ createdAt: -1 });
      return NextResponse.json(orders);
    } catch (dbErr) {
      return NextResponse.json(dummyCustomOrders);
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, phone, description, referenceImages, notes } = body;

    // Validate that the email matches the session email
    if (email !== session.user.email) {
      return NextResponse.json(
        { error: "Email mismatch with authenticated user" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!name || !email || !phone || !description) {
      return NextResponse.json(
        { error: "Name, email, phone, and description are required" },
        { status: 400 }
      );
    }

    // If there are base64/data-URI images, upload them to Cloudinary first
    let processedImages: string[] = referenceImages && Array.isArray(referenceImages) ? referenceImages : [];
    try {
      processedImages = await Promise.all(
        processedImages.map(async (img: string) => {
          if (typeof img === "string" && img.startsWith("data:")) {
            // upload data URI to Cloudinary
            const res = await cloudinary.uploader.upload(img, { folder: "custom_orders" });
            return res.secure_url;
          }
          return img;
        })
      );
    } catch (uploadErr) {
      // If upload fails, continue with original values (or empty array)
      console.error("Cloudinary upload error:", uploadErr);
    }

    // Persist to DB
    await connectDB();
    const created = await CustomOrder.create({
      name,
      email,
      phone,
      description,
      referenceImages: processedImages || [],
      notes: notes || "",
      status: "requested",
    });

    // Send confirmation emails to both customer and admin
    try {
      await sendCustomOrderRequestEmail(
        name,
        email,
        description,
        created._id.toString()
      );
    } catch (emailError) {
      console.error("Error sending custom order request email:", emailError);
      // Continue despite email error - order is already created
    }

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}