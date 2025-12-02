import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('id, password_hash')
            .eq('email', email)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        if (!user) {
            return NextResponse.json({ exists: false, hasPassword: false });
        }

        return NextResponse.json({
            exists: true,
            hasPassword: !!user.password_hash
        });

    } catch (error) {
        console.error('Check email error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
