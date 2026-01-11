import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CustomOrder from '@/models/CustomOrder';

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

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}