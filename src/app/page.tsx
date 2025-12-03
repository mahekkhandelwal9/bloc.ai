'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState<'initial' | 'email' | 'password'>('initial');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Check if user is logged in
        const checkAuth = () => {
            const cookies = document.cookie.split(';');
            const hasAuthCookie = cookies.some(cookie => cookie.trim().startsWith('bloc_user_id='));
            setIsLoggedIn(hasAuthCookie);
        };
        checkAuth();

        // Scroll reveal animation
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);

        const scrollElements = document.querySelectorAll('.scroll-reveal');
        scrollElements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
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

            <main className="min-h-screen bg-slate-900">
                {/* Header */}
                <header className="fixed top-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
                    <div className="container-custom py-4 flex justify-between items-center">
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

                {/* Hero Section */}
                <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden blob-bg">
                    <div className="container-custom relative z-10">
                        <div className="max-w-5xl mx-auto text-center space-y-8">
                            <div className="inline-block px-6 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium mb-4 animate-scale-in">
                                📚 The Future of Reading is Here
                            </div>
                            <h1 className="font-bold leading-tight text-white animate-fade-in-up">
                                Read <span className="cyber-gradient-text text-glow">Smarter</span>,<br />
                                Not Harder
                            </h1>
                            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed" style={{ animationDelay: '0.1s' }}>
                                AI-powered 10-minute knowledge blocs, personalized daily. <br className="hidden md:block" />
                                Build your reading streak, expand your mind, level up.
                            </p>

                            {isLoggedIn ? (
                                <Link href="/dashboard" className="btn-cyber inline-block" style={{ animationDelay: '0.2s' }}>
                                    Let's Read →
                                </Link>
                            ) : (
                                <button onClick={openLogin} className="btn-cyber animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                    Start Reading Free →
                                </button>
                            )}

                            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-slate-400">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">⚡</span>
                                    <span>10 min reads</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">🤖</span>
                                    <span>AI-personalized</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">🔥</span>
                                    <span>Streak-based</span>
                                </div>
                            </div>
                        </div>

                        {/* Floating blobs */}
                        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20 floating"></div>
                        <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-500 rounded-full blur-3xl opacity-20 floating-slow"></div>
                        <div className="absolute top-40 right-1/4 w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-30 floating" style={{ animationDelay: '1s' }}></div>
                    </div>
                </section>

                {/* Why Reading Section */}
                <section className="py-24 md:py-32 bg-slate-950">
                    <div className="container-custom">
                        <div className="text-center mb-16 scroll-reveal">
                            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                                <span className="cyber-gradient-text">Reading</span> is Your Superpower
                            </h2>
                            <p className="text-xl text-slate-400">The world's most successful people are readers. Join them.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            <div className="neon-card scroll-reveal" style={{ animationDelay: '0.1s' }}>
                                <div className="text-5xl mb-6">🧠</div>
                                <blockquote className="text-lg italic text-slate-300 mb-4 leading-relaxed">
                                    "The more that you read, the more things you will know. The more that you learn, the more places you'll go."
                                </blockquote>
                                <p className="text-sm font-bold text-purple-400">— Dr. Seuss</p>
                            </div>

                            <div className="neon-card scroll-reveal" style={{ animationDelay: '0.2s' }}>
                                <div className="text-5xl mb-6">💡</div>
                                <blockquote className="text-lg italic text-slate-300 mb-4 leading-relaxed">
                                    "Reading fuels a sense of curiosity about the world, which I think helped drive me forward."
                                </blockquote>
                                <p className="text-sm font-bold text-purple-400">— Bill Gates</p>
                            </div>

                            <div className="neon-card scroll-reveal" style={{ animationDelay: '0.3s' }}>
                                <div className="text-5xl mb-6">🚀</div>
                                <blockquote className="text-lg italic text-slate-300 mb-4 leading-relaxed">
                                    "I was raised by books. Books, and then my parents."
                                </blockquote>
                                <p className="text-sm font-bold text-purple-400">— Elon Musk</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* The Problem Section */}
                <section className="section-dark">
                    <div className="container-custom">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-16 scroll-reveal">
                                <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                                    But Let's Be <span className="cyber-gradient-text text-glow">Real</span>...
                                </h2>
                                <p className="text-xl text-slate-400">Traditional reading apps fail you</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 scroll-reveal" style={{ animationDelay: '0.1s' }}>
                                    <div className="text-6xl mb-6">📚</div>
                                    <h3 className="text-2xl font-bold mb-4 text-white">Too Many Choices</h3>
                                    <p className="text-slate-400 leading-relaxed">Endless book lists. Analysis paralysis. You never actually start reading.</p>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 scroll-reveal" style={{ animationDelay: '0.2s' }}>
                                    <div className="text-6xl mb-6">⏰</div>
                                    <h3 className="text-2xl font-bold mb-4 text-white">No Time</h3>
                                    <p className="text-slate-400 leading-relaxed">Full books feel overwhelming. 300 pages? Who has time for that?</p>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 scroll-reveal" style={{ animationDelay: '0.3s' }}>
                                    <div className="text-6xl mb-6">💤</div>
                                    <h3 className="text-2xl font-bold mb-4 text-white">Lose Interest</h3>
                                    <p className="text-slate-400 leading-relaxed">Start strong, quit halfway. No accountability. No consistency system.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-24 md:py-32 bg-slate-950 relative overflow-hidden">
                    <div className="container-custom relative z-10">
                        <div className="text-center mb-20 scroll-reveal">
                            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                                Meet <span className="cyber-gradient-text text-glow">Bloc.ai</span>
                            </h2>
                            <p className="text-xl text-slate-400">Your personal reading coach, powered by AI</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
                            <div className="glass-card text-center space-y-6 hover:shadow-2xl transition-all duration-500 scroll-reveal hover:scale-105" style={{ animationDelay: '0.1s' }}>
                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-white text-3xl font-bold glow-purple">
                                    1
                                </div>
                                <h3 className="text-3xl font-bold text-white">Choose Your Vibe</h3>
                                <p className="text-slate-400 leading-relaxed">Pick 3 topics you're curious about. AI, Psychology, Business—whatever sparks your interest.</p>
                                <div className="text-5xl">🎯</div>
                            </div>

                            <div className="glass-card text-center space-y-6 hover:shadow-2xl transition-all duration-500 scroll-reveal hover:scale-105" style={{ animationDelay: '0.2s' }}>
                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-500 to-blue-500 rounded-3xl flex items-center justify-center text-white text-3xl font-bold glow-pink">
                                    2
                                </div>
                                <h3 className="text-3xl font-bold text-white">AI Delivers Daily</h3>
                                <p className="text-slate-400 leading-relaxed">Every day, get a personalized 10-minute 'Bloc' tailored to your interests and reading level.</p>
                                <div className="text-5xl">🤖</div>
                            </div>

                            <div className="glass-card text-center space-y-6 hover:shadow-2xl transition-all duration-500 scroll-reveal hover:scale-105" style={{ animationDelay: '0.3s' }}>
                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center text-white text-3xl font-bold glow-blue">
                                    3
                                </div>
                                <h3 className="text-3xl font-bold text-white">Build Your Streak</h3>
                                <p className="text-slate-400 leading-relaxed">Track your progress, maintain consistency, and watch your knowledge compound over time.</p>
                                <div className="text-5xl">🔥</div>
                            </div>
                        </div>
                    </div>

                    {/* Background decoration */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl"></div>
                </section>

                {/* Features Section */}
                <section className="py-24 md:py-32 bg-gradient-to-b from-slate-900 to-slate-950">
                    <div className="container-custom">
                        <div className="text-center mb-20 scroll-reveal">
                            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                                Why <span className="cyber-gradient-text text-glow">Bloc.ai</span>?
                            </h2>
                            <p className="text-xl text-slate-400">Reading, but make it addictive</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                            <div className="group p-10 bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-3xl border border-purple-500/30 hover:border-purple-500/60 transition-all duration-500 hover:-translate-y-3 scroll-reveal" style={{ animationDelay: '0.1s' }}>
                                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">✨</div>
                                <h3 className="text-2xl font-bold mb-4 text-white">Personalized AF</h3>
                                <p className="text-slate-400 leading-relaxed">AI tailors every Bloc to YOUR interests, YOUR level, YOUR goals.</p>
                            </div>

                            <div className="group p-10 bg-gradient-to-br from-pink-500/20 to-pink-500/5 rounded-3xl border border-pink-500/30 hover:border-pink-500/60 transition-all duration-500 hover:-translate-y-3 scroll-reveal" style={{ animationDelay: '0.2s' }}>
                                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">⚡</div>
                                <h3 className="text-2xl font-bold mb-4 text-white">Bite-Sized</h3>
                                <p className="text-slate-400 leading-relaxed">10 minutes max. Fits into your coffee break, commute, or lunch.</p>
                            </div>

                            <div className="group p-10 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-3xl border border-blue-500/30 hover:border-blue-500/60 transition-all duration-500 hover:-translate-y-3 scroll-reveal" style={{ animationDelay: '0.3s' }}>
                                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🔥</div>
                                <h3 className="text-2xl font-bold mb-4 text-white">Streak Motivation</h3>
                                <p className="text-slate-400 leading-relaxed">Gamified consistency. Build a reading habit that actually sticks.</p>
                            </div>

                            <div className="group p-10 bg-gradient-to-br from-lime-500/20 to-lime-500/5 rounded-3xl border border-lime-500/30 hover:border-lime-500/60 transition-all duration-500 hover:-translate-y-3 scroll-reveal" style={{ animationDelay: '0.4s' }}>
                                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🎨</div>
                                <h3 className="text-2xl font-bold mb-4 text-white">Beautiful UX</h3>
                                <p className="text-slate-400 leading-relaxed">Reading apps don't have to be boring. This one isn't.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Social Proof Section */}
                <section className="py-24 md:py-32 section-dark">
                    <div className="container-custom">
                        <div className="text-center mb-20 scroll-reveal">
                            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
                                Reading = Compound Interest<br />for Your <span className="cyber-gradient-text text-glow">Mind</span>
                            </h2>
                            <p className="text-xl text-slate-400">Don't just take our word for it</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                            <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-10 hover:bg-white/10 transition-all duration-500 scroll-reveal" style={{ animationDelay: '0.1s' }}>
                                <div className="text-7xl mb-6">📖</div>
                                <blockquote className="text-2xl italic text-slate-300 mb-6 leading-relaxed">
                                    "I just sit in my office and read all day... I read and think. So I read and think more than I talk and do."
                                </blockquote>
                                <p className="text-sm font-bold text-purple-400">— Warren Buffett (reads 500 pages/day)</p>
                            </div>

                            <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-10 hover:bg-white/10 transition-all duration-500 scroll-reveal" style={{ animationDelay: '0.2s' }}>
                                <div className="text-7xl mb-6">🌟</div>
                                <blockquote className="text-2xl italic text-slate-300 mb-6 leading-relaxed">
                                    "Books were my pass to personal freedom. I learned to read at age three, and soon discovered there was a whole world to conquer."
                                </blockquote>
                                <p className="text-sm font-bold text-purple-400">— Oprah Winfrey</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="py-32 md:py-40 bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 relative overflow-hidden">
                    <div className="container-custom text-center relative z-10">
                        <div className="max-w-4xl mx-auto space-y-10 scroll-reveal">
                            <h2 className="text-6xl md:text-7xl font-bold leading-tight text-white">
                                Your Future Self<br />
                                Will <span className="cyber-gradient-text text-glow">Thank You</span>
                            </h2>
                            <p className="text-2xl md:text-3xl text-slate-300 leading-relaxed">
                                Start building the reading habit today. <br className="hidden md:block" />
                                10 minutes is all it takes.
                            </p>

                            {isLoggedIn ? (
                                <Link href="/dashboard" className="btn-cyber inline-block">
                                    Go to Dashboard →
                                </Link>
                            ) : (
                                <button onClick={openLogin} className="btn-cyber">
                                    Start Reading Now →
                                </button>
                            )}

                            <p className="text-sm text-slate-500">No credit card required • Start for free • Cancel anytime</p>
                        </div>
                    </div>

                    {/* Decorative blobs */}
                    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
                </section>

                {/* Footer */}
                <footer className="py-12 bg-slate-950 border-t border-white/10">
                    <div className="container-custom">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-2xl font-bold">
                                <span className="cyber-gradient-text">Bloc</span>
                                <span className="text-white">.ai</span>
                            </div>
                            <p className="text-sm text-slate-500">
                                © 2024 Bloc.ai • Building better readers, one bloc at a time
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
