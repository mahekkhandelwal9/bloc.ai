export interface User {
    id: string;
    email: string;
    created_at: string;
    last_login: string;
}

export interface UserPreferences {
    user_id: string;
    bio: string;
    topics: string[];
    reading_days: 'weekdays' | 'weekends' | 'daily';
    preferred_time: string;
    timezone: string;
    updated_at: string;
}

export interface Bloc {
    id: string;
    user_id: string;
    topic: string;
    title: string;
    content: string;
    scheduled_date: string;
    generated_at: string;
    continuity_reference?: string;
    status: 'pending' | 'generated' | 'failed';
}

export interface ReadingHistory {
    user_id: string;
    bloc_id: string;
    completed_at: string;
    reading_progress: number;
}

export interface Streak {
    user_id: string;
    current_streak: number;
    longest_streak: number;
    last_read_date: string;
}

export interface OTPCode {
    email: string;
    code: string;
    expires_at: string;
    created_at: string;
}
