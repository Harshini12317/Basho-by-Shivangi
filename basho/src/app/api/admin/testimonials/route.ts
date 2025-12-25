import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';

export async function GET() {
  try {
    await connectDB();
    const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });
    return NextResponse.json(testimonials);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const testimonial = new Testimonial(body);
    await testimonial.save();
    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create testimonial' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { id, ...updateData } = await request.json();

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(testimonial);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update testimonial' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Testimonial ID required' },
        { status: 400 }
      );
    }

    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}