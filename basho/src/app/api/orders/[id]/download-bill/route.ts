import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import StaticData from "@/models/StaticData";
import { generateInvoicePDF } from "@/lib/invoice-pdf";
import { validateGST } from "@/lib/gst-validation";

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
      console.log('🔍 Order not found:', id);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if GST number exists and is valid
    const gstNumber = order.customer?.gstNumber?.trim();
    const isGSTValid = gstNumber && validateGST(gstNumber);

    console.log('📋 Download bill request:', {
      orderId: id,
      email: session.user.email,
      hasGST: !!gstNumber,
      gstNumber: gstNumber || 'none',
      isGSTValid,
    });

    if (!isGSTValid) {
      console.log('❌ GST validation failed:', {
        gstNumber,
        isGSTValid,
      });
      return NextResponse.json(
        { error: "Bill download is only available for orders with valid GST number" },
        { status: 403 }
      );
    }

    // Generate PDF invoice
    const staticData = await StaticData.findOne();
    const hsnCode = staticData?.hsnCode || '';

    console.log('🔄 Generating PDF invoice...');

    const pdfBuffer = await generateInvoicePDF({
      razorpayOrderId: order.razorpayOrderId,
      createdAt: order.createdAt,
      customer: order.customer,
      address: order.address,
      items: order.items,
      subtotal: order.subtotal,
      gstAmount: order.gstAmount,
      totalAmount: order.totalAmount,
      hsnCode,
    });

    console.log('✅ PDF invoice generated successfully');

    // Return PDF as a file
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${order._id}.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });

  } catch (error) {
    console.error("❌ Error generating bill:", error);
    return NextResponse.json(
      { error: "Failed to generate bill. Please try again later." },
      { status: 500 }
    );
  }
}