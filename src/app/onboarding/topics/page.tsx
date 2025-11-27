'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { TOPICS } from '@/lib/constants';

export default function TopicsPage() {
    const router = useRouter();
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

    const toggleTopic = (topic: string) => {
        if (selectedTopics.includes(topic)) {
            setSelectedTopics(selectedTopics.filter((t) => t !== topic));
        } else if (selectedTopics.length < 3) {
            setSelectedTopics([...selectedTopics, topic]);
        }
    };

    const handleContinue = () => {
        sessionStorage.setItem('onboarding_topics', JSON.stringify(selectedTopics));
        router.push('/onboarding/schedule');
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-purple-50/30 to-white px-6 py-12">
            <div className="w-full max-w-4xl space-y-8 animate-fade-in">
                <ProgressBar currentStep={2} totalSteps={5} />

                <div className="card p-8 md:p-12 space-y-6">
                    {/* Header */}
                    <div className="space-y-3">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                            Choose your topics
                        </h1>
                        <p className="text-lg text-slate-600">
                            Pick up to 3 topics you'd like to learn about. We'll create daily Blocs around these themes.
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg border border-purple-200">
                            <span className="text-sm font-medium text-purple-700">
                                {selectedTopics.length}/3 selected
                            </span>
                        </div>
                    </div>

                    {/* Topics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {TOPICS.map((topic) => {
                            const isSelected = selectedTopics.includes(topic);
                            const isDisabled = !isSelected && selectedTopics.length >= 3;

                            return (
                                <button
                                    key={topic}
                                    onClick={() => toggleTopic(topic)}
                                    disabled={isDisabled}
                                    className={`
                    px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
                    ${isSelected
                                            ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-md scale-105'
                                            : isDisabled
                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-purple-50'
                                        }
                  `}
                                >
                                    {topic}
                                </button>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end pt-4">
                        <button
                            onClick={handleContinue}
                            disabled={selectedTopics.length === 0}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue
                        </button>
                    </div>
                </div>

                {/* Helper text */}
                <div className="text-center space-y-2">
                    <p className="text-sm text-slate-500">
                        You can change these topics anytime in settings
                    </p>
                </div>
            </div>
        </main>
    );
}
