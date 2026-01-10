import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Message from "@/models/Message";
import CustomOrder from "@/models/CustomOrder";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/messages/unread
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const isAdmin = session.user.email === process.env.ADMIN_EMAIL;

    let unreadCounts: { [key: string]: number } = {};

    if (isAdmin) {
      // For admin, count unread messages from customers for each custom order
      const customOrders = await CustomOrder.find({});
      for (const order of customOrders) {
        const unreadCount = await Message.countDocuments({
          customOrderId: order._id,
          senderType: 'customer',
          read: false
        });
        if (unreadCount > 0) {
          unreadCounts[order._id.toString()] = unreadCount;
        }
      }
    } else {
      // For customer, count unread messages from admin for their custom orders
      const customOrders = await CustomOrder.find({
        email: { $regex: new RegExp(`^${session.user.email}$`, 'i') }
      });
      for (const order of customOrders) {
        const unreadCount = await Message.countDocuments({
          customOrderId: order._id,
          senderType: 'admin',
          read: false
        });
        if (unreadCount > 0) {
          unreadCounts[order._id.toString()] = unreadCount;
        }
      }
    }

    return NextResponse.json(unreadCounts);
  } catch (error: any) {
    console.error('Error fetching unread counts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}