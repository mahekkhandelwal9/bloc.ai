'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/onboarding/ProgressBar';

export default function BioPage() {
    const router = useRouter();
    const [bio, setBio] = useState('');

    const handleContinue = () => {
        // Store in session storage for now
        sessionStorage.setItem('onboarding_bio', bio);
        router.push('/onboarding/topics');
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-purple-50/30 to-white px-6 py-12">
            <div className="w-full max-w-2xl space-y-8 animate-fade-in">
                <ProgressBar currentStep={1} totalSteps={5} />

                <div className="card p-8 md:p-12 space-y-6">
                    {/* Header */}
                    <div className="space-y-3">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                            Tell us about yourself
                        </h1>
                        <p className="text-lg text-slate-600">
                            Help us personalize your daily Blocs. Share a bit about your work, interests, or learning goals.
                        </p>
                    </div>

                    {/* Bio Input */}
                    <div className="space-y-3">
                        <label htmlFor="bio" className="block text-sm font-medium text-slate-700">
                            Your background (optional)
                        </label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="I'm a software engineer interested in AI and philosophy. I love learning about how technology shapes society..."
                            rows={6}
                            maxLength={500}
                            className="input resize-none"
                        />
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">
                                This helps us tailor content to your level and interests
                            </span>
                            <span className="text-slate-400">{bio.length}/500</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4">
                        <button
                            onClick={() => handleContinue()}
                            className="text-slate-500 hover:text-slate-700 text-sm"
                        >
                            Skip for now →
                        </button>
                        <button
                            onClick={handleContinue}
                            disabled={!bio.trim()}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue
                        </button>
                    </div>
                </div>

                {/* Helper text */}
                <p className="text-center text-sm text-slate-500">
                    Takes less than 2 minutes to complete
                </p>
            </div>
        </main>
    );
}
