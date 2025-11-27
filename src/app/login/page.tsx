'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send OTP');
            }

            // Navigate to verification page
            router.push(`/verify?email=${encodeURIComponent(email)}`);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-purple-50/30 to-white px-6">
            <div className="w-full max-w-md space-y-8 animate-fade-in">
                {/* Logo */}
                <div className="text-center">
                    <h1 className="text-5xl font-bold mb-2">
                        <span className="text-gradient">Bloc</span>
                        <span className="text-slate-900">.ai</span>
                    </h1>
                    <p className="text-slate-600 text-lg mt-4">
                        Build a smarter, stronger mind
                    </p>
                    <p className="text-slate-500">Block by block</p>
                </div>

                {/* Login Card */}
                <div className="card p-8 space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-slate-900">
                            Welcome back
                        </h2>
                        <p className="text-slate-600">
                            Enter your email to receive a one-time code
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="input"
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Sending code...
                                </span>
                            ) : (
                                'Continue with Email'
                            )}
                        </button>
                    </form>

                    <div className="pt-4 border-t border-slate-200">
                        <p className="text-xs text-slate-500 text-center">
                            We'll send you a 6-digit code to verify your email.
                            <br />
                            No password required.
                        </p>
                    </div>
                </div>

                {/* Visual indicator */}
                <div className="flex items-center justify-center gap-2 pt-4">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-400 to-accent-400 opacity-80"></div>
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 opacity-90"></div>
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600"></div>
                </div>
            </div>
        </main>
    );
}
