import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { generateBloc } from '@/lib/ai';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('bloc_user_id')?.value;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Check daily limit (max 3 bonus blocs)
        const today = new Date().toISOString().split('T')[0];
        const { count, error: countError } = await supabase
            .from('blocs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('scheduled_date', today)
            .eq('is_bonus', true);

        if (countError) {
            console.error('Error checking bonus limit:', countError);
            return NextResponse.json({ error: 'Failed to check limit' }, { status: 500 });
        }

        if (count !== null && count >= 3) {
            return NextResponse.json({
                error: 'Daily bonus limit reached',
                limit: 3,
                current: count
            }, { status: 429 });
        }

        // 2. Fetch user preferences
        const { data: preferences, error: prefError } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (prefError || !preferences) {
            return NextResponse.json({ error: 'Preferences not found' }, { status: 404 });
        }

        const { topics, bio } = preferences;

        if (!topics || topics.length === 0) {
            return NextResponse.json({ error: 'No topics selected' }, { status: 400 });
        }

        // 3. Pick a random topic
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        console.log('📌 Generating bonus bloc for topic:', randomTopic);

        // 4. Generate content
        try {
            console.log('🤖 Calling Gemini API...');
            const blocData = await generateBloc({
                topic: randomTopic,
                userBio: bio || `User interested in ${randomTopic}`,
                previousDayTopics: [],
                continuityReference: undefined,
            });
            console.log('✅ Gemini API success! Generated:', blocData.title);
        } catch (aiError: any) {
            console.error('❌ Gemini API failed:', aiError);
            console.error('Error details:', aiError.message);
            console.error('Stack:', aiError.stack);
            return NextResponse.json({
                error: `AI generation failed: ${aiError.message}`
            }, { status: 500 });
        }

        const blocData = await generateBloc({
            topic: randomTopic,
            userBio: bio || `User interested in ${randomTopic}`,
            previousDayTopics: [],
            continuityReference: undefined,
        });

        // 5. Save to database
        const { data: newBloc, error: insertError } = await supabase
            .from('blocs')
            .insert({
                user_id: userId,
                topic: randomTopic,
                title: blocData.title,
                content: blocData.content,
                next_day_idea: blocData.nextDayIdea,
                scheduled_date: today, // Using correct column name
                is_bonus: true,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error saving bonus bloc:', insertError);
            return NextResponse.json({ error: 'Failed to save bloc' }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Bonus bloc generated successfully',
            bloc: newBloc,
            remaining: 2 - (count || 0)
        });

    } catch (error: any) {
        console.error('Generate bonus error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
