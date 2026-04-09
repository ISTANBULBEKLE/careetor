# Careetor

AI-powered job application automation platform. Evaluate job descriptions, generate tailored CVs, draft applications, and track your pipeline — all powered by a local LLM (Ollama) at zero cost.

## Tech Stack

- **Next.js 16.2** (App Router, Server Components, Server Actions)
- **TypeScript** + **React 19**
- **shadcn/ui** + **Tailwind CSS v4** (UI components)
- **Drizzle ORM** + **Neon PostgreSQL** (database)
- **better-auth** (authentication)
- **Ollama** + **Qwen 2.5 32B** (local AI, free, no limits)
- **Vercel AI SDK v6** (AI integration layer)
- **recharts** (analytics charts)
- **unpdf** (PDF text extraction)

## Features

- **CV Management** — Upload PDF/text, AI parses into editable sections
- **Job Pipeline** — Add jobs via URL (auto-fetch + parse) or paste text
- **AI Evaluation** — 10-dimension A-F scoring against your CV
- **Tailored CVs** — ATS-optimized PDF generation per job
- **Application Drafting** — Cover letters and form answer generation
- **Application Tracker** — Kanban + table views with status management
- **Interview Prep** — STAR+R story bank and company intelligence
- **Analytics** — Funnel, score distribution, archetype performance
- **Portal Scanner** — Company watchlist with 45+ pre-configured companies

## Quick Start

```bash
# Prerequisites: Node.js 22+, Ollama installed

# 1. Install Ollama model
ollama pull qwen2.5:32b

# 2. Start Ollama
ollama serve

# 3. Install dependencies
npm install

# 4. Configure environment
cp .env.example .env.local
# Edit .env.local: set DATABASE_URL and BETTER_AUTH_SECRET

# 5. Push database schema
npx drizzle-kit push

# 6. Start dev server
npm run dev

# 7. Open http://localhost:3000
```

See [START.md](./START.md) for detailed setup instructions.

## Documentation

| File | Description |
|------|-------------|
| [START.md](./START.md) | Step-by-step setup and run guide |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture, diagrams, data flows |
| [CLAUDE.md](./CLAUDE.md) | AI agent instructions and conventions |

## Project Structure

```
src/
├── app/              # Pages (App Router)
│   ├── (auth)/       # Login, register
│   ├── (dashboard)/  # All authenticated pages (17 routes)
│   └── api/          # Auth API route
├── actions/          # Server Actions (7 files)
├── components/       # React components (41 files)
│   ├── ui/           # shadcn/ui (22 components)
│   ├── layout/       # Sidebar, header, mobile-nav
│   └── shared/       # Score badge, status badge, etc.
├── lib/
│   ├── db/           # Drizzle schema (18 tables)
│   ├── ai/           # Ollama client, prompts, schemas
│   └── auth.ts       # better-auth config
└── types/            # Shared TypeScript types
```

## License

Private project.
