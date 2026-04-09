@AGENTS.md

# Careetor — AI-Powered Job Application Platform

## Overview

Careetor is a Next.js 16 SaaS web application that automates job searching: discovering relevant openings, evaluating fit via AI, generating tailored CVs, drafting applications, and tracking the entire pipeline.

## Tech Stack

- **Framework**: Next.js 16.2 (App Router, Server Components, Server Actions)
- **Language**: TypeScript
- **UI**: shadcn/ui + Tailwind CSS v4 + Radix primitives
- **State**: React Query (TanStack) + Zustand
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **Auth**: better-auth v1.6
- **AI**: Vercel AI SDK v6 + Ollama (local Qwen 2.5 32B, free, no limits)
- **Icons**: lucide-react
- **Charts**: recharts

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── (auth)/       # Login, register (no dashboard layout)
│   ├── (dashboard)/  # All authenticated pages (with sidebar)
│   └── api/          # API routes (auth, webhooks)
├── actions/          # Server Actions (business logic)
├── components/
│   ├── ui/           # shadcn/ui components (do not edit)
│   ├── layout/       # Sidebar, header, mobile-nav
│   ├── shared/       # Reusable: score-badge, status-badge, empty-state
│   ├── cv/           # CV editor, upload zone
│   ├── jobs/         # Job card, table
│   ├── evaluation/   # Streaming display, radar chart, block cards
│   ├── application/  # Cover letter editor, answer editor
│   ├── interview/    # Story cards, prep report
│   ├── analytics/    # Charts: funnel, score distribution
│   └── scanner/      # Portal list, scan status
├── lib/
│   ├── db/           # Drizzle schema + connection
│   ├── ai/           # Ollama/LLM prompts + Zod schemas
│   ├── auth.ts       # better-auth server config
│   ├── auth-client.ts # Client-side auth
│   ├── providers.tsx  # React Query + Theme + Tooltip providers
│   └── utils.ts      # cn() helper
├── hooks/            # Custom React hooks
└── types/            # Shared TypeScript types
```

## Conventions

- Server Components by default; `"use client"` only for interactivity
- Server Actions in `src/actions/` with `"use server"` directive
- All DB queries go through Drizzle ORM
- AI calls via Vercel AI SDK `generateText` + `generateObject` (Ollama backend)
- Import paths use `@/` alias
- Component imports: `@/components/ui/...` for shadcn, `@/components/shared/...` for custom
- Types in `@/types`, never inline complex type definitions

## Database

Schema defined in `src/lib/db/schema.ts` using Drizzle ORM with PostgreSQL.
Run migrations: `npx drizzle-kit push`
Generate migrations: `npx drizzle-kit generate`

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values.
Required: DATABASE_URL, BETTER_AUTH_SECRET
Optional: OLLAMA_BASE_URL (default: http://localhost:11434/v1), OLLAMA_MODEL (default: qwen2.5:32b)
Ollama must be running locally: `ollama serve`
