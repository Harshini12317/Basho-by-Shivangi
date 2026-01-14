import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CustomOrderPhoto from '@/models/CustomOrderPhoto';

export async function GET() {
  try {
    await connectDB();

    const photos = await CustomOrderPhoto.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(photos);
  } catch (error) {
    console.error('Error fetching custom order photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom order photos' },
      { status: 500 }
    );
  }
}