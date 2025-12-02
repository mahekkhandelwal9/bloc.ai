'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/set-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to set password');
            }

            // Check if we need onboarding
            // We can check sessionStorage or just default to onboarding if it's a new flow
            // But verify-otp usually handles the redirect logic. 
            // Here we assume if they are setting password, they might be new or legacy.
            // Let's redirect to onboarding to be safe, or check status.
            // Actually, let's just go to dashboard, if they need onboarding the dashboard/middleware handles it?
            // No, we don't have middleware for that yet.
            // Let's redirect to /onboarding/bio as a safe bet for new users, 
            // or /dashboard if they have data. 
            // Ideally we should have passed "needsOnboarding" param here.

            // For now, let's go to /dashboard. If it's empty, it's fine.
            router.push('/onboarding/bio');
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-md space-y-8 animate-fade-in">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900">Set your password</h1>
                    <p className="text-slate-600 mt-2">
                        Secure your account with a password for easier login next time.
                    </p>
                </div>

                <div className="card p-8 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input"
                                required
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input"
                                required
                                minLength={6}
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? 'Saving...' : 'Set Password & Continue'}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
