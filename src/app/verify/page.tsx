'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const router = useRouter();

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resending, setResending] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Auto-focus first input
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        // Only allow digits
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value.slice(-1); // Take only last character
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all filled
        if (index === 5 && value) {
            const fullCode = [...newCode.slice(0, 5), value].join('');
            if (fullCode.length === 6) {
                verifyOTP(fullCode);
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
        setCode(newCode);

        if (pastedData.length === 6) {
            verifyOTP(pastedData);
        }
    };

    const verifyOTP = async (otpCode: string) => {
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: otpCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Invalid code');
            }

            // Check if user needs onboarding
            if (data.needsOnboarding) {
                router.push('/onboarding/bio');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Verification failed');
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');

        try {
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error('Failed to resend code');
            }

            // Show success message (you could add a toast here)
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setResending(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-purple-50/30 to-white px-6">
            <div className="w-full max-w-md space-y-8 animate-fade-in">
                {/* Logo */}
                <div className="text-center">
                    <h1 className="text-5xl font-bold mb-2">
                        <span className="text-gradient">Bloc</span>
                        <span className="text-slate-900">.ai</span>
                    </h1>
                </div>

                {/* Verification Card */}
                <div className="card p-8 space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-slate-900">
                            Check your email
                        </h2>
                        <p className="text-slate-600">
                            We sent a 6-digit code to
                            <br />
                            <span className="font-medium text-slate-900">{email}</span>
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* OTP Input */}
                        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-2xl font-semibold border-2 border-slate-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 transition-all"
                                    disabled={loading}
                                />
                            ))}
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {loading && (
                            <div className="text-center text-slate-600 text-sm flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Verifying...
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-200 space-y-3">
                        <p className="text-sm text-slate-600 text-center">
                            Didn't receive the code?
                        </p>
                        <button
                            onClick={handleResend}
                            disabled={resending || loading}
                            className="btn-ghost w-full disabled:opacity-50"
                        >
                            {resending ? 'Sending...' : 'Resend Code'}
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => router.push('/login')}
                    className="text-slate-600 hover:text-slate-900 text-sm flex items-center justify-center gap-1 mx-auto"
                >
                    ← Change email
                </button>
            </div>
        </main>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <VerifyContent />
        </Suspense>
    );
}
