import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Registration from '@/models/Registration';

export async function GET() {
  try {
    await connectDB();
    const registrations = await Registration.find({}).sort({ createdAt: -1 });
    return NextResponse.json(registrations);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}