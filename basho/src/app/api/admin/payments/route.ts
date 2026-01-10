import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import CustomOrder from '@/models/CustomOrder';

export async function GET() {
  try {
    await connectDB();

    // Fetch regular orders
    const orders = await Order.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    // Fetch paid custom orders
    const customOrders = await CustomOrder.find({ status: 'paid' })
      .sort({ paidAt: -1 })
      .limit(100);

    // Combine and format payments
    const payments = [
      ...orders.map(order => ({
        id: order._id.toString(),
        orderId: order.razorpayOrderId || order._id.toString(),
        paymentId: order.paymentId,
        amount: order.totalAmount,
        currency: 'INR',
        status: 'success',
        customer: {
          name: order.customer?.name || (order.userId as any)?.name || 'Unknown',
          email: order.customer?.email || (order.userId as any)?.email || 'Unknown',
        },
        type: 'product',
        createdAt: order.createdAt.toISOString(),
      })),
      ...customOrders.map(customOrder => ({
        id: customOrder._id.toString(),
        orderId: customOrder.razorpayOrderId || customOrder._id.toString(),
        paymentId: customOrder.paymentId,
        amount: customOrder.quotedPrice || 0,
        currency: 'INR',
        status: 'success',
        customer: {
          name: customOrder.name,
          email: customOrder.email,
        },
        type: 'custom-order',
        createdAt: customOrder.paidAt?.toISOString() || customOrder.createdAt.toISOString(),
      }))
    ];

    // Sort by creation date (most recent first)
    payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}