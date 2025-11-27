'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ReadingHistoryItem {
  bloc_id: string;
  completed_at: string;
  blocs: {
    id: string;
    topic: string;
    title: string;
    scheduled_date: string;
  };
}

export default function ArchivePage() {
  const router = useRouter();
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'calendar' | 'list'>('list');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/archive');
      const data = await response.json();

      if (response.ok) {
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="shimmer w-16 h-16 rounded-full mx-auto"></div>
          <p className="text-slate-600">Loading archive...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/20 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container-custom py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold">
            <span className="text-gradient">Bloc</span>
            <span className="text-slate-900">.ai</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="btn-ghost text-sm">
              Dashboard
            </Link>
            <Link href="/settings" className="btn-ghost text-sm">
              Settings
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                Your Archive
              </h1>
              <p className="text-lg text-slate-600 mt-2">
                {history.length} Blocs completed
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  view === 'list'
                    ? 'bg-white shadow text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  view === 'calendar'
                    ? 'bg-white shadow text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Calendar
              </button>
            </div>
          </div>

          {/* Empty State */}
          {history.length === 0 && (
            <div className="card p-12 text-center space-y-4">
              <div className="text-6xl">📚</div>
              <h3 className="text-xl font-semibold text-slate-900">
                No completed Blocs yet
              </h3>
              <p className="text-slate-600">
                Complete your first Bloc to start building your archive!
              </p>
              <Link href="/dashboard" className="btn-primary inline-block mt-4">
                Go to Dashboard
              </Link>
            </div>
          )}

          {/* List View */}
          {view === 'list' && history.length > 0 && (
            <div className="space-y-4">
              {history.map((item) => (
                <Link
                  key={item.bloc_id}
                  href={`/bloc/${item.bloc_id}`}
                  className="card-hover p-6 block group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                          {item.blocs.topic}
                        </span>
                        <span className="text-sm text-slate-500">
                          {new Date(item.completed_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 group-hover:text-gradient transition-colors">
                        {item.blocs.title}
                      </h3>
                    </div>
                    <svg
                      className="w-6 h-6 text-slate-400 group-hover:text-primary-500 transition-colors flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Calendar View - Simple placeholder for now */}
          {view === 'calendar' && history.length > 0 && (
            <div className="card p-8">
              <p className="text-center text-slate-600">
                Calendar view coming soon! Use list view to browse your completed Blocs.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
