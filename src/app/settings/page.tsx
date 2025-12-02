'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TOPICS, READING_DAYS } from '@/lib/constants';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>('profile');

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
    document.cookie = 'bloc_user_id=; Max-Age=0; path=/';
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => { });
    window.location.href = '/';
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="shimmer w-16 h-16 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-white">
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
            <button
              onClick={handleLogout}
              className="group relative px-4 py-2 rounded-xl font-medium 
                         bg-white border border-slate-200 text-slate-700
                         hover:border-red-300 hover:bg-red-50 hover:text-red-600
                         transition-all duration-200 ease-out
                         hover:shadow-md hover:-translate-y-0.5
                         active:translate-y-0"
            >
              <span className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                Settings
              </h1>
              <p className="text-lg text-slate-600 mt-2">
                Manage your learning preferences
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || topics.length === 0}
              className="btn-primary disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="space-y-4">
            {/* Profile Section */}
            <div className="card overflow-hidden transition-all duration-300">
              <button
                onClick={() => toggleSection('profile')}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
                    👤
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-semibold text-slate-900">Your Profile</h2>
                    <p className="text-sm text-slate-500">Bio and personal details</p>
                  </div>
                </div>
                <svg
                  className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${activeSection === 'profile' ? 'rotate-180' : ''
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${activeSection === 'profile' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
              >
                <div className="p-6 pt-0 border-t border-slate-100">
                  <div className="mt-4 space-y-4">
                    <label className="block text-sm font-medium text-slate-700">Your Bio</label>
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
                </div>
              </div>
            </div>

            {/* Topics Section */}
            <div className="card overflow-hidden transition-all duration-300">
              <button
                onClick={() => toggleSection('topics')}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                    📚
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-semibold text-slate-900">Learning Topics</h2>
                    <p className="text-sm text-slate-500">Select up to 3 topics ({topics.length}/3)</p>
                  </div>
                </div>
                <svg
                  className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${activeSection === 'topics' ? 'rotate-180' : ''
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${activeSection === 'topics' ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
              >
                <div className="p-6 pt-0 border-t border-slate-100">
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {TOPICS.map((topic) => {
                      const isSelected = topics.includes(topic);
                      const isDisabled = !isSelected && topics.length >= 3;

                      return (
                        <button
                          key={topic}
                          onClick={() => toggleTopic(topic)}
                          disabled={isDisabled}
                          className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${isSelected
                            ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-md transform scale-105'
                            : isDisabled
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-white border-2 border-slate-200 hover:border-primary-300 hover:shadow-sm'
                            }`}
                        >
                          {topic}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="card overflow-hidden transition-all duration-300">
              <button
                onClick={() => toggleSection('schedule')}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl">
                    ⏰
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-semibold text-slate-900">Schedule & Time</h2>
                    <p className="text-sm text-slate-500">When do you want to learn?</p>
                  </div>
                </div>
                <svg
                  className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${activeSection === 'schedule' ? 'rotate-180' : ''
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${activeSection === 'schedule' ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
              >
                <div className="p-6 pt-0 border-t border-slate-100">
                  <div className="mt-4 space-y-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-slate-700">Reading Days</label>
                      <div className="grid gap-3">
                        {READING_DAYS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setSchedule(option.value)}
                            className={`w-full p-4 rounded-xl text-left transition-all ${schedule === option.value
                              ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-md'
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

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-slate-700">Preferred Time</label>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="input text-center text-xl font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
