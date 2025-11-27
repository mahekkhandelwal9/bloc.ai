---
description: Set up environment variables for Bloc.ai
---

# Environment Setup for Bloc.ai

This workflow guides you through setting up the required API keys and configuration.

## Step 1: Create .env.local file

Create a file named `.env.local` in the project root with the following content:

```env
# Supabase Configuration
# Get these from: https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Gemini AI Configuration
# Get API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Resend Email Configuration
# Get API key from: https://resend.com/api-keys
RESEND_API_KEY=your_resend_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## Step 2: Obtain API Keys

### Supabase (Database)

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project" and create a project
3. Once created, go to Settings → API
4. Copy **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
5. Copy **anon public** key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Google Gemini (AI Content Generation)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key → paste as `GEMINI_API_KEY`

### Resend (Email for OTP)

1. Go to [resend.com](https://resend.com) and sign up
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key → paste as `RESEND_API_KEY`
5. **Important**: Add a verified domain or use the testing domain for development

## Step 3: Set Up Supabase Database

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy the SQL schema from `README.md` (starts at line 66)
4. Paste and run the SQL to create all tables
5. Verify tables were created in Table Editor

## Step 4: Verify Setup

Run the development server to test:
```powershell
npm run dev
```

Visit `http://localhost:3001` - you should see the landing page without errors.

## Notes

- The `.env.local` file is gitignored for security (never commit API keys!)
- Free tiers are available for all three services
- For production deployment, set these as environment variables in Vercel/your hosting platform
