# 🚀 BLOC.AI - FAST SETUP GUIDE

## ⚡ Quick Setup (5 minutes)

### Option 1: Interactive Setup (Recommended)

Run the setup script:
```powershell
.\setup.ps1
```

This will:
- Guide you through getting API keys
- Create your `.env.local` file
- Give you next steps

### Option 2: Manual Setup

1. **Copy the template:**
   ```powershell
   copy .env.local.example .env.local
   ```

2. **Edit `.env.local`** and replace the placeholders with your actual keys

---

## 🔑 Getting API Keys (3 minutes each)

### Supabase (Database)
1. → [supabase.com](https://supabase.com) → Sign up/Login
2. → "New Project" → Create project (choose free tier)
3. → Settings → API
4. → Copy **Project URL** and **anon public** key

### Google Gemini (AI)
1. → [Google AI Studio](https://makersuite.google.com/app/apikey)
2. → Sign in with Google
3. → "Create API Key" → Copy it

### Resend (Email)
1. → [resend.com](https://resend.com) → Sign up
2. → API Keys → Create new key
3. → Copy the key

---

## 💾 Database Setup (2 minutes)

1. Open your Supabase project
2. Go to **SQL Editor**
3. Open `database-schema.sql` from this project
4. Copy all the SQL
5. Paste in Supabase SQL Editor
6. Click **Run**
7. ✅ You should see "✅ Bloc.ai database schema created successfully!"

---

## 🎯 Launch!

```powershell
npm run dev
```

Visit: **http://localhost:3001**

---

## ✅ Quick Test Flow

1. Enter your email → Get OTP
2. Enter code from email
3. Complete 5-step onboarding
4. See dashboard with demo Bloc
5. Read a Bloc → Mark as done
6. Check archive & settings

---

## 🆘 Troubleshooting

**"Module not found"**
```powershell
npm install
```

**"Database error"**
- Check Supabase URL/key in `.env.local`
- Verify database tables were created

**"Email not sending"**
- Check Resend API key
- Look in spam folder
- Verify Resend account is active

**"AI generation fails"**
- Check Gemini API key is valid
- Verify you have API quota

**Port 3001 in use**
```powershell
npm run dev -- -p 3002
```

---

## 🚀 You're All Set!

Your daily learning platform is ready to go! 
