import Link from 'next/link';

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-purple-50/30 to-white">
            <div className="container-custom text-center max-w-4xl space-y-8 animate-fade-in">
                {/* Logo/Brand */}
                <h1 className="text-6xl md:text-7xl font-bold mb-4">
                    <span className="text-gradient">Bloc</span>
                    <span className="text-slate-900">.ai</span>
                </h1>

                {/* Tagline */}
                <p className="text-2xl md:text-3xl text-slate-600 font-medium">
                    Build a smarter, stronger mind
                </p>
                <p className="text-xl text-slate-500">
                    Block by block
                </p>

                {/* Description */}
                <div className="max-w-2xl mx-auto space-y-4 text-slate-600">
                    <p className="text-lg">
                        One 10-minute Bloc of personalized knowledge, delivered daily.
                    </p>
                    <p className="text-base">
                        No decision fatigue. No overwhelm. Just consistent learning that builds into something meaningful.
                    </p>
                </div>

                {/* CTA */}
                <div className="pt-8">
                    <Link href="/login" className="btn-primary text-lg inline-block">
                        Start Building Your Mind
                    </Link>
                </div>

                {/* Visual indicator */}
                <div className="pt-12 flex items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-accent-400 opacity-80"></div>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 opacity-90"></div>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600"></div>
                </div>
                <p className="text-sm text-slate-400 mt-4">
                    Your learning journey starts here
                </p>
            </div>
        </main>
    );
}
