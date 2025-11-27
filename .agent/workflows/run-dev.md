---
description: Run the development server
---

# Running Bloc.ai Development Server

This workflow starts the Next.js development server for Bloc.ai.

## Prerequisites

1. **Environment variables configured** - Ensure `.env.local` exists with valid API keys:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
   - `RESEND_API_KEY`

2. **Dependencies installed** - Run `npm install` if you haven't already

3. **Supabase database set up** - Tables created using SQL schema from README.md

## Steps

1. **Navigate to project directory**
   ```powershell
   cd "c:\Users\Mahek Khandelwal\OneDrive - RP-Sanjiv Goenka Group\Desktop\Bloc.ai"
   ```

// turbo
2. **Start the development server**
   ```powershell
   npm run dev
   ```

3. **Open in browser**
   - Navigate to `http://localhost:3001`
   - The app runs on port 3001 (configured in package.json)

## Troubleshooting

- **Port already in use**: Change port with `npm run dev -- -p 3002`
- **Module not found**: Run `npm install`
- **Database errors**: Verify Supabase credentials in `.env.local`
- **AI generation fails**: Check GEMINI_API_KEY is valid
- **Email not sending**: Verify RESEND_API_KEY is correct
