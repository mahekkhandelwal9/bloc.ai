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
    const [currentQuote, setCurrentQuote] = useState(0);

    const quotes = [
        { text: "The more that you read, the more things you will know.", author: "Dr. Seuss", emoji: "🧠" },
        { text: "Reading fuels a sense of curiosity about the world.", author: "Bill Gates", emoji: "💡" },
        { text: "I was raised by books. Books, and then my parents.", author: "Elon Musk", emoji: "🚀" },
        { text: "I just sit in my office and read all day.", author: "Warren Buffett", emoji: "📖" }
    ];

    useEffect(() => {
        const checkAuth = () => {
            const cookies = document.cookie.split(';');
            const hasAuthCookie = cookies.some(cookie => cookie.trim().startsWith('bloc_user_id='));
            setIsLoggedIn(hasAuthCookie);
        };
        checkAuth();

        // Scroll-based quote change
        const handleScroll = () => {
            const quotesSection = document.getElementById('quotes-section');
            if (quotesSection) {
                const rect = quotesSection.getBoundingClientRect();
                const sectionHeight = quotesSection.offsetHeight;
                const scrollInSection = -rect.top;
                const progress = Math.max(0, Math.min(1, scrollInSection / (sectionHeight * 0.8)));
                const quoteIndex = Math.floor(progress * quotes.length);
                setCurrentQuote(Math.min(quoteIndex, quotes.length - 1));
            }
        };

        window.addEventListener('scroll', handleScroll);

        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -80px 0px'
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
    }, [quotes.length]);

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
                <header className="fixed top-0 left-0 right-0 z-40 bg-slate-900/70 backdrop-blur-xl border-b border-white/5">
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

                {/* Hero */}
                <section className="relative h-screen flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl floating"></div>
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500 rounded-full blur-3xl floating-slow"></div>
                    </div>

                    <div className="container-custom relative z-10 text-center">
                        <div className="max-w-5xl mx-auto space-y-8">
                            <div className="inline-block px-6 py-2 bg-purple-500/15 border border-purple-500/25 rounded-full text-purple-300 text-sm font-medium animate-scale-in">
                                📚 The Future of Reading
                            </div>
                            <h1 className="font-bold leading-tight text-white animate-fade-in-up">
                                Read <span className="cyber-gradient-text text-glow">Smarter</span>,<br />
                                Not Harder
                            </h1>
                            <p className="text-2xl md:text-3xl text-slate-300 max-w-3xl mx-auto leading-relaxed" style={{ animation: 'fade-in-up 0.8s ease-out 0.1s both' }}>
                                10-minute AI-powered knowledge blocs.<br />
                                Personalized daily. Build your habit.
                            </p>

                            {isLoggedIn ? (
                                <Link href="/dashboard" className="btn-cyber inline-block" style={{ animation: 'fade-in-up 0.8s ease-out 0.2s both' }}>
                                    Start Reading →
                                </Link>
                            ) : (
                                <button onClick={openLogin} className="btn-cyber" style={{ animation: 'fade-in-up 0.8s ease-out 0.2s both' }}>
                                    Start Reading Free →
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Quotes Carousel */}
                <section id="quotes-section" className="min-h-[300vh] bg-slate-950 relative">
                    <div className="sticky top-0 h-screen flex items-center justify-center">
                        <div className="container-custom text-center">
                            <div className="max-w-4xl mx-auto">
                                <div className="text-7xl mb-8 transition-all duration-700">{quotes[currentQuote].emoji}</div>
                                <blockquote className="text-3xl md:text-5xl font-bold text-slate-200 mb-6 leading-tight transition-all duration-700">
                                    "{quotes[currentQuote].text}"
                                </blockquote>
                                <p className="text-xl text-purple-400 transition-all duration-700">— {quotes[currentQuote].author}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Showcase */}
                <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900">
                    <div className="container-custom">
                        <div className="max-w-5xl mx-auto">
                            <div className="grid md:grid-cols-3 gap-12 text-center">
                                <div className="scroll-reveal">
                                    <div className="text-6xl font-bold cyber-gradient-text mb-3">12.5K+</div>
                                    <div className="text-lg text-slate-400">Articles Created by AI</div>
                                </div>
                                <div className="scroll-reveal" style={{ animationDelay: '0.1s' }}>
                                    <div className="text-6xl font-bold cyber-gradient-text mb-3">45K+</div>
                                    <div className="text-lg text-slate-400">Articles Read</div>
                                </div>
                                <div className="scroll-reveal" style={{ animationDelay: '0.2s' }}>
                                    <div className="text-6xl font-bold cyber-gradient-text mb-3">2.8K+</div>
                                    <div className="text-lg text-slate-400">Happy Readers</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Bloc - Founder Note */}
                <section className="py-32 bg-slate-900">
                    <div className="container-custom">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16 scroll-reveal">
                                <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                                    Why <span className="cyber-gradient-text text-glow">Bloc.ai</span>?
                                </h2>
                                <p className="text-xl text-slate-400">A note from the founders</p>
                            </div>

                            <div className="glass-card p-10 md:p-12 scroll-reveal">
                                <p className="text-xl text-slate-300 leading-relaxed mb-6">
                                    We built Bloc.ai because we were tired of feeling guilty about not reading enough. The problem wasn't lack of interest—it was the overwhelming choice and time commitment.
                                </p>
                                <p className="text-xl text-slate-300 leading-relaxed mb-6">
                                    Traditional reading apps throw entire books at you. We take a different approach: <span className="text-white font-semibold">bite-sized, AI-curated knowledge blocs</span> that fit into your actual life.
                                </p>
                                <p className="text-xl text-slate-300 leading-relaxed">
                                    10 minutes a day. Personalized to your interests. Built into a habit you'll actually stick with. That's the Bloc.ai promise.
                                </p>
                                <div className="mt-8 pt-8 border-t border-white/10">
                                    <p className="text-lg text-slate-400">— The Bloc.ai Team</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Problem → Solution */}
                <section className="py-32 bg-gradient-to-b from-slate-900 to-slate-950">
                    <div className="container-custom">
                        <div className="max-w-5xl mx-auto text-center">
                            <div className="scroll-reveal mb-20">
                                <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
                                    The <span className="cyber-gradient-text text-glow">Problem</span>
                                </h2>
                                <p className="text-2xl md:text-3xl text-slate-300 leading-relaxed">
                                    Reading feels overwhelming.<br />Too many books. No time. No system.
                                </p>
                            </div>

                            <div className="my-16 flex justify-center">
                                <div className="text-5xl text-purple-500/40">↓</div>
                            </div>

                            <div className="scroll-reveal">
                                <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
                                    The <span className="cyber-gradient-text text-glow">Solution</span>
                                </h2>
                                <p className="text-2xl md:text-3xl text-slate-300 leading-relaxed">
                                    <span className="cyber-gradient-text font-bold">Bloc.ai</span> delivers personalized 10-minute knowledge blocs.<br />
                                    Daily. Curated by AI. Just for you.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How AI Works */}
                <section className="py-32 bg-slate-950">
                    <div className="container-custom">
                        <div className="text-center mb-20 scroll-reveal">
                            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                                How We <span className="cyber-gradient-text text-glow">Leverage AI</span>
                            </h2>
                            <p className="text-xl text-slate-400">Simplification for you. Exploration for all.</p>
                        </div>

                        <div className="max-w-6xl mx-auto">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                                <div className="flex-1 text-center scroll-reveal" style={{ animationDelay: '0.1s' }}>
                                    <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-5xl font-bold glow-purple">
                                        🎯
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">Select Topics & Time</h3>
                                    <p className="text-lg text-slate-400">Choose what you learn and when</p>
                                </div>

                                <div className="hidden md:block text-purple-500/30 text-4xl">→</div>

                                <div className="flex-1 text-center scroll-reveal" style={{ animationDelay: '0.2s' }}>
                                    <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-blue-400 rounded-full flex items-center justify-center text-white text-5xl font-bold glow-pink">
                                        🤖
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">AI Creates Blocs</h3>
                                    <p className="text-lg text-slate-400">Personalized 10-min reads daily</p>
                                </div>

                                <div className="hidden md:block text-purple-500/30 text-4xl">→</div>

                                <div className="flex-1 text-center scroll-reveal" style={{ animationDelay: '0.3s' }}>
                                    <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-5xl font-bold glow-blue">
                                        🎁
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">Read & Collect Rewards</h3>
                                    <p className="text-lg text-slate-400">Build consistency, track progress</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-40 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
                    <div className="container-custom text-center relative z-10">
                        <div className="max-w-5xl mx-auto space-y-10 scroll-reveal">
                            <h2 className="text-6xl md:text-7xl font-bold leading-tight text-white">
                                An App for Your<br />
                                <span className="cyber-gradient-text text-glow">Future Self</span><br />
                                to Thank You
                            </h2>

                            {isLoggedIn ? (
                                <Link href="/dashboard" className="btn-cyber inline-block text-xl px-12 py-6">
                                    Start Your Journey →
                                </Link>
                            ) : (
                                <button onClick={openLogin} className="btn-cyber text-xl px-12 py-6">
                                    Start Your Journey →
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl"></div>
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
