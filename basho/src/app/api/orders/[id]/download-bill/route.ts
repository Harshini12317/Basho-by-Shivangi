import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import StaticData from "@/models/StaticData";
import { generateInvoicePDF } from "@/lib/invoice-pdf";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    // Find user
    const User = (await import("@/models/User")).default;
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const order = await Order.findOne({
      _id: id,
      userId: user._id,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow download if GST number is provided
    if (!order.customer.gstNumber) {
      return NextResponse.json(
        { error: "Bill download is only available for orders with GST number" },
        { status: 403 }
      );
    }

    // Generate PDF invoice
    const staticData = await StaticData.findOne();
    const hsnCode = staticData?.hsnCode || '';
    const pdfBuffer = await generateInvoicePDF({ ...order.toObject(), hsnCode });

    // Return PDF as downloadable file
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${order._id}.pdf"`,
      },
    });

  } catch (error) {
    console.error("Error generating bill:", error);
    return NextResponse.json(
      { error: "Failed to generate bill" },
      { status: 500 }
    );
  }
}