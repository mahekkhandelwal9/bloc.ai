import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
    try {
        // Fetch all users (limited data for privacy)
        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, password_hash, created_at')
            .limit(10);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Fetch all preferences
        const { data: prefs, error: prefError } = await supabase
            .from('user_preferences')
            .select('user_id, selected_topics')
            .limit(10);

        return NextResponse.json({
            users: users?.map(u => ({
                id: u.id,
                email: u.email,
                hasPassword: !!u.password_hash,
                createdAt: u.created_at
            })),
            preferences: prefs,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
