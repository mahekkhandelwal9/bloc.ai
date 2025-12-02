import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { generateBloc } from '@/lib/ai';

// Secret token for cron job authentication
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-token-change-me';

export async function GET(request: NextRequest) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stats = {
            usersProcessed: 0,
            blocsCreated: 0,
            errors: [] as string[],
        };

        // Get current time in IST
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istTime = new Date(now.getTime() + istOffset);
        const currentHour = istTime.getHours();
        const currentMinute = istTime.getMinutes();
        const currentDay = istTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const today = istTime.toISOString().split('T')[0];

        // Map day number to string
        const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDayStr = dayMap[currentDay];

        // Fetch all users with preferences
        const { data: allPreferences, error: prefError } = await supabase
            .from('user_preferences')
            .select('user_id, topics, bio, preferred_time, reading_days');

        if (prefError) {
            throw prefError;
        }

        if (!allPreferences || allPreferences.length === 0) {
            return NextResponse.json({
                message: 'No users with preferences found',
                stats
            });
        }

        // Process each user
        for (const pref of allPreferences) {
            try {
                const { user_id, topics, bio, preferred_time, reading_days } = pref;

                // Skip if no topics selected
                if (!topics || topics.length === 0) {
                    continue;
                }

                // Check if today is in reading days
                if (reading_days && !reading_days.includes(currentDayStr)) {
                    continue;
                }

                // Check if it's time to generate (within ±15 minute window)
                if (preferred_time) {
                    const [prefHour, prefMinute] = preferred_time.split(':').map(Number);
                    const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (prefHour * 60 + prefMinute));

                    if (timeDiff > 15) {
                        continue; // Not the right time for this user
                    }
                }

                // Check if blocs already exist for today
                const { data: existingBlocs } = await supabase
                    .from('blocs')
                    .select('id')
                    .eq('user_id', user_id)
                    .eq('scheduled_date', today);

                if (existingBlocs && existingBlocs.length > 0) {
                    continue; // Already generated for today
                }

                stats.usersProcessed++;

                // Generate blocs for each topic
                for (const topic of topics) {
                    try {
                        const blocData = await generateBloc({
                            topic,
                            userBio: bio || `User interested in ${topic}`,
                            previousDayTopics: [],
                            continuityReference: undefined,
                        });

                        const { error: insertError } = await supabase
                            .from('blocs')
                            .insert({
                                user_id,
                                topic,
                                title: blocData.title,
                                content: blocData.content,
                                next_day_idea: blocData.nextDayIdea,
                                scheduled_date: today,
                                created_at: new Date().toISOString(),
                            });

                        if (!insertError) {
                            stats.blocsCreated++;
                        } else {
                            stats.errors.push(`User ${user_id}, Topic ${topic}: ${insertError.message}`);
                        }
                    } catch (err: any) {
                        stats.errors.push(`User ${user_id}, Topic ${topic}: ${err.message}`);
                    }
                }
            } catch (err: any) {
                stats.errors.push(`User ${pref.user_id}: ${err.message}`);
            }
        }

        return NextResponse.json({
            message: 'Cron job completed',
            timestamp: istTime.toISOString(),
            stats
        });

    } catch (error: any) {
        console.error('Cron job error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            message: error.message
        }, { status: 500 });
    }
}
