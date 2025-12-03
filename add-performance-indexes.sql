-- Add index for faster email lookups during login/signup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add index for faster bloc retrieval by user
CREATE INDEX IF NOT EXISTS idx_blocs_user_id ON blocs(user_id);

-- Add index for faster preferences retrieval
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Add index for faster scheduled date filtering (used in dashboard)
CREATE INDEX IF NOT EXISTS idx_blocs_scheduled_date ON blocs(scheduled_date);
