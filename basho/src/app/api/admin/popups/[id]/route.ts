import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Popup from '@/models/Popup';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    await connectDB();
    
    // Sanitize dates
    if (body.startAt === '') delete body.startAt; // Or set to null: body.startAt = null;
    if (body.endAt === '') delete body.endAt;

    // If unsetting dates is needed (e.g. user cleared the date), we might need $unset or setting to null
    // Mongoose handles null for Date as unset if schema allows, or valid null.
    // If we want to remove the field, we can use $unset.
    // But simplistic approach:
    if (body.startAt === null) body.startAt = undefined; // Mongoose might not like null for Date unless configured.
    // Actually, let's just stick to deleting empty strings.
    
    const popup = await Popup.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!popup) {
      return NextResponse.json({ error: 'Popup not found' }, { status: 404 });
    }
    
    return NextResponse.json(popup);
  } catch (error) {
    console.error('Error updating popup:', error);
    return NextResponse.json({ error: 'Failed to update popup' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const popup = await Popup.findByIdAndDelete(params.id);
    
    if (!popup) {
      return NextResponse.json({ error: 'Popup not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Popup deleted successfully' });
  } catch (error) {
    console.error('Error deleting popup:', error);
    return NextResponse.json({ error: 'Failed to delete popup' }, { status: 500 });
  }
}
