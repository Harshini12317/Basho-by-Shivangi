import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import StaticData from '@/models/StaticData';

export async function GET() {
  try {
    await connectDB();

    let staticData = await StaticData.findOne();

    // If no static data exists, create default
    if (!staticData) {
      staticData = new StaticData({
        studioLocation: {
          address: '',
          city: '',
          state: '',
          zip: '',
          country: '',
          googleMapsLink: '',
        },
        contactInfo: {
          phone: '',
          email: '',
          socialMedia: {
            instagram: '',
            facebook: '',
            twitter: '',
          },
        },
        faqs: [],
        experiences: [],
        hsnCode: '',
      });
      // Save without validation initially
      await staticData.save({ validateBeforeSave: false });
    }

    return NextResponse.json(staticData);
  } catch (error) {
    console.error('GET /api/admin/static-data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch static data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Use findOneAndUpdate for atomic update
    const updatedData = await StaticData.findOneAndUpdate(
      {}, // Find the first document (assuming there's only one)
      { $set: body }, // Only update the provided fields
      {
        new: true, // Return the updated document
        upsert: true, // Create if doesn't exist
        runValidators: false // Skip validation for speed
      }
    );

    return NextResponse.json(updatedData);
  } catch (error) {
    console.error('PUT /api/admin/static-data error:', error);
    return NextResponse.json(
      { error: 'Failed to update static data' },
      { status: 500 }
    );
  }
}