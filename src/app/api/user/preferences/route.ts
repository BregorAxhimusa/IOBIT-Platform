import { NextRequest, NextResponse } from 'next/server';
import { getUserPreferences, updateUserPreferences } from '@/lib/database/queries';

/**
 * GET /api/user/preferences?address=0x...
 * Get user preferences
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const preferences = await getUserPreferences(address);

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

/**
 * PUT /api/user/preferences
 * Update user preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, ...preferences } = body;

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const updatedPreferences = await updateUserPreferences(address, preferences);

    return NextResponse.json({ preferences: updatedPreferences });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
