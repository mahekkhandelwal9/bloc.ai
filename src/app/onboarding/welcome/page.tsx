'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/onboarding/ProgressBar';

export default function WelcomePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleGetStarted = async () => {
        setLoading(true);

        try {
            // Get all onboarding data from sessionStorage
            const bio = sessionStorage.getItem('onboarding_bio') || '';
            const topics = JSON.parse(sessionStorage.getItem('onboarding_topics') || '[]');
            const schedule = sessionStorage.getItem('onboarding_schedule') || 'weekdays';
            const time = sessionStorage.getItem('onboarding_time') || '09:00';

            // Get timezone
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            // Save preferences
            const response = await fetch('/api/user/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bio,
                    topics,
                    reading_days: schedule,
                    preferred_time: time,
                    timezone,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save preferences');
            }

            // Clear session storage
            sessionStorage.removeItem('onboarding_bio');
            sessionStorage.removeItem('onboarding_topics');
            sessionStorage.removeItem('onboarding_schedule');
            sessionStorage.removeItem('onboarding_time');

            // Navigate to dashboard
            router.push('/dashboard');
        } catch (error) {
            console.error('Error saving preferences:', error);
            alert('Failed to save preferences. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-purple-50/30 to-white px-6 py-12">
            <div className="w-full max-w-2xl space-y-8 animate-fade-in">
                <ProgressBar currentStep={5} totalSteps={5} />

                <div className="card p-8 md:p-12 space-y-8 text-center">
                    {/* Checkmark Animation */}
                    <div className="flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center animate-slide-up">
                            <svg
                                className="w-12 h-12 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="space-y-3">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                            You're all set! 🎉
                        </h1>
                        <p className="text-lg text-slate-600 max-w-xl mx-auto">
                            Welcome to Bloc.ai. Here's how it works:
                        </p>
                    </div>

                    {/* How It Works */}
                    <div className="grid md:grid-cols-3 gap-6 text-left">
                        <div className="space-y-2">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl mb-3">
                                📖
                            </div>
                            <h3 className="font-semibold text-slate-900">Daily Bloc</h3>
                            <p className="text-sm text-slate-600">
                                One 10-minute personalized learning piece, ready at your chosen time
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl mb-3">
                                🧠
                            </div>
                            <h3 className="font-semibold text-slate-900">AI-Curated</h3>
                            <p className="text-sm text-slate-600">
                                Tailored to your interests and background, with continuity from day to day
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl mb-3">
                                🔥
                            </div>
                            <h3 className="font-semibold text-slate-900">Build Streaks</h3>
                            <p className="text-sm text-slate-600">
                                Watch your learning blocks stack up as you build a lasting habit
                            </p>
                        </div>
                    </div>

                    {/* Quote */}
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                        <p className="text-slate-700 italic text-lg font-medium">
                            "The secret to getting ahead is getting started."
                        </p>
                        <p className="text-slate-500 text-sm mt-2">— Mark Twain</p>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={handleGetStarted}
                        disabled={loading}
                        className="btn-primary w-full md:w-auto md:px-12 text-lg disabled:opacity-50"
                    >
                        {loading ? 'Setting up your dashboard...' : 'Go to Dashboard'}
                    </button>
                </div>

                {/* Visual Blocks */}
                <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-accent-400 animate-slide-up opacity-80" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 animate-slide-up opacity-90" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 animate-slide-up" style={{ animationDelay: '0.3s' }}></div>
                </div>
            </div>
        </main>
    );
}
