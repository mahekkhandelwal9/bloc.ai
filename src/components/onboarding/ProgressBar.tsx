'use client';

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="w-full max-w-md mx-auto mb-8">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">
                    Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm text-slate-500">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className="progress-bar h-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
