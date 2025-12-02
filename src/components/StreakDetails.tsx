'use client';

import { useState, useEffect } from 'react';

interface StreakDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    currentStreak: number;
}

export default function StreakDetails({ isOpen, onClose, currentStreak }: StreakDetailsProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={onClose}>
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform transition-all scale-100 animate-scale-in"
                onClick={e => e.stopPropagation()}>

                <div className="text-center space-y-6">
                    {/* Flame Icon */}
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-orange-400 blur-2xl opacity-30 animate-pulse"></div>
                        <span className="text-8xl relative z-10 drop-shadow-lg">🔥</span>
                    </div>

                    {/* Streak Count */}
                    <div className="space-y-2">
                        <h2 className="text-4xl font-bold text-slate-900">
                            {currentStreak} Day Streak!
                        </h2>
                        <p className="text-slate-600">
                            You're on fire! Keep reading daily to build your mind block by block.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                            <div className="text-2xl font-bold text-orange-600">Top 5%</div>
                            <div className="text-xs text-orange-400 font-medium uppercase tracking-wide">Consistency</div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                            <div className="text-2xl font-bold text-purple-600">Level 3</div>
                            <div className="text-xs text-purple-400 font-medium uppercase tracking-wide">Scholar</div>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold
                                 hover:bg-slate-800 active:scale-95 transition-all"
                    >
                        Keep it up!
                    </button>
                </div>
            </div>
        </div>
    );
}
