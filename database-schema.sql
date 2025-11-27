-- ============================================
-- Bloc.ai Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  topics TEXT[],
  reading_days TEXT,
  preferred_time TIME,
  timezone TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- OTP codes
CREATE TABLE IF NOT EXISTS otp_codes (
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Blocs
CREATE TABLE IF NOT EXISTS blocs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW(),
  continuity_reference TEXT,
  status TEXT DEFAULT 'pending'
);

-- Reading history
CREATE TABLE IF NOT EXISTS reading_history (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bloc_id UUID REFERENCES blocs(id) ON DELETE CASCADE,
  completed_at TIMESTAMP DEFAULT NOW(),
  reading_progress INTEGER DEFAULT 100,
  PRIMARY KEY (user_id, bloc_id)
);

-- Streaks
CREATE TABLE IF NOT EXISTS streaks (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_read_date DATE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blocs_user_date ON blocs(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_reading_history_user ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Bloc.ai database schema created successfully!';
  RAISE NOTICE 'All tables, indexes, and constraints are ready.';
END $$;
