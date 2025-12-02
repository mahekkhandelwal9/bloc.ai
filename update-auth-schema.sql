-- ============================================
-- AUTHENTICATION UPDATE SCRIPT
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add password_hash column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. Disable RLS on users table (if not already done) to allow updates
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Success Message
DO $$
BEGIN
  RAISE NOTICE '✅ Users table updated with password_hash column!';
END $$;
