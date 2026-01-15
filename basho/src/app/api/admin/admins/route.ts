import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

async function requireAdminSession() {
  const session = await getServerSession(authOptions as any) as any;
  if (!session?.user?.email) return { ok: false, status: 401 };

  await connectDB();
  const me = await User.findOne({ email: session.user.email }).lean();
  if (!me || !me.isAdmin) return { ok: false, status: 403 };

  return { ok: true, me };
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  // If check param present, return whether current session user is admin
  if (url.searchParams.get('check') === 'true') {
    const session = await getServerSession(authOptions as any) as any;
    if (!session?.user?.email) return NextResponse.json({ isAdmin: false }, { status: 200 });
    await connectDB();
    const me = await User.findOne({ email: session.user.email }).lean();
    return NextResponse.json({ isAdmin: !!me?.isAdmin }, { status: 200 });
  }

  // List admins (protected)
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ message: 'Forbidden' }, { status: auth.status });

  await connectDB();
  const admins = await User.find({ isAdmin: true }).select('email name createdAt').lean();
  return NextResponse.json(admins, { status: 200 });
}

export async function POST(request: NextRequest) {
  // Allow creating first admin without authentication
  await connectDB();
  const existingAdmins = await User.countDocuments({ isAdmin: true });

  if (existingAdmins > 0) {
    // If admins exist, require admin authentication
    const auth = await requireAdminSession();
    if (!auth.ok) return NextResponse.json({ message: 'Forbidden' }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { email } = body;
    if (!email) return NextResponse.json({ message: 'Email required' }, { status: 400 });

    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // create a placeholder user with random password
      const random = Math.random().toString(36).slice(2);
      const hashed = await bcrypt.hash(random, 10);
      user = await User.create({
        name: email.split('@')[0],
        email,
        password: hashed,
        isVerified: false,
        isAdmin: true,
      });
    } else {
      user.isAdmin = true;
      await user.save();
    }

    return NextResponse.json({ success: true, message: 'Admin added' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to add admin' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // Remove admin by email (protected)
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ message: 'Forbidden' }, { status: auth.status });

  try {
    const body = await request.json();
    const { email } = body;
    if (!email) return NextResponse.json({ message: 'Email required' }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    user.isAdmin = false;
    await user.save();
    return NextResponse.json({ success: true, message: 'Admin removed' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to remove admin' }, { status: 500 });
  }
}
