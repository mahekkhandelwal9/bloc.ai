import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database utility functions
export async function getUser(userId: string) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
}

export async function getUserPreferences(userId: string) {
    const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) throw error;
    return data;
}

export async function updateUserPreferences(userId: string, preferences: Partial<any>) {
    const { data, error } = await supabase
        .from('user_preferences')
        .update(preferences)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getTodayBlocs(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('blocs')
        .select('*')
        .eq('user_id', userId)
        .eq('scheduled_date', today)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
}

export async function getBloc(blocId: string) {
    const { data, error } = await supabase
        .from('blocs')
        .select('*')
        .eq('id', blocId)
        .single();

    if (error) throw error;
    return data;
}

export async function markBlocComplete(userId: string, blocId: string) {
    const { data, error } = await supabase
        .from('reading_history')
        .insert({
            user_id: userId,
            bloc_id: blocId,
            completed_at: new Date().toISOString(),
            reading_progress: 100,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateStreak(userId: string) {
    const { data: streak, error: streakError } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (streakError && streakError.code !== 'PGRST116') {
        throw streakError;
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (!streak) {
        // Create new streak
        const { data, error } = await supabase
            .from('streaks')
            .insert({
                user_id: userId,
                current_streak: 1,
                longest_streak: 1,
                last_read_date: today,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Update existing streak
    let newStreak = 1;
    if (streak.last_read_date === yesterday) {
        newStreak = streak.current_streak + 1;
    } else if (streak.last_read_date === today) {
        newStreak = streak.current_streak;
    }

    const { data, error } = await supabase
        .from('streaks')
        .update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, streak.longest_streak),
            last_read_date: today,
        })
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getReadingHistory(userId: string, limit = 30) {
    const { data, error } = await supabase
        .from('reading_history')
        .select('bloc_id, completed_at, blocs(id, topic, title, scheduled_date)')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}
