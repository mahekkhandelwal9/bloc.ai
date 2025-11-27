import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getReadingHistory } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('bloc_user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const history = await getReadingHistory(userId);

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Get archive error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch archive' },
      { status: 500 }
    );
  }
}
