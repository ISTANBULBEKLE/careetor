# Careetor — Setup & Run Guide

## Prerequisites

- **Node.js** v22+
- **npm** v10+
- **Ollama** installed ([https://ollama.com](https://ollama.com))
- A **Neon** PostgreSQL database (free tier works)

---

## Step 1: Install Ollama & Pull the AI Model

If you don't have Ollama installed:
```bash
# macOS
brew install ollama

# Or download from https://ollama.com
```

Pull the Qwen 2.5 32B model (~19GB download):
```bash
ollama pull qwen2.5:32b
```

Start the Ollama server:
```bash
ollama serve
```

> Keep this running in a separate terminal. The app connects to Ollama at `http://localhost:11434`.

### Model Options by RAM

| Your RAM | Model | Command |
|----------|-------|---------|
| **16GB** | Qwen 2.5 14B | `ollama pull qwen2.5:14b` |
| **32GB** | Qwen 2.5 32B (recommended) | `ollama pull qwen2.5:32b` |
| **64GB+** | Qwen 2.5 72B | `ollama pull qwen2.5:72b` |

If using a different model, update `OLLAMA_MODEL` in `.env.local`.

---

## Step 2: Create a Neon PostgreSQL Database

1. Go to [https://neon.tech](https://neon.tech) and sign up (free tier: 0.5 GB storage)
2. Click **"New Project"**
3. Name it `careetor`, pick the closest region, click **Create**
4. On the dashboard, copy the **connection string** — it looks like:
   ```
   postgresql://neondb_owner:abc123@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

## Step 3: Configure Environment Variables

Edit `.env.local` in the project root:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database — paste your Neon connection string here
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-YOUR-HOST.aws.neon.tech/neondb?sslmode=require

# Auth — generate a random secret (run: openssl rand -hex 32)
BETTER_AUTH_SECRET=paste-a-random-64-char-hex-string-here

# AI — Ollama (local, free, no limits)
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=qwen2.5:32b

# Social Auth (optional — skip for now, email/password works without these)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Storage (optional — not needed for core features)
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_KEY=
```

### Generate the auth secret:

```bash
openssl rand -hex 32
```

### Minimum required:

| Variable | Required | Where to get it |
|----------|----------|----------------|
| `DATABASE_URL` | Yes | Neon dashboard (Step 2) |
| `BETTER_AUTH_SECRET` | Yes | `openssl rand -hex 32` |
| `OLLAMA_BASE_URL` | No | Defaults to `http://localhost:11434/v1` |
| `OLLAMA_MODEL` | No | Defaults to `qwen2.5:32b` |

---

## Step 4: Install Dependencies

```bash
cd /Users/ekip.kalir/Projects/Personal/careetor
npm install
```

---

## Step 5: Push Database Schema

This creates all 18 tables in your Neon database:

```bash
npx drizzle-kit push
```

---

## Step 6: Run the Development Server

Make sure Ollama is running first (`ollama serve`), then:

```bash
npm run dev
```

The app starts at **http://localhost:3000**.

---

## Step 7: First Use

1. Open **http://localhost:3000** in your browser
2. Click **"Get Started Free"** to register
3. Create an account with email and password (this is a Careetor-only password, not your email password)

### First things to do:

1. **Upload your CV**: My CV > Upload CV > Drop a PDF or paste text > Click "Upload & Parse"
2. **Set up your profile**: Settings > Edit Career Profile > Fill in target roles, archetypes, salary
3. **Add your first job**: Jobs > Add Job > Paste a URL (auto-fetches) or paste JD text
4. **Evaluate it**: Open the job > Click "Evaluate Now" (runs locally via Ollama)
5. **Set up portal scanning**: Portals > Add companies you're interested in

---

## Available Pages

| URL | What it does |
|-----|-------------|
| `/` | Landing page |
| `/login` | Sign in |
| `/register` | Create account |
| `/dashboard` | Overview with stats, quick-add, recent evaluations |
| `/cv` | Manage your CVs |
| `/cv/upload` | Upload and parse a new CV (PDF, TXT, or paste) |
| `/jobs` | Job pipeline with filtering and sorting |
| `/jobs/new` | Add a new job (URL auto-fetch or text) |
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

# Ollama
ollama serve               # Start Ollama server (required)
ollama list                # List installed models
ollama pull qwen2.5:32b    # Download/update model
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

### "Connection refused" or AI features not working
Ollama isn't running. Start it:
```bash
ollama serve
```

### "No database connection string was provided"
`DATABASE_URL` in `.env.local` is empty. Set your Neon connection string.

### Build fails with TypeScript errors
Run `npm run build` to see the full error with file and line number.

### "Module not found" errors
Run `npm install` to ensure all dependencies are installed.

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### AI responses are slow
Local models depend on your hardware. Qwen 2.5 32B needs ~20GB RAM. If too slow, try a smaller model:
```bash
ollama pull qwen2.5:14b
# Then update OLLAMA_MODEL=qwen2.5:14b in .env.local
```

### Database schema changes
```bash
npx drizzle-kit push
```

---

## Project Structure

```
careetor/
├── src/
│   ├── app/                  # Pages (App Router)
│   │   ├── (auth)/           # Login, Register
│   │   ├── (dashboard)/      # All authenticated pages
│   │   └── api/              # Auth API route
│   ├── actions/              # Server Actions (business logic)
│   ├── components/           # React components
│   │   ├── ui/               # shadcn/ui (don't edit)
│   │   ├── layout/           # Sidebar, header
│   │   └── shared/           # Reusable components
│   ├── lib/
│   │   ├── db/schema.ts      # Database schema (18 tables)
│   │   ├── ai/               # Ollama client + prompts + schemas
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

# 1. Start Ollama (in a separate terminal)
ollama serve

# 2. Edit .env.local with DATABASE_URL and BETTER_AUTH_SECRET

# 3. Generate auth secret
openssl rand -hex 32

# 4. Push database schema
npx drizzle-kit push

# 5. Start the app
npm run dev

# 6. Open http://localhost:3000 and register
```
