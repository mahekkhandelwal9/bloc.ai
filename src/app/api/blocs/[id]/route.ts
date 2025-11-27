import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getBloc } from '@/lib/db';

export async function GET(
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
    const bloc = await getBloc(blocId);

    if (!bloc || bloc.user_id !== userId) {
      return NextResponse.json(
        { error: 'Bloc not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(bloc);
  } catch (error) {
    console.error('Get bloc error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bloc' },
      { status: 500 }
    );
  }
}
