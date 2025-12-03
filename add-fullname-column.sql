-- Add full_name column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add comment
COMMENT ON COLUMN users.full_name IS 'Full name of the user.';
