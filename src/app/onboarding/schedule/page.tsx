'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { READING_DAYS } from '@/lib/constants';

export default function SchedulePage() {
    const router = useRouter();
    const [selectedSchedule, setSelectedSchedule] = useState<string>('weekdays');

    const handleContinue = () => {
        sessionStorage.setItem('onboarding_schedule', selectedSchedule);
        router.push('/onboarding/time');
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-purple-50/30 to-white px-6 py-12">
            <div className="w-full max-w-2xl space-y-8 animate-fade-in">
                <ProgressBar currentStep={3} totalSteps={5} />

                <div className="card p-8 md:p-12 space-y-6">
                    {/* Header */}
                    <div className="space-y-3">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                            When should we send your Blocs?
                        </h1>
                        <p className="text-lg text-slate-600">
                            Choose how often you want to receive your daily learning content.
                        </p>
                    </div>

                    {/* Schedule Options */}
                    <div className="space-y-3">
                        {READING_DAYS.map((option) => {
                            const isSelected = selectedSchedule === option.value;

                            return (
                                <button
                                    key={option.value}
                                    onClick={() => setSelectedSchedule(option.value)}
                                    className={`
                    w-full p-6 rounded-xl text-left transition-all duration-200
                    ${isSelected
                                            ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg scale-[1.02]'
                                            : 'bg-white border-2 border-slate-200 hover:border-primary-300 hover:bg-purple-50'
                                        }
                  `}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="font-semibold text-lg">{option.label}</div>
                                            <div className={`text-sm ${isSelected ? 'text-purple-100' : 'text-slate-500'}`}>
                                                {option.description}
                                            </div>
                                        </div>
                                        <div
                                            className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center
                        ${isSelected ? 'border-white bg-white' : 'border-slate-300'}
                      `}
                                        >
                                            {isSelected && (
                                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Info */}
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-purple-900">
                            <strong>Building a habit takes consistency.</strong> We recommend starting with weekdays and adjusting as you go.
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
                    You can adjust this schedule anytime
                </p>
            </div>
        </main>
    );
}
