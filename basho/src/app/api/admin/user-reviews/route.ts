import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import UserReview from '@/models/UserReview';
import Testimonial from '@/models/Testimonial';

export async function GET() {
  try {
    await connectDB();
    const userReviews = await UserReview.find({}).sort({ submittedAt: -1 });
    return NextResponse.json(userReviews);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user reviews' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { id, action, testimonialType, videoUrl, reviewedBy } = await request.json();

    if (action === 'approve') {
      // Find the user review
      const userReview = await UserReview.findById(id);
      if (!userReview) {
        return NextResponse.json(
          { error: 'User review not found' },
          { status: 404 }
        );
      }

      // Create a new testimonial from the approved review
      const testimonial = new Testimonial({
        name: userReview.name,
        email: userReview.email,
        message: userReview.message,
        rating: userReview.rating,
        image: userReview.image,
        videoUrl: testimonialType === 'video' ? videoUrl : undefined,
        testimonialType: testimonialType || userReview.testimonialType,
        isPublished: true,
        featured: false,
      });

      await testimonial.save();

      // Update the user review status
      await UserReview.findByIdAndUpdate(id, {
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy,
        testimonialType: testimonialType || userReview.testimonialType,
        videoUrl: testimonialType === 'video' ? videoUrl : userReview.videoUrl,
      });

      return NextResponse.json({
        message: 'Review approved and testimonial created',
        testimonial
      });
    }

    if (action === 'reject') {
      await UserReview.findByIdAndUpdate(id, {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy,
      });

      return NextResponse.json({ message: 'Review rejected' });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user review' },
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
        { error: 'User review ID required' },
        { status: 400 }
      );
    }

    const userReview = await UserReview.findByIdAndDelete(id);

    if (!userReview) {
      return NextResponse.json(
        { error: 'User review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'User review deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete user review' },
      { status: 500 }
    );
  }
}