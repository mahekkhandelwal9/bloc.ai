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
    const [showModal, setShowModal] = useState(false);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        // Check if user is logged in
        const checkAuth = () => {
            const cookies = document.cookie.split(';');
            const hasAuthCookie = cookies.some(cookie => cookie.trim().startsWith('bloc_user_id='));
            setIsLoggedIn(hasAuthCookie);
        };
        checkAuth();

        // Parallax scroll effect
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);

        // Scroll reveal animation
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);

        setTimeout(() => {
            const scrollElements = document.querySelectorAll('.scroll-reveal');
            scrollElements.forEach(el => observer.observe(el));
        }, 100);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
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
                setLoading(false);
            } else {
                setLoading(false);
                await sendOtp();
            }
        } catch (err) {
            setError('Failed to verify email');
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

    const openLogin = () => {
        setShowModal(true);
        setStep('email');
    };

    const closeModal = () => {
        setShowModal(false);
        setStep('initial');
        setError('');
    };

    // Login Modal Component
    const LoginModal = () => {
        if (!showModal) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
                onClick={closeModal}>
                <div className="glass-card max-w-md w-full p-8 animate-scale-in" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-white">
                            <span className="cyber-gradient-text">Welcome</span> Back
                        </h2>
                        <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {step === 'email' ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    autoFocus
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                                    disabled={loading}
                                />
                            </div>
                            {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</div>}
                            <button type="submit" disabled={loading} className="w-full btn-cyber">
                                {loading ? 'Checking...' : 'Continue →'}
                            </button>
                        </form>
                    ) : step === 'password' ? (
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoFocus
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                                    disabled={loading}
                                />
                                <button type="button" onClick={() => sendOtp()} className="text-xs text-purple-400 hover:text-purple-300 mt-2">
                                    Forgot password?
                                </button>
                            </div>
                            {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</div>}
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setStep('email')} className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all">
                                    Back
                                </button>
                                <button type="submit" disabled={loading} className="flex-1 btn-cyber">
                                    {loading ? 'Logging in...' : 'Login →'}
                                </button>
                            </div>
                        </form>
                    ) : null}
                </div>
            </div>
        );
    };

    return (
        <>
            <LoginModal />

            <main className="min-h-screen bg-slate-900 overflow-hidden">
                {/* Header */}
                <header className="fixed top-0 left-0 right-0 z-40 bg-slate-900/60 backdrop-blur-xl border-b border-white/5">
                    <div className="container-custom py-5 flex justify-between items-center">
                        <div className="text-2xl font-bold">
                            <span className="cyber-gradient-text">Bloc</span>
                            <span className="text-white">.ai</span>
                        </div>
                        {isLoggedIn ? (
                            <div className="flex items-center gap-4">
                                <Link href="/dashboard" className="px-6 py-2 bg-white/10 border border-white/20 rounded-full text-white hover:bg-white/20 transition-all">
                                    Dashboard
                                </Link>
                                <button onClick={handleLogout} className="px-6 py-2 text-slate-400 hover:text-white transition-colors">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button onClick={openLogin} className="px-6 py-2 bg-white/10 border border-white/20 rounded-full text-white hover:bg-white/20 transition-all">
                                Login
                            </button>
                        )}
                    </div>
                </header>

                {/* Hero Section - Full Viewport */}
                <section className="relative min-h-screen flex items-center justify-center blob-bg">
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            transform: `translateY(${scrollY * 0.5}px)`
                        }}
                    >
                        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-40 floating"></div>
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500 rounded-full blur-3xl opacity-40 floating-slow"></div>
                        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-30 floating" style={{ animationDelay: '1s' }}></div>
                    </div>

                    <div className="container-custom relative z-10 text-center">
                        <div className="max-w-5xl mx-auto space-y-10">
                            <div className="inline-block px-6 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium mb-6 animate-scale-in">
                                📚 The Future of Reading
                            </div>
                            <h1 className="font-bold leading-tight text-white animate-fade-in-up">
                                Read <span className="cyber-gradient-text text-glow">Smarter</span>,<br />
                                Not Harder
                            </h1>
                            <p className="text-2xl md:text-3xl text-slate-300 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                                10-minute AI-powered knowledge blocs.<br />
                                Personalized daily. Build your streak.
                            </p>

                            {isLoggedIn ? (
                                <Link href="/dashboard" className="btn-cyber inline-block animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                    Start Reading →
                                </Link>
                            ) : (
                                <button onClick={openLogin} className="btn-cyber animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                    Start Reading Free →
                                </button>
                            )}

                            <div className="flex flex-wrap items-center justify-center gap-10 pt-12 text-slate-400 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">⚡</span>
                                    <span className="text-lg">10 min reads</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">🤖</span>
                                    <span className="text-lg">AI-personalized</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">🔥</span>
                                    <span className="text-lg">Streak-based</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </section>

                {/* Why Reading - Centered Quote */}
                <section className="py-40 bg-slate-950 relative">
                    <div
                        className="container-custom text-center"
                        style={{
                            transform: `translateY(${scrollY * 0.1}px)`
                        }}
                    >
                        <div className="max-w-4xl mx-auto scroll-reveal">
                            <div className="text-8xl mb-10">💡</div>
                            <blockquote className="text-4xl md:text-5xl font-bold text-slate-200 mb-8 leading-tight">
                                "The more that you read, the more things you will know."
                            </blockquote>
                            <p className="text-xl text-purple-400">— Dr. Seuss</p>

                            <div className="mt-20 grid grid-cols-3 gap-12 max-w-2xl mx-auto">
                                <div className="scroll-reveal" style={{ animationDelay: '0.1s' }}>
                                    <div className="text-5xl font-bold cyber-gradient-text mb-2">500+</div>
                                    <div className="text-sm text-slate-400">Pages Warren Buffett reads daily</div>
                                </div>
                                <div className="scroll-reveal" style={{ animationDelay: '0.2s' }}>
                                    <div className="text-5xl font-bold cyber-gradient-text mb-2">50+</div>
                                    <div className="text-sm text-slate-400">Books Bill Gates reads yearly</div>
                                </div>
                                <div className="scroll-reveal" style={{ animationDelay: '0.3s' }}>
                                    <div className="text-5xl font-bold cyber-gradient-text mb-2">10</div>
                                    <div className="text-sm text-slate-400">Minutes with Bloc.ai</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works - Horizontal Flow */}
                <section className="py-40 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
                    <div className="container-custom">
                        <div className="text-center mb-24 scroll-reveal">
                            <h2 className="text-6xl md:text-7xl font-bold text-white mb-6">
                                How <span className="cyber-gradient-text text-glow">Bloc.ai</span> Works
                            </h2>
                            <p className="text-2xl text-slate-400">Three steps to smarter reading</p>
                        </div>

                        <div className="max-w-6xl mx-auto">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-16">
                                {/* Step 1 */}
                                <div className="flex-1 text-center scroll-reveal" style={{ animationDelay: '0.1s' }}>
                                    <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-5xl font-bold glow-purple">
                                        🎯
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-4">Choose Topics</h3>
                                    <p className="text-xl text-slate-400">Pick 3 topics you're curious about</p>
                                </div>

                                {/* Arrow */}
                                <div className="hidden md:block text-slate-600 text-4xl">→</div>

                                {/* Step 2 */}
                                <div className="flex-1 text-center scroll-reveal" style={{ animationDelay: '0.2s' }}>
                                    <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-pink-500 to-blue-500 rounded-full flex items-center justify-center text-white text-5xl font-bold glow-pink">
                                        🤖
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-4">AI Generates</h3>
                                    <p className="text-xl text-slate-400">Daily personalized 10-min blocs</p>
                                </div>

                                {/* Arrow */}
                                <div className="hidden md:block text-slate-600 text-4xl">→</div>

                                {/* Step 3 */}
                                <div className="flex-1 text-center scroll-reveal" style={{ animationDelay: '0.3s' }}>
                                    <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-5xl font-bold glow-blue">
                                        🔥
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-4">Build Streak</h3>
                                    <p className="text-xl text-slate-400">Track progress, stay consistent</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Background decoration */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-500/5 rounded-full blur-3xl"></div>
                </section>

                {/* Final CTA - Full Viewport */}
                <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 relative overflow-hidden">
                    <div className="container-custom text-center relative z-10">
                        <div className="max-w-4xl mx-auto space-y-12 scroll-reveal">
                            <h2 className="text-7xl md:text-8xl font-bold leading-tight text-white">
                                Your Future Self<br />
                                Will <span className="cyber-gradient-text text-glow">Thank You</span>
                            </h2>
                            <p className="text-3xl text-slate-300 leading-relaxed">
                                Start building the reading habit today.<br />
                                10 minutes is all it takes.
                            </p>

                            {isLoggedIn ? (
                                <Link href="/dashboard" className="btn-cyber inline-block text-xl px-12 py-6">
                                    Go to Dashboard →
                                </Link>
                            ) : (
                                <button onClick={openLogin} className="btn-cyber text-xl px-12 py-6">
                                    Start Now, It's Free →
                                </button>
                            )}

                            <p className="text-sm text-slate-500">No credit card • Free forever • Cancel anytime</p>
                        </div>
                    </div>

                    {/* Decorative blobs */}
                    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </section>

                {/* Footer */}
                <footer className="py-12 bg-slate-950 border-t border-white/5">
                    <div className="container-custom">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-2xl font-bold">
                                <span className="cyber-gradient-text">Bloc</span>
                                <span className="text-white">.ai</span>
                            </div>
                            <p className="text-sm text-slate-500">
                                © 2024 Bloc.ai • Building better readers
                            </p>
                            <div className="flex gap-6 text-sm text-slate-400">
                                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                                <a href="#" className="hover:text-white transition-colors">Terms</a>
                                <a href="#" className="hover:text-white transition-colors">Contact</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </>
    );
}
