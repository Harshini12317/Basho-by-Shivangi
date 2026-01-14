import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Workshop from '@/models/workshop';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Session } from 'next-auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function requireAdminSession() {
  const session: Session | null = await getServerSession(authOptions);
  if (!session?.user?.email) return { ok: false, status: 401 };

  await connectDB();
  const dbUser = await User.findOne({ email: session.user.email }).lean();
  if (!dbUser || !dbUser.isAdmin) return { ok: false, status: 403 };

  return { ok: true };
}

export async function GET() {
  try {
    const auth = await requireAdminSession();
    if (!auth.ok) return NextResponse.json({ message: 'Forbidden' }, { status: auth.status });

    await connectDB();
    const workshops = await Workshop.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(workshops, { status: 200 });
  } catch (error) {
    console.error('Error fetching workshops:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminSession();
    if (!auth.ok) return NextResponse.json({ message: 'Forbidden' }, { status: auth.status });

    const body = await request.json();
    const {
      title,
      description,
      level,
      location,
      googleMapLink,
      price,
      whatYouWillLearn,
      includes,
      moreInfo,
      images
    } = body;

    if (!title || !description || !location || !googleMapLink || !price || !whatYouWillLearn || !includes || !moreInfo || !images || images.length === 0) {
      return NextResponse.json({ message: 'All fields are required including at least one image' }, { status: 400 });
    }

    await connectDB();

    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Upload images to Cloudinary
    const uploadedImages: string[] = [];
    for (const imageData of images) {
      try {
        const result = await cloudinary.uploader.upload(imageData, {
          folder: 'basho/workshops',
        });
        uploadedImages.push(result.secure_url);
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        return NextResponse.json({ message: 'Failed to upload images' }, { status: 500 });
      }
    }

    // Save to database
    const newWorkshop = await Workshop.create({
      title,
      slug,
      description,
      level: level || 'None',
      location,
      googleMapLink,
      price,
      whatYouWillLearn,
      includes,
      moreInfo,
      image: uploadedImages[0], // First image as main image
      images: uploadedImages,
    });

    return NextResponse.json(newWorkshop, { status: 201 });
  } catch (error) {
    console.error('Error creating workshop:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminSession();
    if (!auth.ok) return NextResponse.json({ message: 'Forbidden' }, { status: auth.status });

    const body = await request.json();
    const {
      id,
      title,
      description,
      level,
      location,
      googleMapLink,
      price,
      whatYouWillLearn,
      includes,
      moreInfo,
      images
    } = body;

    if (!id || !title || !description || !location || !googleMapLink || !price || !whatYouWillLearn || !includes || !moreInfo) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    await connectDB();

    const workshop = await Workshop.findById(id);
    if (!workshop) {
      return NextResponse.json({ message: 'Workshop not found' }, { status: 404 });
    }

    // Generate new slug if title changed
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    let uploadedImages = workshop.images;
    if (images && images.length > 0) {
      // Upload new images to Cloudinary
      uploadedImages = [];
      for (const imageData of images) {
        try {
          const result = await cloudinary.uploader.upload(imageData, {
            folder: 'basho/workshops',
          });
          uploadedImages.push(result.secure_url);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          return NextResponse.json({ message: 'Failed to upload images' }, { status: 500 });
        }
      }
    }

    // Update workshop
    const updatedWorkshop = await Workshop.findByIdAndUpdate(
      id,
      {
        title,
        slug,
        description,
        level: level || 'None',
        location,
        googleMapLink,
        price,
        whatYouWillLearn,
        includes,
        moreInfo,
        image: uploadedImages[0],
        images: uploadedImages,
      },
      { new: true }
    );

    return NextResponse.json(updatedWorkshop, { status: 200 });
  } catch (error) {
    console.error('Error updating workshop:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdminSession();
    if (!auth.ok) return NextResponse.json({ message: 'Forbidden' }, { status: auth.status });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }

    await connectDB();

    // Get the workshop to delete images from Cloudinary
    const workshop = await Workshop.findById(id);
    if (workshop) {
      // Delete images from Cloudinary
      for (const imageUrl of workshop.images) {
        try {
          const publicId = imageUrl.split('/').pop()?.split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`basho/workshops/${publicId}`);
          }
        } catch (deleteError) {
          console.error('Error deleting image from Cloudinary:', deleteError);
        }
      }
    }

    const deletedWorkshop = await Workshop.findByIdAndDelete(id);

    if (!deletedWorkshop) {
      return NextResponse.json({ message: 'Workshop not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting workshop:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}