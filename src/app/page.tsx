'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Home() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState<'initial' | 'email' | 'password'>('initial');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if user is logged in by checking for cookie
        const checkAuth = () => {
            const cookies = document.cookie.split(';');
            const hasAuthCookie = cookies.some(cookie => cookie.trim().startsWith('bloc_user_id='));
            setIsLoggedIn(hasAuthCookie);
        };
        checkAuth();
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        document.cookie = 'bloc_user_id=; Max-Age=0; path=/';
        setIsLoggedIn(false);
        window.location.href = '/';
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (data.exists && data.hasPassword) {
                setStep('password');
            } else {
                // New user or legacy user -> Send OTP
                await sendOtp();
            }
        } catch (err) {
            setError('Failed to verify email');
        } finally {
            setLoading(false);
        }
    };

    const sendOtp = async () => {
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) throw new Error('Failed to send OTP');

            // Redirect to verify page
            router.push(`/verify?email=${encodeURIComponent(email)}`);
        } catch (err) {
            setError('Failed to send verification code');
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Login failed');

            if (data.needsOnboarding) {
                router.push('/onboarding/bio');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen relative flex flex-col bg-gradient-to-br from-white via-purple-50/30 to-white">
            {/* Header with Logout */}
            <header className="absolute top-0 left-0 right-0 z-10 p-6">
                <div className="container-custom flex justify-between items-center">
                    <div className="text-2xl font-bold">
                        <span className="text-gradient">Bloc</span>
                        <span className="text-slate-900">.ai</span>
                    </div>

                    {isLoggedIn && (
                        <button
                            onClick={handleLogout}
                            className="group relative px-6 py-2.5 rounded-xl font-medium 
                                     bg-white border-2 border-slate-200 text-slate-700
                                     hover:border-red-300 hover:bg-red-50 hover:text-red-600
                                     transition-all duration-200 ease-out
                                     hover:shadow-lg hover:-translate-y-0.5
                                     active:translate-y-0"
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </span>
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center py-12 px-4">
                <div className="container-custom text-center max-w-4xl space-y-8 animate-fade-in">
                    {/* Logo/Brand */}
                    <div className="space-y-4">
                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-4
                                     transform transition-all duration-500 hover:scale-105">
                            <span className="text-gradient bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 
                                           bg-clip-text text-transparent
                                           hover:from-purple-500 hover:via-pink-400 hover:to-blue-400
                                           transition-all duration-500">
                                Bloc
                            </span>
                            <span className="text-slate-900">.ai</span>
                        </h1>

                        {/* Tagline */}
                        <p className="text-2xl md:text-3xl text-slate-600 font-medium
                                    transform transition-all duration-300 hover:text-slate-800">
                            Small blocs to a better you, daily!
                        </p>
                    </div>

                    {/* CTA / Login Form */}
                    <div className="pt-8 min-h-[120px] flex justify-center items-center">
                        {isLoggedIn ? (
                            <>
                                <Link href="/dashboard"
                                    className="btn-primary inline-block
                                             shadow-2xl hover:shadow-purple-500/50
                                             transform hover:scale-105 active:scale-95
                                             transition-all duration-200">
                                    Let's read →
                                </Link>
                            </>
                        ) : step === 'initial' ? (
                            <button
                                onClick={() => setStep('email')}
                                className="group relative inline-block"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 
                                              rounded-2xl blur-lg opacity-50 group-hover:opacity-75 
                                              transition-all duration-300 animate-pulse"></div>
                                <div className="relative px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 
                                              text-white text-lg font-semibold rounded-2xl
                                              shadow-xl hover:shadow-2xl
                                              transform transition-all duration-300
                                              hover:scale-105 hover:-translate-y-1
                                              active:scale-95 active:translate-y-0
                                              border-2 border-white/20">
                                    <span className="flex items-center gap-3">
                                        Lets read
                                        <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                </div>
                            </button>
                        ) : (
                            <div className="w-full max-w-md bg-white/50 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/50 animate-fade-in">
                                {step === 'email' ? (
                                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                                        <div className="space-y-2 text-left">
                                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 ml-1">
                                                Email address
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                required
                                                autoFocus
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 
                                                         focus:border-purple-500 focus:ring-2 focus:ring-purple-200 
                                                         outline-none transition-all bg-white/80"
                                                disabled={loading}
                                            />
                                        </div>
                                        {error && <div className="text-red-600 text-sm text-left ml-1">{error}</div>}
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setStep('initial')}
                                                className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                                                         text-white font-semibold rounded-xl shadow-lg
                                                         hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
                                                         transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {loading ? 'Checking...' : 'Continue'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                        <div className="space-y-2 text-left">
                                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 ml-1">
                                                Password
                                            </label>
                                            <input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                autoFocus
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 
                                                         focus:border-purple-500 focus:ring-2 focus:ring-purple-200 
                                                         outline-none transition-all bg-white/80"
                                                disabled={loading}
                                            />
                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => sendOtp()}
                                                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                                                >
                                                    Forgot password?
                                                </button>
                                            </div>
                                        </div>
                                        {error && <div className="text-red-600 text-sm text-left ml-1">{error}</div>}
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setStep('email')}
                                                className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                                                         text-white font-semibold rounded-xl shadow-lg
                                                         hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
                                                         transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {loading ? 'Logging in...' : 'Login'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Visual indicator with animation */}
                    <div className="pt-12 flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 
                                      opacity-80 animate-bounce
                                      hover:opacity-100 hover:scale-110 hover:rotate-12
                                      transition-all duration-300 cursor-pointer"></div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 
                                      opacity-90 animate-bounce animation-delay-100
                                      hover:opacity-100 hover:scale-110 hover:rotate-12
                                      transition-all duration-300 cursor-pointer"></div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 
                                      animate-bounce animation-delay-200
                                      hover:opacity-100 hover:scale-110 hover:rotate-12
                                      transition-all duration-300 cursor-pointer"></div>
                    </div>
                    <p className="text-sm text-slate-500 mt-4 font-medium
                                transform transition-all duration-300 hover:text-slate-700 hover:scale-105">
                        ✨ Your learning journey starts here
                    </p>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-6 text-center text-sm text-slate-400">
                <p className="hover:text-slate-600 transition-colors duration-300">
                    © 2024 Bloc.ai - Transforming learning, one bloc at a time
                </p>
            </footer>
        </main>
    );
}
