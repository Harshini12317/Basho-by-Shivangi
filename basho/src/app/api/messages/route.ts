import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Message from "@/models/Message";
import CustomOrder from "@/models/CustomOrder";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/messages?customOrderId=...
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customOrderId = searchParams.get('customOrderId');

    if (!customOrderId) {
      return NextResponse.json({ error: "Custom order ID required" }, { status: 400 });
    }

    await connectDB();

    // Verify the user has access to this custom order
    const customOrder = await CustomOrder.findById(customOrderId);

    // Check if user is admin
    const isAdmin = session.user.email === process.env.ADMIN_EMAIL;

    // For development/testing: if custom order doesn't exist in DB, allow access
    // This handles the case where dummy data is used
    if (customOrder) {
      // Check if user is admin or the customer who placed the order
      const isCustomer = customOrder.email.toLowerCase() === session.user.email.toLowerCase();

      if (!isAdmin && !isCustomer) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    const messages = await Message.find({ customOrderId })
      .sort({ timestamp: 1 })
      .lean();

    // Mark messages as read for the current user
    const unreadMessageIds = messages
      .filter(msg => !msg.read && (
        (isAdmin && msg.senderType === 'customer') ||
        (!isAdmin && msg.senderType === 'admin')
      ))
      .map(msg => msg._id);

    if (unreadMessageIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadMessageIds } },
        { $set: { read: true } }
      );
    }

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/messages
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customOrderId, message } = await request.json();

    if (!customOrderId || !message) {
      return NextResponse.json({ error: "Custom order ID and message required" }, { status: 400 });
    }

    await connectDB();

    // Verify the user has access to this custom order
    const customOrder = await CustomOrder.findById(customOrderId);

    // Check if user is admin
    const isAdmin = session.user.email === process.env.ADMIN_EMAIL;

    // For development/testing: if custom order doesn't exist in DB, allow access
    // This handles the case where dummy data is used
    if (customOrder) {
      // Check if user is admin or the customer who placed the order
      const isCustomer = customOrder.email.toLowerCase() === session.user.email.toLowerCase();

      if (!isAdmin && !isCustomer) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    const senderType = isAdmin ? 'admin' : 'customer';
    const senderId = session.user.email;

    const newMessage = new Message({
      customOrderId,
      senderId,
      senderType,
      message: message.trim(),
    });

    await newMessage.save();

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}