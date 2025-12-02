-- ============================================
-- FIX PERMISSIONS SCRIPT
-- Run this in Supabase SQL Editor to fix "Failed to save" errors
-- ============================================

-- 1. Disable Row Level Security (RLS)
-- Since we are handling authentication in our Next.js API routes,
-- we need to allow the API to write to these tables.
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE blocs DISABLE ROW LEVEL SECURITY;
ALTER TABLE reading_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE streaks DISABLE ROW LEVEL SECURITY;

-- 2. Grant Permissions to 'anon' role
-- The Next.js API uses the 'anon' key, so it needs full access.
GRANT ALL ON users TO anon;
GRANT ALL ON user_preferences TO anon;
GRANT ALL ON otp_codes TO anon;
GRANT ALL ON blocs TO anon;
GRANT ALL ON reading_history TO anon;
GRANT ALL ON streaks TO anon;

-- 3. Grant Permissions to 'authenticated' role (good practice)
GRANT ALL ON users TO authenticated;
GRANT ALL ON user_preferences TO authenticated;
GRANT ALL ON otp_codes TO authenticated;
GRANT ALL ON blocs TO authenticated;
GRANT ALL ON reading_history TO authenticated;
GRANT ALL ON streaks TO authenticated;

-- 4. Grant Sequence Permissions (for auto-increment IDs if any)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success Message
DO $$
BEGIN
  RAISE NOTICE '✅ Permissions fixed! RLS disabled and access granted.';
END $$;
