import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import Registration from '@/models/Registration';
import CustomOrder from '@/models/CustomOrder';
import Event from '@/models/Event';
import EventBooking from '@/models/EventBooking';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();

    // Get all users
    const users = await User.find({}).lean();

    // Get all orders and registrations
    const orders = await Order.find({}).lean();
    const registrations = await Registration.find({}).lean();
    const customOrders = await CustomOrder.find({}).lean();
    const eventBookings = await EventBooking.find({}).lean();
    const events = await Event.find({}).lean();

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

      // Get custom orders for this customer by email
      const userCustomOrders = customOrders.filter(
        (co: any) => co.customerEmail === user.email
      );

      // Get event bookings for this customer by phone or name
      const userEventBookings = eventBookings.filter(
        (eb: any) =>
          eb.customerPhone === user.phone || eb.customerName === user.name
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

      const customOrderSpending = userCustomOrders.reduce(
        (sum: number, co: any) => sum + (co.totalPrice || 0),
        0
      );

      const eventSpending = userEventBookings.reduce(
        (sum: number, eb: any) => sum + (eb.amount || 0),
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
        totalCustomOrders: userCustomOrders.length,
        totalEventBookings: userEventBookings.length,
        productSpending,
        workshopSpending,
        customOrderSpending,
        eventSpending,
        totalSpending:
          productSpending + workshopSpending + customOrderSpending + eventSpending,
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
        customOrders: userCustomOrders.map((co: any) => ({
          _id: co._id,
          title: co.title,
          totalPrice: co.totalPrice,
          status: co.status,
          createdAt: co.createdAt,
        })),
        eventBookings: userEventBookings.map((eb: any) => {
          const event = events.find((e: any) => e._id.toString() === eb.eventId.toString());
          return {
            _id: eb._id,
            eventTitle: event?.title || 'Unknown Event',
            bookingDate: eb.bookingDate,
            status: eb.status,
            createdAt: eb.createdAt,
          };
        }),
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
