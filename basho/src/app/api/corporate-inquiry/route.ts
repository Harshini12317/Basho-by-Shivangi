import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import CorporateInquiry from '@/models/CorporateInquiry'

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { companyName, email, phone, message } = data;

    if (!companyName || !email || !message) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();
    const doc = await CorporateInquiry.create({ companyName, email, phone, message });
    console.log('Saved corporate inquiry:', { id: doc._id, companyName, email });

    return NextResponse.json({ ok: true, id: doc._id });
  } catch (err) {
    console.error('Corporate inquiry API error', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
