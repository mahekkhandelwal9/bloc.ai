import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { generateBloc } from '@/lib/ai';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('bloc_user_id')?.value;

        console.log('=== GENERATE TODAY DEBUG ===');
        console.log('All cookies:', cookieStore.getAll());
        console.log('bloc_user_id cookie:', userId);

        if (!userId) {
            return NextResponse.json({
                error: 'Unauthorized',
                hint: 'Please log in again'
            }, { status: 401 });
        }

        // Fetch user preferences
        const { data: preferences, error: prefError } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        console.log('User ID:', userId);
        console.log('Preferences data:', preferences);
        console.log('Preferences error:', prefError);

        if (prefError || !preferences) {
            console.error('Failed to fetch preferences:', prefError);
            return NextResponse.json({
                error: 'User preferences not found',
                details: prefError?.message,
                userId: userId
            }, { status: 404 });
        }

        const { topics, bio } = preferences;

        console.log('Selected topics:', topics);

        if (!topics || topics.length === 0) {
            return NextResponse.json({
                error: 'No topics selected',
                hint: 'Please select topics in Settings first'
            }, { status: 400 });
        }

        // Check if blocs already exist for today
        const today = new Date().toISOString().split('T')[0];
        const { data: existingBlocs } = await supabase
            .from('blocs')
            .select('id')
            .eq('user_id', userId)
            .gte('delivery_date', today)
            .lt('delivery_date', new Date(Date.now() + 86400000).toISOString().split('T')[0]);

        if (existingBlocs && existingBlocs.length > 0) {
            return NextResponse.json({
                error: 'Blocs already generated for today',
                blocCount: existingBlocs.length
            }, { status: 409 });
        }

        // Generate blocs for each topic
        const generatedBlocs = [];

        for (const topic of topics) {
            try {
                console.log(`Generating bloc for topic: ${topic}`);

                const blocData = await generateBloc({
                    topic,
                    userBio: bio || `User interested in ${topic}`,
                    previousDayTopics: [],
                    continuityReference: undefined,
                });

                console.log(`Successfully generated bloc for topic: ${topic}`);

                // Save to database
                const { data: newBloc, error: insertError } = await supabase
                    .from('blocs')
                    .insert({
                        user_id: userId,
                        topic,
                        title: blocData.title,
                        content: blocData.content,
                        next_day_idea: blocData.nextDayIdea,
                        delivery_date: today,
                        created_at: new Date().toISOString(),
                    })
                    .select()
                    .single();

                if (insertError) {
                    console.error(`Error inserting bloc for topic ${topic}:`, insertError);
                } else {
                    console.log(`Successfully saved bloc to database for topic: ${topic}`);
                    generatedBlocs.push(newBloc);
                }
            } catch (err: any) {
                console.error(`=== ERROR generating bloc for topic ${topic} ===`);
                console.error('Error message:', err.message);
                console.error('Error stack:', err.stack);
                console.error('Full error:', err);
            }
        }

        if (generatedBlocs.length === 0) {
            return NextResponse.json({ error: 'Failed to generate any blocs' }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Blocs generated successfully',
            blocs: generatedBlocs,
            count: generatedBlocs.length
        });

    } catch (error) {
        console.error('Generate today error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
