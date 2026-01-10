import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Popup from '@/models/Popup';

export async function GET() {
  try {
    await connectDB();
    // Return all active popups
    const popups = await Popup.find({ isActive: true });
    return NextResponse.json(popups);
  } catch (error) {
    console.error('Error fetching popups:', error);
    return NextResponse.json({ error: 'Failed to fetch popups' }, { status: 500 });
  }
}
