import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        // Get user ID from cookie
        const cookieStore = await cookies();
        const userId = cookieStore.get('bloc_user_id')?.value;

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { bio, topics, reading_days, preferred_time, timezone } = await request.json();

        // Validate required fields
        if (!topics || topics.length === 0) {
            return NextResponse.json(
                { error: 'At least one topic is required' },
                { status: 400 }
            );
        }

        if (!reading_days || !preferred_time) {
            return NextResponse.json(
                { error: 'Reading schedule and time are required' },
                { status: 400 }
            );
        }

        // Check if preferences already exist
        const { data: existing } = await supabase
            .from('user_preferences')
            .select('user_id')
            .eq('user_id', userId)
            .single();

        let result;

        if (existing) {
            // Update existing preferences
            const { data, error } = await supabase
                .from('user_preferences')
                .update({
                    bio,
                    topics,
                    reading_days,
                    preferred_time,
                    timezone,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            // Create new preferences
            const { data, error } = await supabase
                .from('user_preferences')
                .insert({
                    user_id: userId,
                    bio,
                    topics,
                    reading_days,
                    preferred_time,
                    timezone,
                })
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        return NextResponse.json(
            { message: 'Preferences saved successfully', data: result },
            { status: 200 }
        );
    } catch (error) {
        console.error('Save preferences error:', error);
        return NextResponse.json(
            { error: 'Failed to save preferences' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // Get user ID from cookie
        const cookieStore = await cookies();
        const userId = cookieStore.get('bloc_user_id')?.value;

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error('Get preferences error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch preferences' },
            { status: 500 }
        );
    }
}
