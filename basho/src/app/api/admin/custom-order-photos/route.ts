import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CustomOrderPhoto from '@/models/CustomOrderPhoto';
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
    const photos = await CustomOrderPhoto.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(photos, { status: 200 });
  } catch (error) {
    console.error('Error fetching custom order photos:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminSession();
    if (!auth.ok) return NextResponse.json({ message: 'Forbidden' }, { status: auth.status });

    const body = await request.json();
    const { title, description, images } = body;

    if (!title || !description || !images || images.length === 0) {
      return NextResponse.json({ message: 'Title, description, and images are required' }, { status: 400 });
    }

    await connectDB();

    // Upload images to Cloudinary
    const uploadedImages: string[] = [];
    for (const imageData of images) {
      try {
        const result = await cloudinary.uploader.upload(imageData, {
          folder: 'basho/custom-orders',
        });
        uploadedImages.push(result.secure_url);
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        return NextResponse.json({ message: 'Failed to upload images' }, { status: 500 });
      }
    }

    // Save to database
    const newPhoto = await CustomOrderPhoto.create({
      title,
      description,
      images: uploadedImages,
    });

    return NextResponse.json(newPhoto, { status: 201 });
  } catch (error) {
    console.error('Error creating custom order photo:', error);
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

    // Get the photo to delete images from Cloudinary
    const photo = await CustomOrderPhoto.findById(id);
    if (photo) {
      // Delete images from Cloudinary
      for (const imageUrl of photo.images) {
        try {
          const publicId = imageUrl.split('/').pop()?.split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`basho/custom-orders/${publicId}`);
          }
        } catch (deleteError) {
          console.error('Error deleting image from Cloudinary:', deleteError);
        }
      }
    }

    const deletedPhoto = await CustomOrderPhoto.findByIdAndDelete(id);

    if (!deletedPhoto) {
      return NextResponse.json({ message: 'Custom order photo not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting custom order photo:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}