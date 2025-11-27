# Bloc.ai - Daily Learning Habit Product

**Build a smarter, stronger mind — block by block.**

Bloc.ai is a web-first learning habit product that delivers one 10-minute AI-curated "Bloc" of knowledge daily. Users pick their interests, choose reading days, set a preferred time, and receive personalized, continuity-driven micro-learning content that builds a lasting reading habit.

## Features

- 🔐 **Email + OTP Authentication** - Secure, passwordless login
- 🎯 **Personalized Onboarding** - Select topics, schedule, and preferences
- 📊 **Daily Dashboard** - View today's curated Blocs
- 📖 **Elegant Reading Experience** - Book-like reader with zoom controls
- 🔥 **Streak Tracking** - Visual block-stacking progress
- 📅 **Archive** - Calendar view of past readings
- ⚙️ **Settings** - Manage preferences anytime
- 🤖 **AI-Powered** - Gemini API generates personalized content

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + Custom Design System
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **Email**: Resend
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account
- Gemini API key
- Resend API key

### Installation

1. Clone the repository:
\`\`\`bash
git clone <your-repo-url>
cd bloc-ai
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:

Create a \`.env.local\` file:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

4. Set up Supabase database:

Run the following SQL in your Supabase SQL editor:

\`\`\`sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- User preferences
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  topics TEXT[],
  reading_days TEXT,
  preferred_time TIME,
  timezone TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- OTP codes
CREATE TABLE otp_codes (
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Blocs
CREATE TABLE blocs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW(),
  continuity_reference TEXT,
  status TEXT DEFAULT 'pending'
);

-- Reading history
CREATE TABLE reading_history (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bloc_id UUID REFERENCES blocs(id) ON DELETE CASCADE,
  completed_at TIMESTAMP DEFAULT NOW(),
  reading_progress INTEGER DEFAULT 100,
  PRIMARY KEY (user_id, bloc_id)
);

-- Streaks
CREATE TABLE streaks (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_read_date DATE
);

-- Indexes for performance
CREATE INDEX idx_blocs_user_date ON blocs(user_id, scheduled_date);
CREATE INDEX idx_reading_history_user ON reading_history(user_id);
CREATE INDEX idx_otp_email ON otp_codes(email);
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
bloc-ai/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── (auth)/         # Authentication routes
│   │   ├── (onboarding)/   # Onboarding flow
│   │   ├── dashboard/      # Main dashboard
│   │   ├── bloc/           # Bloc reader
│   │   ├── archive/        # Reading archive
│   │   ├── settings/       # User settings
│   │   ├── admin/          # Admin dashboard
│   │   └── api/            # API routes
│   ├── components/         # React components
│   │   ├── ui/            # Base UI components
│   │   ├── auth/          # Auth components
│   │   ├── dashboard/     # Dashboard components
│   │   └── reader/        # Reader components
│   ├── lib/               # Utilities
│   │   ├── db.ts         # Database functions
│   │   ├── ai.ts         # AI integration
│   │   └── auth.ts       # Auth helpers
│   ├── types/            # TypeScript types
│   └── styles/           # Global styles
├── public/               # Static assets
└── package.json
\`\`\`

## Design Principles

- **Minimal & Calm**: White canvas with purple gradient accents
- **Smooth Interactions**: 200ms transitions, micro-animations
- **Readable Typography**: Inter font, 18px base for reading
- **Mobile-First**: Responsive design for all screens
- **Accessible**: High contrast, clear CTAs

## Development

\`\`\`bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
\`\`\`

## Deployment

The easiest way to deploy is with [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables
4. Deploy!

## MVP Scope

✅ Email + OTP authentication  
✅ 5-step onboarding flow  
✅ Daily dashboard with Bloc cards  
✅ Elegant Bloc reader  
✅ Archive with calendar view  
✅ Settings management  
✅ AI-generated personalized content  
✅ Streak tracking  
✅ Admin metrics dashboard  

## Future Roadmap

- 📱 Mobile app (React Native)
- 🎨 Premium themed learning packs
- 🔔 Push notifications
- 🌐 Social sharing & community
- 💳 Subscription tiers
- 🎓 Advanced personalization

## License

MIT

## Author

Built with ❤️ as a portfolio project showcasing product thinking and "vibe coding" ability.

---

**One 10-minute Bloc a day to build a smarter, stronger mind — block by block.**
