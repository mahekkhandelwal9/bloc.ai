import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('bloc_user_id')?.value;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { username } = await request.json();

        // If username is provided, validate and use it
        if (username && username.trim().length > 0) {
            // Check if username is already taken
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('username', username.trim())
                .single();

            if (existingUser) {
                return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
            }

            // Update with provided username
            const { error } = await supabase
                .from('users')
                .update({ username: username.trim() })
                .eq('id', userId);

            if (error) throw error;

            return NextResponse.json({
                message: 'Username set successfully',
                username: username.trim()
            });
        }

        // If no username provided, generate "Reader OG #X"
        // Get total user count to generate unique number
        const { count, error: countError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        const userNumber = (count || 0) + 1;
        let generatedUsername = `Reader OG #${userNumber}`;

        // Ensure uniqueness (in case of race conditions)
        let attempt = 0;
        while (attempt < 10) {
            const { data: existing } = await supabase
                .from('users')
                .select('id')
                .eq('username', generatedUsername)
                .single();

            if (!existing) break;

            attempt++;
            generatedUsername = `Reader OG #${userNumber + attempt}`;
        }

        // Update with generated username
        const { error: updateError } = await supabase
            .from('users')
            .update({ username: generatedUsername })
            .eq('id', userId);

        if (updateError) throw updateError;

        return NextResponse.json({
            message: 'Username auto-generated successfully',
            username: generatedUsername
        });

    } catch (error) {
        console.error('Set username error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
