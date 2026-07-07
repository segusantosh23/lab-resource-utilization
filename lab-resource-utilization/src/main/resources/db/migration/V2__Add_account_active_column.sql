-- Add account_active column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_active BOOLEAN DEFAULT true;

-- Update existing users to have email_verified = true (since they already exist and can login)
UPDATE users SET email_verified = true WHERE email_verified IS NULL;

-- Ensure all existing users are account_active
UPDATE users SET account_active = true WHERE account_active IS NULL;
