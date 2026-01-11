import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import CorporateInquiry from '@/models/CorporateInquiry'

export async function GET() {
  try {
    await connectDB();
    const items = await CorporateInquiry.find({}).sort({ createdAt: -1 });
    return NextResponse.json(items);
  } catch (err) {
    console.error('Admin corporate inquiries fetch error', err);
    return NextResponse.json({ ok: false, error: 'Failed to fetch' }, { status: 500 });
  }
}
