import { NextRequest, NextResponse } from 'next/server';

// Simple admin authentication - in production, use proper JWT or session management
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true, message: 'Authenticated successfully' });

      // Set a simple cookie for authentication
      response.cookies.set('admin-auth', 'true', {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24 hours
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.set('admin-auth', '', { maxAge: 0 });
  return response;
}