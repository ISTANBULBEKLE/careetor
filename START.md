# Careetor — Setup & Run Guide

## Prerequisites

- **Node.js** v22+ (you have v22.15.1)
- **npm** v10+ (you have v10.9.2)
- A **Neon** PostgreSQL database (free tier works)
- An **Anthropic API key** for Claude AI features

---

## Step 1: Create a Neon PostgreSQL Database

1. Go to [https://neon.tech](https://neon.tech) and sign up (free tier: 0.5 GB storage)
2. Click **"New Project"**
3. Name it `careetor`, pick the closest region, click **Create**
4. On the dashboard, copy the **connection string** — it looks like:
   ```
   postgresql://neondb_owner:abc123@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. Keep this string ready for the next step

---

## Step 2: Get an Anthropic API Key

1. Go to [https://console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to **API Keys** in the sidebar
4. Click **"Create Key"**, name it `careetor`
5. Copy the key — it starts with `sk-ant-api03-...`

---

## Step 3: Configure Environment Variables

Open the file `.env.local` in the project root:

```bash
cd /Users/ekip.kalir/Projects/Personal/careetor
```

Edit `.env.local` and fill in these two required values:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database — paste your Neon connection string here
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-YOUR-HOST.aws.neon.tech/neondb?sslmode=require

# Auth — generate a random secret (run: openssl rand -hex 32)
BETTER_AUTH_SECRET=paste-a-random-64-char-hex-string-here

# Social Auth (optional — skip for now, email/password works without these)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# AI — paste your Anthropic API key here
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE

# Storage (optional — not needed for core features)
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_KEY=
```

### Generate the auth secret:

```bash
openssl rand -hex 32
```

Copy the output and paste it as `BETTER_AUTH_SECRET`.

### Minimum required variables:

| Variable | Required | Where to get it |
|----------|----------|----------------|
| `DATABASE_URL` | Yes | Neon dashboard (Step 1) |
| `BETTER_AUTH_SECRET` | Yes | `openssl rand -hex 32` |
| `ANTHROPIC_API_KEY` | Yes | Anthropic console (Step 2) |
| `GOOGLE_CLIENT_ID` | No | Google Cloud Console (for Google login) |
| `GITHUB_CLIENT_ID` | No | GitHub Developer Settings (for GitHub login) |

---

## Step 4: Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
cd /Users/ekip.kalir/Projects/Personal/careetor
npm install
```

---

## Step 5: Push Database Schema

This creates all the tables in your Neon database:

```bash
npx drizzle-kit push
```

You should see output like:
```
[✓] Changes applied to database
```

This creates 18 tables: users, sessions, accounts, profiles, cvs, cv_sections, jobs, evaluations, evaluation_blocks, tailored_cvs, applications, application_answers, stories, interview_preps, portals, scans, scan_history, user_settings, notifications.

---

## Step 6: Run the Development Server

```bash
npm run dev
```

The app starts at **http://localhost:3000**.

You should see:
```
▲ Next.js 16.2.3 (Turbopack)
- Local:    http://localhost:3000
- Network:  http://192.168.x.x:3000
✓ Starting...
✓ Ready in Xs
```

---

## Step 7: First Use

1. Open **http://localhost:3000** in your browser
2. You'll see the Careetor landing page
3. Click **"Get Started Free"** to go to the registration page
4. Create an account with email and password
5. You'll be redirected to the **Dashboard**

### First things to do:

1. **Upload your CV**: Go to **My CV** > **Upload CV** > Paste your CV text > Click "Upload & Parse"
2. **Set up your profile**: Go to **Settings** > **Edit Career Profile** > Fill in your target roles, archetypes, salary range
3. **Add your first job**: Go to **Jobs** > **Add Job** > Paste a job description or URL > Click "Add Job"
4. **Evaluate it**: Open the job > Click **"Evaluate Now"** (uses Claude AI to score it)
5. **Set up portal scanning**: Go to **Portals** > Add companies you're interested in

---

## Available Pages

| URL | What it does |
|-----|-------------|
| `/` | Landing page |
| `/login` | Sign in |
| `/register` | Create account |
| `/dashboard` | Overview with stats, quick-add, recent evaluations |
| `/cv` | Manage your CVs |
| `/cv/upload` | Upload and parse a new CV |
| `/jobs` | Job pipeline with filtering and sorting |
| `/jobs/new` | Add a new job (URL or text) |
| `/jobs/[id]` | Job detail: evaluation, application, interview prep |
| `/jobs/scan` | Scan company portals for new openings |
| `/applications` | Kanban + table view of applications |
| `/interviews` | Interview prep hub |
| `/interviews/stories` | STAR+R story bank |
| `/analytics` | Pipeline funnel, score distribution, insights |
| `/portals` | Manage company watchlist |
| `/settings` | Theme, filters, scan frequency |
| `/settings/profile` | Career profile, archetypes, salary, links |

---

## Available Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx drizzle-kit push      # Push schema changes to database
npx drizzle-kit generate  # Generate migration files
npx drizzle-kit studio    # Open Drizzle Studio (visual DB browser)
```

---

## Optional: Set Up Google OAuth

To enable "Sign in with Google":

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services** > **Credentials**
4. Click **"Create Credentials"** > **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy the **Client ID** and **Client Secret**
8. Add to `.env.local`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
   ```

---

## Optional: Set Up GitHub OAuth

To enable "Sign in with GitHub":

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Homepage URL: `http://localhost:3000`
4. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy the **Client ID** and generate a **Client Secret**
6. Add to `.env.local`:
   ```env
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```

---

## Troubleshooting

### "No database connection string was provided"
Your `DATABASE_URL` in `.env.local` is empty or missing. Make sure it's set and the Neon database is created.

### "Invalid API key" when evaluating jobs
Your `ANTHROPIC_API_KEY` is missing, expired, or incorrect. Check it in `.env.local`.

### Build fails with TypeScript errors
Run `npm run build` to see the full error. If you've modified files, the type error message will point you to the exact line.

### "Module not found" errors
Run `npm install` to ensure all dependencies are installed.

### Port 3000 already in use
Kill the existing process or use a different port:
```bash
npm run dev -- -p 3001
```

### Database schema changes
If you modify `src/lib/db/schema.ts`, push the changes:
```bash
npx drizzle-kit push
```

---

## Project Structure (Quick Reference)

```
careetor/
├── src/
│   ├── app/                  # Pages (App Router)
│   │   ├── (auth)/           # Login, Register
│   │   ├── (dashboard)/      # All authenticated pages
│   │   └── api/              # API routes
│   ├── actions/              # Server Actions (business logic)
│   ├── components/           # React components
│   │   ├── ui/               # shadcn/ui (don't edit)
│   │   ├── layout/           # Sidebar, header
│   │   └── shared/           # Reusable components
│   ├── lib/
│   │   ├── db/schema.ts      # Database schema
│   │   ├── ai/prompts/       # Claude AI prompts
│   │   ├── auth.ts           # Auth configuration
│   │   └── providers.tsx     # React providers
│   └── types/index.ts        # Shared types
├── .env.local                # Your environment variables
├── .env.example              # Template
├── drizzle.config.ts         # Database config
└── package.json
```

---

## Quick Start (TL;DR)

```bash
cd /Users/ekip.kalir/Projects/Personal/careetor

# 1. Set environment variables
#    Edit .env.local with DATABASE_URL, BETTER_AUTH_SECRET, ANTHROPIC_API_KEY

# 2. Generate auth secret
openssl rand -hex 32
# Copy output → paste as BETTER_AUTH_SECRET in .env.local

# 3. Push database schema
npx drizzle-kit push

# 4. Start the app
npm run dev

# 5. Open http://localhost:3000 and register
```
