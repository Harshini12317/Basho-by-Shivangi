import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Popup from '@/models/Popup';

/**
 * This endpoint migrates popups with empty pages arrays to default to 'homepage'
 * Run once to fix existing popups that don't have pages set
 */
export async function POST() {
  try {
    await connectDB();
    
    // Find all popups with empty pages array
    const result = await Popup.updateMany(
      { 
        $or: [
          { pages: { $exists: false } },
          { pages: [] }
        ]
      },
      { 
        $set: { pages: ['homepage'] }
      }
    );
    
    return NextResponse.json({
      message: 'Migration completed',
      modified: result.modifiedCount,
      details: `Updated ${result.modifiedCount} popups with empty or missing pages to ['homepage']`
    });
  } catch (error) {
    console.error('Error migrating popups:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    
    // Check for popups with empty pages
    const count = await Popup.countDocuments({
      $or: [
        { pages: { $exists: false } },
        { pages: [] }
      ]
    });
    
    return NextResponse.json({
      popupsNeedingMigration: count,
      message: count > 0 ? `Found ${count} popups that need migration. Send POST request to run migration.` : 'All popups are properly configured.'
    });
  } catch (error) {
    console.error('Error checking popups:', error);
    return NextResponse.json({ error: 'Check failed' }, { status: 500 });
  }
}
