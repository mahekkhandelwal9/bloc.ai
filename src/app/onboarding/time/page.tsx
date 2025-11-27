'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/onboarding/ProgressBar';

export default function TimePage() {
    const router = useRouter();
    const [selectedTime, setSelectedTime] = useState('09:00');

    const handleContinue = () => {
        sessionStorage.setItem('onboarding_time', selectedTime);
        router.push('/onboarding/welcome');
    };

    const popularTimes = [
        { time: '07:00', label: 'Morning', emoji: '🌅' },
        { time: '12:00', label: 'Lunch', emoji: '🌞' },
        { time: '18:00', label: 'Evening', emoji: '🌆' },
        { time: '21:00', label: 'Night', emoji: '🌙' },
    ];

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-purple-50/30 to-white px-6 py-12">
            <div className="w-full max-w-2xl space-y-8 animate-fade-in">
                <ProgressBar currentStep={4} totalSteps={5} />

                <div className="card p-8 md:p-12 space-y-6">
                    {/* Header */}
                    <div className="space-y-3">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                            What time works best?
                        </h1>
                        <p className="text-lg text-slate-600">
                            Pick a time when you're most likely to read. Your Bloc will be ready and waiting.
                        </p>
                    </div>

                    {/* Time Picker */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="time" className="block text-sm font-medium text-slate-700 mb-3">
                                Preferred time
                            </label>
                            <input
                                id="time"
                                type="time"
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                className="input text-center text-2xl font-semibold"
                            />
                        </div>

                        {/* Quick Selection */}
                        <div>
                            <p className="text-sm font-medium text-slate-700 mb-3">
                                Or choose a popular time:
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {popularTimes.map((option) => (
                                    <button
                                        key={option.time}
                                        onClick={() => setSelectedTime(option.time)}
                                        className={`
                      p-4 rounded-xl text-center transition-all duration-200
                      ${selectedTime === option.time
                                                ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-md scale-105'
                                                : 'bg-white border-2 border-slate-200 hover:border-primary-300 hover:bg-purple-50'
                                            }
                    `}
                                    >
                                        <div className="text-2xl mb-1">{option.emoji}</div>
                                        <div className="font-medium text-sm">{option.label}</div>
                                        <div className={`text-xs ${selectedTime === option.time ? 'text-purple-100' : 'text-slate-500'}`}>
                                            {option.time}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-900">
                            💡 <strong>Tip:</strong> Choose a time when you usually have a 10-minute break — morning coffee, lunch, or evening wind-down.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end pt-4">
                        <button onClick={handleContinue} className="btn-primary">
                            Continue
                        </button>
                    </div>
                </div>

                {/* Helper text */}
                <p className="text-center text-sm text-slate-500">
                    Your timezone is auto-detected
                </p>
            </div>
        </main>
    );
}
