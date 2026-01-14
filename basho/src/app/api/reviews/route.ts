import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb';
import UserReview from '@/models/UserReview';

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json()
    const name = String(body.name || body.who || 'Anonymous')
    const email = String(body.email || '')
    const message = String(body.message || body.text || '')
    const rating = Number(body.rating || 5)
    const image = body.image ? String(body.image) : undefined
    const videoUrl = body.videoUrl ? String(body.videoUrl) : undefined
    const testimonialType = body.testimonialType === 'video' ? 'video' : 'text'

    // Create new user review submission
    const userReview = new UserReview({
      name,
      email,
      message,
      rating,
      image,
      videoUrl,
      testimonialType,
      status: 'pending'
    });

    await userReview.save();

    console.log('New review submitted', {
      id: userReview._id,
      name,
      email,
      testimonialType,
      rating
    });

    return NextResponse.json({
      ok: true,
      review: {
        id: userReview._id,
        name,
        email,
        message,
        rating,
        testimonialType,
        status: 'pending',
        submittedAt: userReview.submittedAt
      }
    });
  } catch (err) {
    console.error('Review API error', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
