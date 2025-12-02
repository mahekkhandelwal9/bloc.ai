'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Bloc {
    id: string;
    topic: string;
    title: string;
    scheduled_date: string;
    continuity_reference?: string;
    status: 'pending' | 'generated' | 'failed';
}

import StreakDetails from '@/components/StreakDetails';

export default function DashboardPage() {
    const router = useRouter();
    const [blocs, setBlocs] = useState<Bloc[]>([]);
    const [loading, setLoading] = useState(true);
    const [streak, setStreak] = useState(0);
    const [isFirstDay, setIsFirstDay] = useState(false);
    const [bonusBlocsToday, setBonusBlocsToday] = useState(0);
    const [generating, setGenerating] = useState(false);
    const [generateError, setGenerateError] = useState('');
    const [showStreakDetails, setShowStreakDetails] = useState(false);

    useEffect(() => {
        fetchTodayBlocs();
        fetchStreak();
    }, []);

    const fetchTodayBlocs = async () => {
        try {
            const response = await fetch('/api/blocs/today');
            const data = await response.json();

            if (response.ok) {
                setBlocs(data.blocs || []);
                setIsFirstDay(data.is_first_day || false);
                // Calculate bonus blocs count
                const bonusCount = (data.blocs || []).filter((b: any) => b.is_bonus).length;
                setBonusBlocsToday(bonusCount);
            }
        } catch (error) {
            console.error('Error fetching blocs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStreak = async () => {
        try {
            const response = await fetch('/api/user/streak');
            const data = await response.json();

            if (response.ok) {
                setStreak(data.current_streak || 0);
            }
        } catch (error) {
            console.error('Error fetching streak:', error);
        }
    };

    const handleGenerateToday = async () => {
        setGenerating(true);
        setGenerateError('');

        try {
            const response = await fetch('/api/blocs/generate-bonus', {
                method: 'POST',
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate bonus bloc');
            }

            // Refresh the blocs list
            await fetchTodayBlocs();
        } catch (error: any) {
            setGenerateError(error.message);
        } finally {
            setGenerating(false);
        }
    };

    const handleRegenerateBloc = async (blocId: string) => {
        try {
            const response = await fetch(`/api/blocs/${blocId}/regenerate`, {
                method: 'POST',
            });

            if (response.ok) {
                fetchTodayBlocs(); // Refresh blocs
            }
        } catch (error) {
            console.error('Error regenerating bloc:', error);
        }
    };

    const handleLogout = async () => {
        // Optimistic update
        document.cookie = 'bloc_user_id=; Max-Age=0; path=/';
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => { });
        window.location.href = '/';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="shimmer w-16 h-16 rounded-full mx-auto"></div>
                    <p className="text-slate-600">Loading your Blocs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/20 to-white">
            <StreakDetails
                isOpen={showStreakDetails}
                onClose={() => setShowStreakDetails(false)}
                currentStreak={streak}
            />

            {/* Header */}
            <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="container-custom py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="text-2xl font-bold">
                        <span className="text-gradient">Bloc</span>
                        <span className="text-slate-900">.ai</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {/* Streak */}
                        <button
                            onClick={() => setShowStreakDetails(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-accent-50 
                                     rounded-full border border-primary-200 hover:scale-105 transition-transform cursor-pointer"
                        >
                            <span className="text-xl">🔥</span>
                            <span className="font-semibold text-slate-900">{streak}</span>
                            <span className="text-sm text-slate-600">day streak</span>
                        </button>

                        {/* Navigation */}
                        <Link href="/archive" className="btn-ghost text-sm">
                            Archive
                        </Link>
                        <Link href="/settings" className="btn-ghost text-sm">
                            Settings
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="btn-ghost text-sm text-red-600 hover:bg-red-50"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container-custom py-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Welcome Header */}
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                            Today's Learning
                        </h1>
                        <p className="text-xl text-slate-600">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>

                    {/* Generate Bonus Bloc Button */}
                    {!loading && (
                        <div className="card p-8 text-center space-y-6 animate-fade-in
                                      hover:shadow-xl transition-all duration-300 relative">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    Quick random read?
                                </h2>
                                <p className="text-slate-600">
                                    Generate a bonus bloc to read and learn when free
                                </p>
                            </div>

                            {generateError && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm
                                              animate-shake">
                                    {generateError}
                                </div>
                            )}

                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 
                                              rounded-2xl blur-lg opacity-50 group-hover:opacity-75 
                                              transition-all duration-300 animate-pulse"></div>
                                <button
                                    onClick={handleGenerateToday}
                                    disabled={generating || bonusBlocsToday >= 3}
                                    className="group relative px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 
                                             text-white text-lg font-semibold rounded-2xl
                                             shadow-xl hover:shadow-2xl
                                             transform transition-all duration-300
                                             hover:scale-105 hover:-translate-y-1
                                             active:scale-95 active:translate-y-0
                                             disabled:opacity-50 disabled:cursor-not-allowed
                                             disabled:hover:scale-100 disabled:hover:translate-y-0
                                             border-2 border-white/20"
                                >
                                    {generating ? (
                                        <span className="flex items-center gap-3">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Generating...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-3">
                                            ✨ Generate bonus bloc
                                            <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Floating Counter Badge - Bottom Right */}
                            <div className="absolute bottom-4 right-4">
                                {bonusBlocsToday < 3 ? (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 shadow-sm">
                                        <span className="text-xs font-medium text-blue-700">
                                            {3 - bonusBlocsToday} left today
                                        </span>
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 shadow-sm">
                                        <span className="text-xs font-medium text-orange-700">
                                            Renews at midnight
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* First Day Empty State */}
                    {isFirstDay && blocs.length === 0 && (
                        <div className="card p-8 md:p-12 text-center space-y-6 animate-fade-in">
                            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-primary-100 to-accent-100 flex items-center justify-center">
                                <span className="text-4xl">👋</span>
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    Welcome to Bloc.ai!
                                </h2>
                                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                    Your first Bloc will be ready at your scheduled time. In the meantime, here's a sample Bloc to show you what to expect.
                                </p>
                            </div>
                            <Link href="/bloc/demo" className="btn-primary inline-block">
                                View Demo Bloc
                            </Link>
                        </div>
                    )}

                    {/* Blocs Grid */}
                    {blocs.length > 0 && (
                        <div className="grid gap-6">
                            {blocs.map((bloc) => (
                                <BlocCard
                                    key={bloc.id}
                                    bloc={bloc}
                                    onRegenerate={() => handleRegenerateBloc(bloc.id)}
                                />
                            ))}
                        </div>
                    )}

                    {/* No blocs today */}
                    {!isFirstDay && blocs.length === 0 && (
                        <div className="card p-8 text-center space-y-4">
                            <p className="text-lg text-slate-600">
                                No Blocs scheduled for today based on your reading preferences.
                            </p>
                            <p className="text-sm text-slate-500">
                                Check back on your next scheduled reading day!
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// Bloc Card Component
function BlocCard({
    bloc,
    onRegenerate,
}: {
    bloc: Bloc;
    onRegenerate: () => void;
}) {
    return (
        <Link
            href={`/bloc/${bloc.id}`}
            className="card-hover p-6 md:p-8 space-y-4 group"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                    {/* Topic Badge */}
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 rounded-full">
                        {bloc.topic}
                    </span>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-gradient transition-colors">
                        {bloc.title}
                    </h3>

                    {/* Continuity Reference */}
                    {bloc.continuity_reference && (
                        <p className="text-sm text-slate-600 italic">
                            Building on: {bloc.continuity_reference}
                        </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ~10 min read
                        </span>
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {bloc.status === 'generated' ? 'Ready to read' : 'Generating...'}
                        </span>
                    </div>
                </div>

                {/* CTA Arrow */}
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Failed State */}
            {bloc.status === 'failed' && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200 flex items-center justify-between">
                    <p className="text-sm text-red-700">
                        This Bloc failed to generate. Click to retry.
                    </p>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onRegenerate();
                        }}
                        className="btn-secondary text-sm"
                    >
                        Regenerate
                    </button>
                </div>
            )}
        </Link>
    );
}
