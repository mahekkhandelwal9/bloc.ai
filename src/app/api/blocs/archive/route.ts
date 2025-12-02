import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('bloc_user_id')?.value;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: blocs, error } = await supabase
            .from('blocs')
            .select('*')
            .eq('user_id', userId)
            .eq('is_bonus', false) // Exclude bonus blocs
            .lt('scheduled_date', new Date().toISOString().split('T')[0])
            .order('scheduled_date', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json({ blocs });
    } catch (error) {
        console.error('Error fetching archive:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
