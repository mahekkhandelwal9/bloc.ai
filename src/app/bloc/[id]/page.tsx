'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

interface BlocData {
    id: string;
    topic: string;
    title: string;
    content: string;
    continuity_reference?: string;
}

export default function BlocReaderPage() {
    const params = useParams();
    const router = useRouter();
    const blocId = params.id as string;

    const [bloc, setBloc] = useState<BlocData | null>(null);
    const [loading, setLoading] = useState(true);
    const [fontSize, setFontSize] = useState(18);
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    useEffect(() => {
        if (blocId && blocId !== 'demo') {
            fetchBloc();
        } else if (blocId === 'demo') {
            loadDemoBloc();
        }
    }, [blocId]);

    const fetchBloc = async () => {
        try {
            const response = await fetch(`/api/blocs/${blocId}`);
            const data = await response.json();

            if (response.ok) {
                setBloc(data);
            } else {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Error fetching bloc:', error);
            router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const loadDemoBloc = () => {
        setBloc({
            id: 'demo',
            topic: 'Artificial Intelligence',
            title: 'The Rise of Large Language Models',
            continuity_reference: 'Demo content',
            content: `
## A New Era of AI

Large Language Models (LLMs) have transformed how we interact with AI. These sophisticated systems can understand context, generate human-like text, and assist with complex tasks that once required human expertise.

The technology behind LLMs isn't entirely new—it builds on decades of natural language processing research. But recent breakthroughs in transformer architecture and training techniques have unlocked capabilities that seemed impossible just a few years ago.

## How They Work

At their core, LLMs learn patterns from vast amounts of text data. During training, they develop an understanding of language structure, context, and even reasoning patterns. This allows them to:

- Generate coherent, contextually relevant responses
- Translate between languages with nuance
- Summarize complex documents
- Answer questions based on learned knowledge

The key innovation is the "transformer" architecture, which uses attention mechanisms to understand relationships between words regardless of their distance in a sentence.

## Why This Matters

LLMs are reshaping industries from healthcare to education. They're making information more accessible, automating repetitive cognitive tasks, and augmenting human creativity.

But they also raise important questions about authenticity, bias in training data, and the nature of intelligence itself. As these models become more capable, we must thoughtfully consider their role in society.

---

**Tomorrow's idea:** How do these AI systems actually "learn" during training? We'll explore the fascinating process of gradient descent and neural network optimization.
      `,
        });
        setLoading(false);
    };

    const handleMarkDone = async () => {
        if (blocId === 'demo') {
            setShowCompletionModal(true);
            return;
        }

        try {
            const response = await fetch(`/api/blocs/${blocId}/complete`, {
                method: 'POST',
            });

            if (response.ok) {
                setShowCompletionModal(true);
            }
        } catch (error) {
            console.error('Error marking bloc complete:', error);
        }
    };

    const handleShare = async () => {
        if (navigator.share && bloc) {
            try {
                await navigator.share({
                    title: bloc.title,
                    text: `Check out this Bloc from Bloc.ai: "${bloc.title}"`,
                    url: window.location.href,
                });
            } catch (error) {
                // User cancelled share
            }
        } else {
            // Fallback: copy link
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="shimmer w-16 h-16 rounded-full mx-auto"></div>
                    <p className="text-slate-600">Loading your Bloc...</p>
                </div>
            </div>
        );
    }

    if (!bloc) {
        return null;
    }

    return (
        <>
            <div className="min-h-screen bg-white">
                {/* Header */}
                <header className="border-b border-slate-200 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                    <div className="container-custom py-4 flex items-center justify-between">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Dashboard
                        </button>

                        <div className="flex items-center gap-2">
                            {/* Zoom Controls */}
                            <button
                                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                                className="btn-ghost text-sm p-2"
                                title="Decrease font size"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                            </button>
                            <span className="text-sm text-slate-600 w-12 text-center">{fontSize}px</span>
                            <button
                                onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                                className="btn-ghost text-sm p-2"
                                title="Increase font size"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Reader Content */}
                <main className="container-custom py-12">
                    <article className="reading-content" style={{ fontSize: `${fontSize}px` }}>
                        {/* Topic Badge */}
                        <div className="mb-6">
                            <span className="inline-block px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 rounded-full">
                                {bloc.topic}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            {bloc.title}
                        </h1>

                        {/* Continuity Reference */}
                        {bloc.continuity_reference && (
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 mb-8">
                                <p className="text-sm text-purple-900">
                                    <strong>Building on yesterday:</strong> {bloc.continuity_reference}
                                </p>
                            </div>
                        )}

                        {/* Content */}
                        <div className="prose prose-lg max-w-none">
                            <ReactMarkdown>{bloc.content}</ReactMarkdown>
                        </div>

                        {/* Actions */}
                        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                            <button onClick={handleShare} className="btn-ghost">
                                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                Share
                            </button>

                            <button onClick={handleMarkDone} className="btn-primary">
                                Mark as Done
                                <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                        </div>
                    </article>
                </main>
            </div>

            {/* Completion Modal */}
            {showCompletionModal && (
                <CompletionModal
                    onClose={() => {
                        setShowCompletionModal(false);
                        router.push('/dashboard');
                    }}
                />
            )}
        </>
    );
}

// Completion Modal Component
function CompletionModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 animate-fade-in">
            <div className="card max-w-md w-full p-8 space-y-6 animate-slide-up">
                {/* Success Icon */}
                <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                {/* Message */}
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-slate-900">
                        Bloc Complete! 🎉
                    </h3>
                    <p className="text-slate-600">
                        Great job! You're building your mind, block by block.
                    </p>
                </div>

                {/* Stacked Blocks Visualization */}
                <div className="flex items-end justify-center gap-2 py-4">
                    <div className="w-8 h-12 rounded-lg bg-gradient-to-br from-primary-400 to-accent-400 opacity-60"></div>
                    <div className="w-8 h-16 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 opacity-80"></div>
                    <div className="w-8 h-20 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 animate-slide-up"></div>
                </div>

                {/* CTA */}
                <button onClick={onClose} className="btn-primary w-full">
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}
