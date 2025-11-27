import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getTodayBlocs } from '@/lib/db';

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

        const blocs = await getTodayBlocs(userId);
        const is_first_day = blocs.length === 0;

        return NextResponse.json({
            blocs,
            is_first_day,
        });
    } catch (error) {
        console.error('Get today blocs error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blocs' },
            { status: 500 }
        );
    }
}
