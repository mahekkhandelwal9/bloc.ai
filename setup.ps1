# Bloc.ai Quick Setup Script (PowerShell)
# This script will guide you through setting up your environment

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Bloc.ai Environment Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Function to get user input
function Get-UserInput {
    param (
        [string]$Prompt,
        [string]$DefaultValue = "",
        [bool]$IsSecret = $false
    )
    
    if ($IsSecret) {
        $value = Read-Host -Prompt $Prompt -AsSecureString
        return [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($value))
    } else {
        if ($DefaultValue) {
            $value = Read-Host -Prompt "$Prompt (default: $DefaultValue)"
            if ([string]::IsNullOrWhiteSpace($value)) {
                return $DefaultValue
            }
            return $value
        } else {
            return Read-Host -Prompt $Prompt
        }
    }
}

Write-Host "This script will create your .env.local file." -ForegroundColor Yellow
Write-Host "You need API keys from:" -ForegroundColor Yellow
Write-Host "  1. Supabase - https://supabase.com" -ForegroundColor White
Write-Host "  2. Google Gemini - https://makersuite.google.com/app/apikey" -ForegroundColor White
Write-Host "  3. Resend - https://resend.com" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Do you have your API keys ready? (y/n)"
if ($continue -ne "y") {
    Write-Host ""
    Write-Host "No problem! Here's what to do:" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. Get Supabase Keys:" -ForegroundColor Cyan
    Write-Host "   - Go to https://supabase.com and sign up" -ForegroundColor White
    Write-Host "   - Create a new project" -ForegroundColor White
    Write-Host "   - Go to Settings > API" -ForegroundColor White
    Write-Host "   - Copy Project URL and anon public key" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Get Gemini API Key:" -ForegroundColor Cyan
    Write-Host "   - Visit https://makersuite.google.com/app/apikey" -ForegroundColor White
    Write-Host "   - Sign in with Google" -ForegroundColor White
    Write-Host "   - Click 'Create API Key'" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Get Resend API Key:" -ForegroundColor Cyan
    Write-Host "   - Go to https://resend.com and sign up" -ForegroundColor White
    Write-Host "   - Navigate to API Keys" -ForegroundColor White
    Write-Host "   - Create a new API key" -ForegroundColor White
    Write-Host ""
    Write-Host "Run this script again when you have your keys!" -ForegroundColor Green
    Write-Host ""
    pause
    exit
}

Write-Host ""
Write-Host "Great! Let's set up your environment..." -ForegroundColor Green
Write-Host ""

# Collect API keys
Write-Host "=== Supabase Configuration ===" -ForegroundColor Cyan
$supabaseUrl = Get-UserInput "Enter your Supabase Project URL"
$supabaseKey = Get-UserInput "Enter your Supabase anon key"

Write-Host ""
Write-Host "=== Gemini AI Configuration ===" -ForegroundColor Cyan
$geminiKey = Get-UserInput "Enter your Gemini API key"

Write-Host ""
Write-Host "=== Resend Configuration ===" -ForegroundColor Cyan
$resendKey = Get-UserInput "Enter your Resend API key"

Write-Host ""
Write-Host "=== App Configuration ===" -ForegroundColor Cyan
$appUrl = Get-UserInput "App URL" "http://localhost:3001"

# Create .env.local file
$envContent = @"
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseKey

# Gemini AI Configuration
GEMINI_API_KEY=$geminiKey

# Resend Email Configuration
RESEND_API_KEY=$resendKey

# App Configuration
NEXT_PUBLIC_APP_URL=$appUrl
"@

try {
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8 -Force
    Write-Host ""
    Write-Host "✅ .env.local created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Set up your Supabase database:" -ForegroundColor Yellow
    Write-Host "   - Open Supabase SQL Editor" -ForegroundColor White
    Write-Host "   - Copy contents of database-schema.sql" -ForegroundColor White
    Write-Host "   - Paste and run in SQL Editor" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Start the development server:" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Visit:" -ForegroundColor Yellow
    Write-Host "   $appUrl" -ForegroundColor White
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
}
catch {
    Write-Host "❌ Error creating .env.local: $_" -ForegroundColor Red
}

pause
