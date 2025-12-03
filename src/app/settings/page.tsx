'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TOPICS, READING_DAYS } from '@/lib/constants';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isExiting, setIsExiting] = useState(false); // For exit animation
  const [activeSection, setActiveSection] = useState<string | null>(null); // Closed by default

  // Preferences State
  const [bio, setBio] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [schedule, setSchedule] = useState('weekdays');
  const [time, setTime] = useState('09:00');

  // Profile State
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    Promise.all([fetchPreferences(), fetchProfile()]).finally(() => setLoading(false));
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
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();

      if (response.ok && data.user) {
        setUsername(data.user.username || '');
        setFullName(data.user.full_name || '');
        setEmail(data.user.email || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      // Save Preferences
      const prefResponse = await fetch('/api/user/preferences', {
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

      // Save Profile
      const profileResponse = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          full_name: fullName,
        }),
      });

      if (prefResponse.ok && profileResponse.ok) {
        alert('Settings saved successfully!');
      } else {
        const profileData = await profileResponse.json();
        if (profileData.error) {
          alert(`Failed to save profile: ${profileData.error}`);
        } else {
          alert('Failed to save settings');
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
      // Trigger exit animation
      setIsExiting(true);
      // Wait for animation to complete before removing banner
      setTimeout(() => {
        setIsEditing(false);
        setIsExiting(false);
      }, 300); // Match animation duration
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // If currently editing, save the changes
      handleSave();
    } else {
      // Enter edit mode
      setIsEditing(true);
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
    <div className="min-h-screen">
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

      {/* Edit Mode Banner */}
      {isEditing && (
        <div className={`sticky top-0 z-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 ${isExiting ? 'animate-slide-up-exit' : 'animate-slide-down'}`}>
          <div className="container-custom flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="font-medium">Edit Mode Active - Make your changes below</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container-custom py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                Settings
              </h1>
              <p className="text-lg text-slate-600 mt-2">
                Manage your profile and preferences
              </p>
            </div>
            <button
              onClick={handleEditToggle}
              disabled={saving || (!isEditing && topics.length === 0)}
              className="btn-primary disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit'}
            </button>
          </div>

          <div className="space-y-4">
            {/* My Preferences Section */}
            <div className="glass-card overflow-hidden transition-all duration-300">
              <button
                onClick={() => toggleSection('preferences')}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
                    ⚙️
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-semibold text-slate-900">My Preferences</h2>
                    <p className="text-sm text-slate-500">Topics, Schedule, Bio</p>
                  </div>
                </div>
                <svg
                  className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${activeSection === 'preferences' ? 'rotate-180' : ''
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${activeSection === 'preferences' ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
              >
                <div className="p-6 pt-0 border-t border-slate-100 space-y-8">

                  {/* Topics */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-slate-900 mb-3">Topics</h3>
                    <p className="text-sm text-slate-500 mb-4">Select up to 3 topics ({topics.length}/3)</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {TOPICS.map((topic) => {
                        const isSelected = topics.includes(topic);
                        const isDisabled = !isSelected && topics.length >= 3;

                        return (
                          <button
                            key={topic}
                            onClick={() => toggleTopic(topic)}
                            disabled={isDisabled || !isEditing}
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

                  {/* Schedule */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-900">Schedule & Time</h3>
                    <div className="grid gap-3">
                      {READING_DAYS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSchedule(option.value)}
                          disabled={!isEditing}
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
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Time</label>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        disabled={!isEditing}
                        className="input text-center text-xl font-semibold max-w-[200px] disabled:bg-slate-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-slate-900">Your Bio</h3>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      maxLength={500}
                      disabled={!isEditing}
                      className="input resize-none disabled:bg-slate-50 disabled:cursor-not-allowed"
                    />
                    <div className="text-right text-sm text-slate-400">
                      {bio.length}/500
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* My Profile Section */}
            <div className="glass-card overflow-hidden transition-all duration-300">
              <button
                onClick={() => toggleSection('profile')}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                    👤
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-semibold text-slate-900">My Profile</h2>
                    <p className="text-sm text-slate-500">Username, Name, Email</p>
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
                  <div className="mt-6 space-y-6">

                    {/* Username */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={!isEditing}
                        className="input disabled:bg-slate-50 disabled:cursor-not-allowed"
                        placeholder="username"
                      />
                      <p className="text-xs text-slate-500">Unique identifier for your profile.</p>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={!isEditing}
                        className="input disabled:bg-slate-50 disabled:cursor-not-allowed"
                        placeholder="John Doe"
                      />
                    </div>

                    {/* Email (Read Only) */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="input bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-slate-500">Email cannot be changed.</p>
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
