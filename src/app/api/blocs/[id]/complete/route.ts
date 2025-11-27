import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { markBlocComplete, updateStreak } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('bloc_user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const blocId = params.id;

    // Mark bloc as complete
    await markBlocComplete(userId, blocId);

    // Update streak
    const streak = await updateStreak(userId);

    return NextResponse.json({
      message: 'Bloc marked as complete',
      streak,
    });
  } catch (error) {
    console.error('Mark complete error:', error);
    return NextResponse.json(
      { error: 'Failed to mark bloc complete' },
      { status: 500 }
    );
  }
}
