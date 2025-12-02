-- Add username column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Add comment
COMMENT ON COLUMN users.username IS 'Unique username for the user. Auto-generated as "Reader OG #X" if not provided during onboarding.';
