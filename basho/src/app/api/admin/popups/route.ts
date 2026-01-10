import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Popup from '@/models/Popup';

export async function GET() {
  try {
    await connectDB();
    const popups = await Popup.find({}).sort({ createdAt: -1 });
    return NextResponse.json(popups);
  } catch (error) {
    console.error('Error fetching popups:', error);
    return NextResponse.json({ error: 'Failed to fetch popups' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectDB();
    
    // Sanitize dates
    if (body.startAt === '') delete body.startAt;
    if (body.endAt === '') delete body.endAt;

    // Create new popup
    const popup = await Popup.create(body);
    
    return NextResponse.json(popup, { status: 201 });
  } catch (error) {
    console.error('Error creating popup:', error);
    return NextResponse.json({ error: 'Failed to create popup' }, { status: 500 });
  }
}
