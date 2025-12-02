'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/onboarding/ProgressBar';

export default function UsernamePage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [isChecking, setIsChecking] = useState(false);

    const handleContinue = async (skipUsername = false) => {
        if (!skipUsername && username.trim()) {
            setIsChecking(true);
            setError('');

            try {
                const response = await fetch('/api/user/set-username', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: username.trim() }),
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.error || 'Failed to set username');
                    setIsChecking(false);
                    return;
                }

                // Success - continue to next step
                router.push('/onboarding/bio');
            } catch (err) {
                setError('Network error. Please try again.');
                setIsChecking(false);
            }
        } else {
            // Skip - auto-generate username
            try {
                await fetch('/api/user/set-username', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: '' }), // Empty will trigger auto-generation
                });
            } catch (err) {
                console.error('Auto-generate username error:', err);
            }
            router.push('/onboarding/bio');
        }
    };

    const handleUsernameChange = (value: string) => {
        // Only allow alphanumeric, spaces, and basic punctuation
        const sanitized = value.replace(/[^a-zA-Z0-9 _-]/g, '');
        setUsername(sanitized);
        setError('');
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-purple-50/30 to-white px-6 py-12">
            <div className="w-full max-w-2xl space-y-8 animate-fade-in">
                <ProgressBar currentStep={1} totalSteps={6} />

                <div className="card p-8 md:p-12 space-y-6">
                    {/* Header */}
                    <div className="space-y-3">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 
                                      flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 text-center">
                            Choose Your Username
                        </h1>
                        <p className="text-lg text-slate-600 text-center">
                            Pick a unique username for your profile, or skip to get an auto-generated one
                        </p>
                    </div>

                    {/* Username Input */}
                    <div className="space-y-3">
                        <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => handleUsernameChange(e.target.value)}
                            placeholder="reader_extraordinaire"
                            maxLength={30}
                            className={`input ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {error && (
                            <p className="text-sm text-red-600 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </p>
                        )}
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">
                                {username.trim() ? 'Looking good!' : 'Skip to get "Reader OG #X"'}
                            </span>
                            <span className="text-slate-400">{username.length}/30</span>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                        <div className="flex gap-3">
                            <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-purple-900">
                                <p className="font-medium mb-1">No username? No problem!</p>
                                <p className="text-purple-700">
                                    Skip this step and we'll assign you a cool "Reader OG #" badge based on your join number.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4">
                        <button
                            onClick={() => handleContinue(true)}
                            className="text-slate-500 hover:text-slate-700 text-sm font-medium
                                     transition-colors duration-300"
                        >
                            Skip & Auto-generate →
                        </button>
                        <button
                            onClick={() => handleContinue(false)}
                            disabled={!username.trim() || isChecking}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                                     text-white font-semibold rounded-xl
                                     hover:shadow-lg hover:scale-105 transition-all
                                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isChecking ? 'Checking...' : 'Continue'}
                        </button>
                    </div>
                </div>

                {/* Helper text */}
                <p className="text-center text-sm text-slate-500">
                    Step 1 of 6 • Takes less than 2 minutes to complete
                </p>
            </div>
        </main>
    );
}
