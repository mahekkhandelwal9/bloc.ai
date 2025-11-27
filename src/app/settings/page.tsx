'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TOPICS, READING_DAYS } from '@/lib/constants';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bio, setBio] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [schedule, setSchedule] = useState('weekdays');
  const [time, setTime] = useState('09:00');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      const data = await response.json();

      if (response.ok && data.data) {
        setBio(data.data.bio || '');
        setTopics(data.data.topics || []);
        setSchedule(data.data.reading_days || 'weekdays');
        setTime(data.data.preferred_time || '09:00');
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          topics,
          reading_days: schedule,
          preferred_time: time,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleTopic = (topic: string) => {
    if (topics.includes(topic)) {
      setTopics(topics.filter((t) => t !== topic));
    } else if (topics.length < 3) {
      setTopics([...topics, topic]);
    }
  };

  const handleLogout = () => {
    document.cookie = 'bloc_user_id=; Max-Age=0';
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="shimmer w-16 h-16 rounded-full"></div>
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
            <Link href="/archive" className="btn-ghost text-sm">
              Archive
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
              Settings
            </h1>
            <p className="text-lg text-slate-600 mt-2">
              Manage your learning preferences
            </p>
          </div>

          {/* Bio Section */}
          <div className="card p-6 md:p-8 space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">Your Background</h2>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={5}
              maxLength={500}
              className="input resize-none"
            />
            <div className="text-right text-sm text-slate-400">
              {bio.length}/500
            </div>
          </div>

          {/* Topics Section */}
          <div className="card p-6 md:p-8 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Topics</h2>
              <p className="text-slate-600 mt-1">
                Select up to 3 topics ({topics.length}/3)
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TOPICS.map((topic) => {
                const isSelected = topics.includes(topic);
                const isDisabled = !isSelected && topics.length >= 3;

                return (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    disabled={isDisabled}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                        : isDisabled
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-white border-2 border-slate-200 hover:border-primary-300'
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule Section */}
          <div className="card p-6 md:p-8 space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">Reading Schedule</h2>
            
            <div className="space-y-3">
              {READING_DAYS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSchedule(option.value)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    schedule === option.value
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                      : 'bg-white border-2 border-slate-200 hover:border-primary-300'
                  }`}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className={`text-sm ${schedule === option.value ? 'text-purple-100' : 'text-slate-500'}`}>
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Section */}
          <div className="card p-6 md:p-8 space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">Preferred Time</h2>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="input text-center text-xl font-semibold"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            <button onClick={handleLogout} className="btn-secondary text-red-600">
              Logout
            </button>
            <button
              onClick={handleSave}
              disabled={saving || topics.length === 0}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
