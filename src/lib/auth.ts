import { supabase } from './db';

export async function createSession(userId: string) {
    // In a production app, you'd use proper JWT or session tokens
    // For MVP, we'll use a simple cookie-based approach with Supabase auth

    const { data, error } = await supabase.auth.signInWithOtp({
        email: userId,
    });

    if (error) throw error;
    return data;
}

export async function getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

export async function destroySession() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Helper to check if user is authenticated
export async function requireAuth() {
    const session = await getSession();
    if (!session) {
        throw new Error('Unauthorized');
    }
    return session;
}

// Helper to check if user completed onboarding
export async function checkOnboardingStatus(userId: string) {
    const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') {
        throw error;
    }

    return !!data; // Returns true if preferences exist (onboarding completed)
}
