import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CustomOrder from '@/models/CustomOrder';
import { sendCustomOrderQuoteEmail } from '@/lib/email';

export async function GET() {
  try {
    await connectDB();
    const orders = await CustomOrder.find({}).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch custom orders' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { id, status, quotedPrice } = await request.json();

    const updateData: { status: string; quotedPrice?: number } = { status };
    if (quotedPrice !== undefined) {
      updateData.quotedPrice = quotedPrice;
    }

    const order = await CustomOrder.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Send quote email if status is being changed to 'quoted'
    if (status === 'quoted' && quotedPrice !== undefined) {
      try {
        await sendCustomOrderQuoteEmail(
          order.name,
          order.email,
          order.description,
          quotedPrice,
          order._id.toString()
        );
      } catch (emailError) {
        console.error("Error sending custom order quote email:", emailError);
        // Continue despite email error - order is already updated
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}