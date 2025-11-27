@echo off
REM Bloc.ai Environment Setup Script
echo ============================================
echo Bloc.ai Environment Setup
echo ============================================
echo.

REM Check if .env.local exists
if exist .env.local (
    echo [WARNING] .env.local already exists!
    echo.
    choice /C YN /M "Do you want to overwrite it?"
    if errorlevel 2 goto :end
)

echo Creating .env.local file...
echo.

(
echo # Supabase Configuration
echo # Get these from: https://supabase.com/dashboard/project/_/settings/api
echo NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
echo.
echo # Gemini AI Configuration
echo # Get API key from: https://makersuite.google.com/app/apikey
echo GEMINI_API_KEY=your_gemini_api_key_here
echo.
echo # Resend Email Configuration
echo # Get API key from: https://resend.com/api-keys
echo RESEND_API_KEY=your_resend_api_key_here
echo.
echo # App Configuration
echo NEXT_PUBLIC_APP_URL=http://localhost:3001
) > .env.local

echo [SUCCESS] .env.local created!
echo.
echo ============================================
echo NEXT STEPS:
echo ============================================
echo 1. Open .env.local and replace placeholder values with your actual API keys
echo.
echo 2. Get API keys from:
echo    - Supabase: https://supabase.com
echo    - Gemini: https://makersuite.google.com/app/apikey
echo    - Resend: https://resend.com
echo.
echo 3. Set up Supabase database:
echo    - Open Supabase SQL Editor
echo    - Run the SQL from README.md (lines 66-127^)
echo.
echo 4. Run: npm run dev
echo.
echo ============================================

:end
pause
