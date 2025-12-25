import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Gallery from '@/models/Gallery';

export async function GET() {
  try {
    await connectDB();
    const gallery = await Gallery.find({}).sort({ order: 1, createdAt: -1 });
    return NextResponse.json(gallery);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const galleryItem = new Gallery(body);
    await galleryItem.save();
    return NextResponse.json(galleryItem, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create gallery item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { id, ...updateData } = await request.json();

    const galleryItem = await Gallery.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!galleryItem) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(galleryItem);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update gallery item' },
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
        { error: 'Gallery item ID required' },
        { status: 400 }
      );
    }

    const galleryItem = await Gallery.findByIdAndDelete(id);

    if (!galleryItem) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete gallery item' },
      { status: 500 }
    );
  }
}