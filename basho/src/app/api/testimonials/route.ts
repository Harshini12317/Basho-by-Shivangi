import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';

export async function GET() {
  try {
    await connectDB();

    // Fetch only published testimonials
    const testimonials = await Testimonial.find({ isPublished: true }).sort({ createdAt: -1 });

    return NextResponse.json(testimonials);
  } catch (err) {
    console.error('Testimonials API error', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}