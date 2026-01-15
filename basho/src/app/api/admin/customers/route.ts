import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import Registration from '@/models/Registration';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();

    // Get all users
    const users = await User.find({}).lean();

    // Get all orders and registrations
    const orders = await Order.find({}).lean();
    const registrations = await Registration.find({}).lean();

    // Build customer data
    const customers = users.map((user: any) => {
      // Get orders for this customer by email
      const userOrders = orders.filter(
        (order: any) => order.customer?.email === user.email
      );

      // Get registrations for this customer by email
      const userRegistrations = registrations.filter(
        (reg: any) => reg.email === user.email
      );

      // Calculate total spending
      const productSpending = userOrders.reduce(
        (sum: number, order: any) => sum + (order.totalAmount || 0),
        0
      );

      const workshopSpending = userRegistrations.reduce(
        (sum: number, reg: any) => sum + (reg.amount || 0),
        0
      );

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        totalOrders: userOrders.length,
        totalWorkshops: userRegistrations.length,
        productSpending,
        workshopSpending,
        totalSpending: productSpending + workshopSpending,
        orders: userOrders.map((order: any) => ({
          _id: order._id,
          items: order.items,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
        })),
        workshops: userRegistrations.map((reg: any) => ({
          _id: reg._id,
          workshopTitle: reg.workshopTitle,
          date: reg.date,
          members: reg.members,
          amount: reg.amount,
          createdAt: reg.createdAt,
        })),
      };
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
