# Careetor — Architecture Documentation

## Table of Contents

1. [System Overview](#1-system-overview)
2. [High-Level Architecture Diagram](#2-high-level-architecture-diagram)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Component Hierarchy](#4-component-hierarchy)
5. [Server Actions Layer](#5-server-actions-layer)
6. [Database Schema & Relationships](#6-database-schema--relationships)
7. [AI/LLM Layer](#7-aillm-layer)
8. [Authentication Flow](#8-authentication-flow)
9. [State Management](#9-state-management)
10. [Key User Journey Flows](#10-key-user-journey-flows)
11. [External Dependencies](#11-external-dependencies)
12. [Architectural Gaps & TODOs](#12-architectural-gaps--todos)

---

## 1. System Overview

Careetor is a monolithic Next.js 16 application. There is no separate backend service — everything runs within the Next.js process:

- **Frontend**: React 19 with App Router (Server + Client Components)
- **Backend**: Next.js Server Actions (no API routes except auth)
- **Database**: Neon PostgreSQL via Drizzle ORM (HTTP driver, serverless-compatible)
- **AI**: Anthropic Claude API via Vercel AI SDK + @ai-sdk/anthropic (Opus 4.6 + Sonnet 4.6)
- **Auth**: better-auth (self-hosted, cookie-based sessions)

```
┌──────────────────────────────────────────────────────────┐
│                     BROWSER (Client)                     │
│                                                          │
│  React 19 + App Router + shadcn/ui + Tailwind v4         │
│  Session via cookie (better-auth)                        │
│  Direct Server Action calls (no REST, no GraphQL)        │
└──────────────────────┬───────────────────────────────────┘
                       │ RSC Protocol (Server Actions)
                       ▼
┌──────────────────────────────────────────────────────────┐
│                  NEXT.JS 16 SERVER                       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐   │
│  │ Server       │  │ API Route    │  │ Server        │   │
│  │ Components   │  │ /api/auth/*  │  │ Actions       │   │
│  │ (SSR pages)  │  │ (better-auth)│  │ (src/actions/)│   │
│  └──────────────┘  └──────────────┘  └───────┬───────┘   │
│                                              │           │
│                    ┌─────────────────────────┼────────┐  │
│                    │                         │        │  │
│                    ▼                         ▼        │  │
│           ┌──────────────┐          ┌─────────────┐   │  │
│           │  Drizzle ORM │          │ Vercel AI   │   │  │
│           │  (neon-http) │          │ SDK v6      │   │  │
│           └──────┬───────┘          └──────┬──────┘   │  │
│                  │                         │          │  │
└──────────────────┼─────────────────────────┼──────────┘  │
                   │                         │             │
                   ▼                         ▼
          ┌──────────────┐          ┌──────────────┐
          │    Neon      │          │   Anthropic     │
          │  PostgreSQL  │          │  Claude   │
          │  (cloud)     │          │  (cloud)     │
          └──────────────┘          └──────────────┘
```

---

## 2. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CAREETOR APPLICATION                         │
│                                                                     │
│  PRESENTATION LAYER                                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                                                                │ │
│  │  Landing Page    Auth Pages        Dashboard Shell             │ │
│  │  (/)             (/login,          (/dashboard/*)              │ │
│  │  Server Comp     /register)        Client Component            │ │
│  │                  Client Comp       ┌────────┬─────────────┐    │ │
│  │                                    │Sidebar │ Header       │   │ │
│  │                                    │(collap-│ (breadcrumbs,│   │ │
│  │                                    │ sible) │  theme, nav) │   │ │
│  │                                    ├────────┴───────────── ┤   │ │
│  │                                    │                       │   │ │
│  │                                    │   Page Content        │   │ │
│  │                                    │   (17 routes)         │   │ │
│  │                                    │                       │   │ │
│  │                                    └────────────────────── ┘   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  BUSINESS LOGIC LAYER (Server Actions)                              │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                                                                │ │
│  │  cv.actions        job.actions       evaluation.actions        │ │
│  │  ├─ createCV       ├─ createJob      ├─ evaluateJob (AI)       │ │
│  │  ├─ parseCV (AI)   ├─ getUserJobs    └─ getEvaluation          │ │
│  │  ├─ getUserCVs     ├─ updateJobStatus                          │ │
│  │  └─ updateSection  └─ getJobStats    application.actions       │ │
│  │                                       ├─ generateCoverLetter   │ │
│  │  fetch-url.actions  settings.actions  ├─ generateAppAnswers    │ │
│  │  └─ fetchAndParse   ├─ getProfile    └─ getApplication         │ │
│  │     JobUrl (AI)     └─ upsertProfile                           │ │
│  │                                       parse-file.actions       │ │
│  │                                       └─ extractTextFromPDF    │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  DATA & AI LAYER                                                    │
│  ┌─────────────────────────┐  ┌──────────────────────────────────┐  │
│  │  Drizzle ORM            │  │  AI Client                       │  │
│  │                         │  │                                  │  │
│  │  18 Tables:             │  │  Opus 4.6 (evaluations):                       │  │
│  │  ├─ Auth: users,        │  │  └─ Evaluation text (A-F blocks) │  │
│  │  │  sessions, accounts  │  │                                  │  │
│  │  ├─ CV: cvs, sections   │  │  Claude Sonnet 4.6 (fast extraction & generation):                     │  │
│  │  ├─ Jobs: jobs, evals,  │  │  ├─ CV parsing                   │  │
│  │  │  eval_blocks         │  │  ├─ Score extraction             │  │
│  │  ├─ Apps: applications, │  │  ├─ URL → JD parsing             │  │
│  │  │  answers, tailored   │  │  ├─ Cover letter                 │  │
│  │  ├─ Interview: stories, │  │  └─ Application answers          │  │
│  │  │  preps               │  │                                  │  │
│  │  ├─ Scan: portals,      │  │  Prompt Library:                 │  │
│  │  │  scans, history      │  │  └─ 6 templates (not yet wired)  │  │
│  │  └─ Settings, notifs    │  │                                  │  │
│  └─────────────────────────┘  └──────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
         │                                │
         ▼                                ▼
┌──────────────────┐            ┌──────────────────┐
│  Neon PostgreSQL │            │     Anthropic       │
│  (serverless)    │            │  (Claude 4.6)  │
└──────────────────┘            └──────────────────┘
```

---

## 3. Frontend Architecture

### Route Structure

```
src/app/
├── layout.tsx                 # Root: Providers + Sonner Toaster
├── page.tsx                   # Landing page (Server Component)
│
├── (auth)/                    # Route group — no sidebar
│   ├── layout.tsx             # Centered card layout, gradient bg
│   ├── login/page.tsx         # Client: email/password + OAuth
│   └── register/page.tsx      # Client: name + email/password + OAuth
│
├── (dashboard)/               # Route group — sidebar + header
│   ├── layout.tsx             # Client: Sidebar + Header + collapsed state
│   ├── dashboard/page.tsx     # Overview: stats, quick-add, recent evals
│   ├── cv/
│   │   ├── page.tsx           # Server Component (only one!) — CV list
│   │   ├── upload/page.tsx    # Client: drag-drop + PDF parse + AI parse
│   │   └── [id]/page.tsx      # Client: CV section editor
│   ├── jobs/
│   │   ├── page.tsx           # Client: filterable job table
│   │   ├── new/page.tsx       # Client: URL fetch or text input
│   │   ├── [id]/page.tsx      # Client: job detail + eval + application tabs
│   │   └── scan/page.tsx      # Client: portal scanner (mock)
│   ├── applications/page.tsx  # Client: kanban + table views
│   ├── interviews/
│   │   ├── page.tsx           # Client: active interviews + story preview
│   │   └── stories/page.tsx   # Client: STAR+R story bank CRUD
│   ├── analytics/page.tsx     # Client: charts (recharts, dynamic import)
│   ├── portals/page.tsx       # Client: company watchlist CRUD
│   └── settings/
│       ├── page.tsx           # Client: general, filters, scan, account
│       └── profile/page.tsx   # Client: career profile editor
│
└── api/
    └── auth/[...all]/route.ts # better-auth catch-all handler
```

### Server vs Client Component Split

```
                    ┌─────────────────────────────┐
                    │        Root Layout           │
                    │     (Server Component)       │
                    │  Wraps: <Providers>           │
                    └─────────────┬───────────────┘
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
          ┌──────▼──────┐  ┌─────▼──────┐  ┌──────▼──────┐
          │  Landing (/) │  │ Auth Group │  │  Dashboard  │
          │   Server     │  │  Server    │  │   Group     │
          │   Component  │  │  Layout    │  │   Client    │
          └──────────────┘  └─────┬──────┘  │   Layout    │
                                  │         └──────┬──────┘
                           ┌──────▼──────┐         │
                           │ Login/Reg   │    ┌────▼────────┐
                           │  Client     │    │ All Pages   │
                           │  Components │    │ Client Comp │
                           └─────────────┘    │ (except /cv │
                                              │  which is   │
                                              │  Server)    │
                                              └─────────────┘
```

---

## 4. Component Hierarchy

```
src/components/
│
├── ui/                          # shadcn/ui (22 components, DO NOT EDIT)
│   ├── button.tsx               #   Base UI primitives + cva variants
│   ├── card.tsx                 #   Used everywhere for content sections
│   ├── table.tsx                #   Jobs list, applications, portals
│   ├── tabs.tsx                 #   Job detail (Overview/Eval/App/Interview)
│   ├── dialog.tsx               #   Confirmations, add forms
│   ├── sheet.tsx                #   Mobile navigation
│   ├── dropdown-menu.tsx        #   Action menus, user menu
│   ├── select.tsx               #   Status pickers, filters
│   ├── badge.tsx                #   Score/status indicators
│   ├── input.tsx / textarea.tsx #   All forms
│   ├── separator.tsx            #   Section dividers
│   ├── skeleton.tsx             #   Loading states
│   ├── progress.tsx             #   CV parse, scan progress
│   ├── switch.tsx               #   Portal enable/disable
│   ├── collapsible.tsx          #   CV section editor
│   ├── scroll-area.tsx          #   Sidebar navigation
│   ├── tooltip.tsx              #   Collapsed sidebar labels
│   ├── popover.tsx              #   Date pickers (future)
│   ├── sonner.tsx               #   Toast notifications
│   ├── avatar.tsx               #   User avatar in sidebar
│   └── label.tsx                #   Form labels
│
├── layout/                      # App shell
│   ├── sidebar.tsx              #   Collapsible nav (8 items) + user menu
│   ├── header.tsx               #   Breadcrumbs + New Job + theme toggle
│   └── mobile-nav.tsx           #   Sheet-based mobile nav
│
├── shared/                      # Reusable across features
│   ├── score-badge.tsx          #   Color-coded score (4.5=green, <3.5=red)
│   ├── status-badge.tsx         #   Color-coded job status
│   ├── empty-state.tsx          #   Icon + title + description + CTA
│   ├── loading-skeleton.tsx     #   Card, Table, Evaluation skeletons
│   ├── markdown-renderer.tsx    #   Regex-based MD→HTML (no library)
│   └── ai-streaming-text.tsx    #   Animated text display + cursor
│
├── cv/                          # CV management
│   ├── cv-editor.tsx            #   Collapsible section-by-section editor
│   └── cv-delete-button.tsx     #   Delete confirmation dialog
│
├── jobs/                        # Job pipeline
│   ├── job-table.tsx            #   Sortable table (company, score, status)
│   └── job-card.tsx             #   Card view with action menu
│
├── evaluation/                  # AI evaluation display
│   ├── evaluation-stream.tsx    #   Trigger + loading + result display
│   ├── score-radar.tsx          #   10-dimension radar chart (recharts)
│   └── block-card.tsx           #   Single A-F block with markdown
│
├── application/                 # Application drafting
│   └── cover-letter-editor.tsx  #   Generate + edit + copy cover letter
│
├── analytics/                   # Dashboard charts
│   ├── funnel-chart.tsx         #   Horizontal bar (dynamic import)
│   └── score-distribution.tsx   #   Score histogram (dynamic import)
│
├── scanner/                     # (Placeholder — no components yet)
└── interview/                   # (Placeholder — no components yet)
```

### Component Composition — Job Detail Page

```
/jobs/[id]/page.tsx
│
├── Header Section
│   ├── Company name + Role
│   ├── <StatusBadge status={job.status} />
│   ├── <ScoreBadge score={job.score} />
│   └── <Select> (status dropdown)
│
└── <Tabs>
    ├── "Overview"
    │   ├── <MarkdownRenderer content={job.jdText} />
    │   └── Metadata sidebar (location, remote, salary)
    │
    ├── "Evaluation"
    │   ├── If NOT evaluated:
    │   │   └── <EvaluationStream jobId userId cvText onComplete />
    │   │       └── Button "Evaluate Now" → evaluateJob() → AiStreamingText
    │   │
    │   └── If evaluated:
    │       ├── <ScoreRadar scores={evaluation.scoresJson} />
    │       ├── Score dimension bars (10 items)
    │       ├── Gaps list
    │       ├── Keywords cloud
    │       └── <Tabs> A through F
    │           └── <BlockCard block title content />
    │               └── <MarkdownRenderer />
    │
    ├── "Application"
    │   ├── <CoverLetterEditor jobId userId />
    │   │   └── generateCoverLetter() → textarea editor
    │   └── Notes display
    │
    └── "Interview Prep"
        └── Placeholder card
```

---

## 5. Server Actions Layer

### Action → Database → AI Mapping

```
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER ACTIONS                                │
│                                                                 │
│  cv.actions.ts                                                  │
│  ┌──────────────────┬──────────────────┬─────────────────────┐  │
│  │ createCV()       │ DB: INSERT cvs   │ AI: none            │  │
│  │ parseCV()        │ DB: SELECT cvs   │ AI: Sonnet          │  │
│  │                  │     INSERT sects  │     generateObject  │  │
│  │                  │     UPDATE cvs    │     (CV→sections)   │  │
│  │ getUserCVs()     │ DB: SELECT cvs   │ AI: none            │  │
│  │ getMasterCV()    │ DB: SELECT cvs   │ AI: none            │  │
│  │ getCVSections()  │ DB: SELECT sects │ AI: none            │  │
│  │ updateCVSection()│ DB: UPDATE sects │ AI: none            │  │
│  │ deleteCV()       │ DB: DELETE cvs   │ AI: none            │  │
│  └──────────────────┴──────────────────┴─────────────────────┘  │
│                                                                 │
│  job.actions.ts                                                 │
│  ┌──────────────────┬──────────────────┬─────────────────────┐  │
│  │ createJob()      │ DB: INSERT jobs  │ AI: none            │  │
│  │ getUserJobs()    │ DB: SELECT jobs  │ AI: none            │  │
│  │ getJob()         │ DB: SELECT jobs  │ AI: none            │  │
│  │ updateJobStatus()│ DB: UPDATE jobs  │ AI: none            │  │
│  │ updateJobScore() │ DB: UPDATE jobs  │ AI: none            │  │
│  │ deleteJob()      │ DB: DELETE jobs  │ AI: none            │  │
│  │ getJobStats()    │ DB: SELECT jobs  │ AI: none            │  │
│  └──────────────────┴──────────────────┴─────────────────────┘  │
│                                                                 │
│  evaluation.actions.ts                                          │
│  ┌──────────────────┬──────────────────┬─────────────────────┐  │
│  │ evaluateJob()    │ DB: SELECT jobs  │ AI: Step 1 — Opus   │  │
│  │                  │     INSERT evals │     generateText     │  │
│  │                  │     INSERT blocks│     (A-F blocks)     │  │
│  │                  │     UPDATE jobs  │     Step 2 — Sonnet  │  │
│  │                  │                  │     generateObject   │  │
│  │                  │                  │     (scores JSON)    │  │
│  │ getEvaluation()  │ DB: SELECT evals │ AI: none            │  │
│  │                  │     SELECT blocks│                     │  │
│  └──────────────────┴──────────────────┴─────────────────────┘  │
│                                                                 │
│  application.actions.ts                                         │
│  ┌──────────────────┬──────────────────┬─────────────────────┐  │
│  │ createApplication│ DB: INSERT apps  │ AI: none            │  │
│  │ generateCover    │ DB: SELECT jobs  │ AI: Sonnet          │  │
│  │   Letter()       │     UPSERT apps  │     generateText    │  │
│  │ generateApp      │ DB: SELECT jobs  │ AI: Sonnet          │  │
│  │   Answers()      │                  │     generateText    │  │
│  │ getApplication() │ DB: SELECT apps  │ AI: none            │  │
│  │ updateAppNotes() │ DB: UPDATE apps  │ AI: none            │  │
│  └──────────────────┴──────────────────┴─────────────────────┘  │
│                                                                 │
│  fetch-url.actions.ts                                           │
│  ┌──────────────────┬──────────────────┬─────────────────────┐  │
│  │ fetchAndParseJob │ DB: none         │ AI: Sonnet          │  │
│  │   Url()          │ HTTP: fetch(url) │     generateObject  │  │
│  │                  │ + HTML strip     │     (HTML→job data) │  │
│  └──────────────────┴──────────────────┴─────────────────────┘  │
│                                                                 │
│  parse-file.actions.ts                                          │
│  ┌──────────────────┬──────────────────┬─────────────────────┐  │
│  │ extractTextFrom  │ DB: none         │ AI: none            │  │
│  │   PDF()          │ Lib: unpdf       │ (uses WASM parser)  │  │
│  └──────────────────┴──────────────────┴─────────────────────┘  │
│                                                                 │
│  settings.actions.ts                                            │
│  ┌──────────────────┬──────────────────┬─────────────────────┐  │
│  │ getProfile()     │ DB: SELECT       │ AI: none            │  │
│  │ upsertProfile()  │ DB: SELECT+UP/IN │ AI: none            │  │
│  │ getSettings()    │ DB: SELECT       │ AI: none            │  │
│  │ upsertSettings() │ DB: SELECT+UP/IN │ AI: none            │  │
│  └──────────────────┴──────────────────┴─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Database Schema & Relationships

### Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                          USERS (PK: id text)                     │
│  email, name, emailVerified, image, plan, aiCredits              │
└──────┬──────────┬──────────┬──────────┬──────────┬──────────────┘
       │          │          │          │          │
       │ 1:N      │ 1:N     │ 1:1      │ 1:N     │ 1:1
       ▼          ▼          ▼          ▼          ▼
┌──────────┐ ┌─────────┐ ┌────────┐ ┌──────┐ ┌──────────────┐
│ sessions │ │accounts │ │profiles│ │ cvs  │ │user_settings │
│          │ │         │ │        │ │      │ │              │
│ token    │ │provider │ │headline│ │name  │ │titleFilter+  │
│ expires  │ │password │ │targets │ │master│ │titleFilter-  │
│ ip,ua    │ │oauth    │ │salary  │ │raw   │ │scanFrequency │
└──────────┘ └─────────┘ │archtyps│ │parsed│ │theme         │
                         │links   │ └──┬───┘ └──────────────┘
                         └────────┘    │
                                       │ 1:N
                              ┌────────▼────────┐
                              │   cv_sections   │
                              │ type, title,    │
                              │ content, order  │
                              └─────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                     JOBS (PK: id text)                           │
│  userId→users, company, companySlug, role, jdText, status,       │
│  score, detectedArchetype, source, sourceUrl                     │
│  UNIQUE(userId, companySlug, role)                                │
└──────┬──────────┬──────────┬──────────┬──────────────────────────┘
       │          │          │          │
       │ 1:1      │ 1:N     │ 1:1      │ 1:1
       ▼          ▼          ▼          ▼
┌────────────┐ ┌──────────┐ ┌────────────┐ ┌────────────────┐
│evaluations │ │tailored  │ │applications│ │interview_preps │
│            │ │  _cvs    │ │            │ │                │
│overallScore│ │htmlContent│ │coverLetter │ │processOverview │
│scoresJson  │ │keywords  │ │appliedAt   │ │roundsJson      │
│archetype   │ │pdfUrl    │ │notes       │ │likelyQuestions │
│summary     │ │pdfFormat │ │            │ │techChecklist   │
│recommend.  │ └──────────┘ └─────┬──────┘ └────────────────┘
│keywords    │                    │
│gaps        │                    │ 1:N
└─────┬──────┘              ┌─────▼──────────────┐
      │                     │application_answers │
      │ 1:N                 │question, answer    │
┌─────▼──────────────┐      │aiGenerated, edited │
│evaluation_blocks   │      └────────────────────┘
│block (A-G), title  │
│content, metadata   │
│UNIQUE(evalId,block)│
└────────────────────┘

┌──────────────────────┐     ┌──────────────────┐
│   portals            │     │   stories        │
│   userId→users       │     │   userId→users   │
│   company, url       │     │   STAR+R fields  │
│   atsType, method    │     │   tags, usedCount│
│   enabled            │     └──────────────────┘
│   UNIQUE(userId,slug)│
└──────────┬───────────┘
           │ referenced by
┌──────────▼───────────┐     ┌──────────────────┐
│   scans              │     │  notifications   │
│   userId→users       │     │  userId→users    │
│   status, jobsFound  │     │  type, title     │
└──────────┬───────────┘     │  read, data      │
           │ 1:N             └──────────────────┘
┌──────────▼───────────┐
│   scan_history       │
│   url, company, role │
│   result, seenAt     │
└──────────────────────┘
```

### Table Count: 18 tables

| Cluster | Tables | Count |
|---------|--------|-------|
| Auth | users, sessions, accounts, verifications | 4 |
| Profile | profiles | 1 |
| CV | cvs, cv_sections | 2 |
| Jobs | jobs, evaluations, evaluation_blocks | 3 |
| Applications | tailored_cvs, applications, application_answers | 3 |
| Interview | stories, interview_preps | 2 |
| Scanning | portals, scans, scan_history | 3 |
| Settings | user_settings, notifications | 2 |

---

## 7. AI/LLM Layer

### Model Usage

```
┌─────────────────────────────────────────────────────────┐
│                    AI OPERATIONS                        │
│                                                         │
│  Claude 4.6 via Anthropic (heavyweight reasoning)        │
│  ┌───────────────────────────────────────────────────┐  │
│  │ evaluateJob() — Step 1                            │  │
│  │ generateText() → 6000 tokens max                  │  │
│  │ Input: JD + CV (~4-8K tokens)                     │  │
│  │ Output: Full A-F block evaluation (~4-6K tokens)  │  │
│  │ Latency: ~30-60s    │  │
│  │ Cost: ~$0.30 per evaluation              │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Claude 4.6 via Anthropic (fast extraction & generation) │
│  ┌───────────────────────────────────────────────────┐  │
│  │ parseCV()           → generateObject (CV→JSON)    │  │
│  │ evaluateJob() Step2 → generateObject (text→scores)│  │
│  │ fetchAndParseJobUrl → generateObject (HTML→job)   │  │
│  │ generateCoverLetter → generateText (1500 tokens)  │  │
│  │ generateAppAnswers  → generateText (3000 tokens)  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Two-Step Evaluation Pipeline

```
Job Description + CV Text
         │
         ▼
┌─────────────────────────────┐
│  STEP 1: Claude — Generate    │
│                             │
│   Input: JD + CV            │
│   System: Career advisor    │
│   Output: Markdown text     │
│   ┌───────────────────────┐ │
│   │ ## Block A — Summary  │ │
│   │ ## Block B — CV Match │ │
│   │ ## Block C — Level    │ │
│   │ ## Block D — Comp     │ │
│   │ ## Block E — CV Plan  │ │
│   │ ## Block F — Interview│ │
│   └───────────────────────┘ │
└─────────────┬───────────────┘
              │ evalText (string)
              ▼
┌─────────────────────────────┐
│  STEP 2: Claude — Extract     │
│                             │
│   Input: JD + evalText + CV │
│   Schema: scoringSchema     │
│   Output: Structured JSON   │
│   ┌───────────────────────┐ │
│   │ { archetype,          │ │
│   │   scores: {10 dims},  │ │
│   │   overall_score,      │ │
│   │   recommendation,     │ │
│   │   keywords: [...],    │ │
│   │   gaps: [...],        │ │
│   │   summary }           │ │
│   └───────────────────────┘ │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│   STEP 3: Persist           │
│                             │
│   INSERT evaluations        │
│   INSERT evaluation_blocks  │
│   UPDATE jobs.score         │
│   UPDATE jobs.status        │
└─────────────────────────────┘
```

### Prompt Library (Written but Not Yet Wired)

```
src/lib/ai/
├── client.ts                  # anthropic client, sonnet/opus model exports
├── prompts/
│   ├── shared-context.ts      # getSharedContext(profile?) — 6 archetypes, 10 scoring dims
│   ├── evaluate-offer.ts      # buildEvaluationPrompt(jd, cv, articleDigest?)
│   ├── parse-cv.ts            # buildCVParsePrompt(rawText)
│   ├── tailor-cv.ts           # buildTailorCVPrompt(sections, jd, keywords, archetype)
│   ├── cover-letter.ts        # buildCoverLetterPrompt(jd, cv, evaluation)
│   └── application-answers.ts # buildApplicationAnswersPrompt(jd, cv, questions)
└── schemas/
    ├── evaluation.schema.ts   # evaluationOutputSchema (detailed, with types)
    └── cv-sections.schema.ts  # cvParsedOutputSchema (with metadata variants)

Status: All 6 prompt builders and both schemas are production-quality
        but actions currently use simpler inline prompts instead.
        This is a planned refactoring.
```

---

## 8. Authentication Flow

```
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│   Browser    │    │  Next.js Server  │    │  PostgreSQL   │
│   (Client)   │    │  /api/auth/*     │    │              │
└──────┬───────┘    └────────┬─────────┘    └──────┬───────┘
       │                     │                     │
       │  POST /api/auth/    │                     │
       │  sign-up/email      │                     │
       │  {name, email, pwd} │                     │
       │────────────────────>│                     │
       │                     │  INSERT users       │
       │                     │────────────────────>│
       │                     │  INSERT accounts    │
       │                     │────────────────────>│
       │                     │  INSERT sessions    │
       │                     │────────────────────>│
       │                     │                     │
       │  Set-Cookie: session│                     │
       │  {token, user}      │                     │
       │<────────────────────│                     │
       │                     │                     │
       │  useSession()       │                     │
       │  GET /api/auth/     │                     │
       │  get-session        │                     │
       │────────────────────>│  SELECT sessions    │
       │                     │  JOIN users         │
       │                     │────────────────────>│
       │                     │                     │
       │  {user: {id, name,  │                     │
       │   email, ...}}      │                     │
       │<────────────────────│                     │
       │                     │                     │
       │  Server Action call │                     │
       │  getUserJobs(userId)│                     │
       │────────────────────>│  SELECT jobs        │
       │                     │  WHERE user_id=$1   │
       │                     │────────────────────>│
       │                     │                     │
```

### Auth Protection

```
Currently Protected:     /cv (server-side redirect to /login)
NOT Protected:           All other dashboard routes (no middleware)

Session is available via:
  - Server:  auth.api.getSession({ headers: await headers() })
  - Client:  useSession() hook (reads cookie via fetch)
```

---

## 9. State Management

### Provider Tree

```
<html>
  <body>
    <Providers>                              # src/lib/providers.tsx
      <QueryClientProvider>                  # @tanstack/react-query (unused)
        <ThemeProvider>                      # Custom (class-based dark mode)
          <TooltipProvider>                  # @base-ui/react tooltip context
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Providers>
    <Toaster />                              # Sonner toast notifications
  </body>
</html>
```

### Data Fetching Pattern (Used Everywhere)

```tsx
// Every dashboard page follows this pattern:
export default function SomePage() {
  const { data: session } = useSession();       // 1. Get user
  const [data, setData] = useState([]);          // 2. Local state
  const [loading, setLoading] = useState(true);  // 3. Loading state

  useEffect(() => {                              // 4. Fetch on mount
    if (!session?.user?.id) return;
    fetchData().then(setData).finally(() => setLoading(false));
  }, [session?.user?.id]);

  // Mutations use useTransition or direct async:
  const [isPending, startTransition] = useTransition();
  function handleAction() {
    startTransition(async () => {
      await serverAction(userId, data);        // 5. Direct server action call
      setData(prev => /* optimistic update */);
    });
  }
}
```

### Installed But Unused

| Package | Status | Notes |
|---------|--------|-------|
| `@tanstack/react-query` | Provider set up, no `useQuery`/`useMutation` calls | Replace useState+useEffect pattern |
| `zustand` | Not imported anywhere | Could manage sidebar collapsed, theme, user prefs |
| `next-themes` | Installed, custom ThemeProvider used instead | Could replace custom impl |

---

## 10. Key User Journey Flows

### Journey: Upload CV → Parse → Edit

```
User                    Browser                   Server Action              Database          AI (Claude)
 │                        │                          │                        │                  │
 │  Drop PDF file         │                          │                        │                  │
 │───────────────────────>│                          │                        │                  │
 │                        │  FileReader.readAsDataURL │                        │                  │
 │                        │  base64 = result          │                        │                  │
 │                        │                          │                        │                  │
 │                        │  extractTextFromPDF(b64)  │                        │                  │
 │                        │─────────────────────────>│                        │                  │
 │                        │                          │  unpdf.extractText()   │                  │
 │                        │                          │  (WASM PDF parser)     │                  │
 │                        │  text ←───────────────────│                        │                  │
 │                        │                          │                        │                  │
 │  Review text           │                          │                        │                  │
 │  Click "Upload"        │                          │                        │                  │
 │───────────────────────>│                          │                        │                  │
 │                        │  createCV(userId,name,txt)│                        │                  │
 │                        │─────────────────────────>│  INSERT cvs           │                  │
 │                        │                          │───────────────────────>│                  │
 │                        │  cv.id ←──────────────────│                        │                  │
 │                        │                          │                        │                  │
 │                        │  parseCV(cv.id, userId)   │                        │                  │
 │                        │─────────────────────────>│  SELECT cvs           │                  │
 │                        │                          │───────────────────────>│                  │
 │                        │                          │                        │                  │
 │                        │                          │  generateObject(sonnet)│                  │
 │                        │                          │────────────────────────────────────────> │
 │                        │                          │  {sections: [{type,title,content}]}     │
 │                        │                          │ <────────────────────────────────────────│
 │                        │                          │                        │                  │
 │                        │                          │  INSERT cv_sections    │                  │
 │                        │                          │  UPDATE cvs.parsedJson │                  │
 │                        │                          │───────────────────────>│                  │
 │                        │                          │                        │                  │
 │  Redirect to /cv       │                          │                        │                  │
 │<───────────────────────│                          │                        │                  │
```

### Journey: Add Job via URL → Evaluate

```
User                    Browser                   Server Actions             Database          AI
 │                        │                          │                        │                  │
 │  Paste URL             │                          │                        │                  │
 │  Click "Fetch & Parse" │                          │                        │                  │
 │───────────────────────>│                          │                        │                  │
 │                        │  fetchAndParseJobUrl(url) │                        │                  │
 │                        │─────────────────────────>│                        │                  │
 │                        │                          │  fetch(url) + strip HTML                 │
 │                        │                          │  generateObject(sonnet)───────────────> │
 │                        │                          │  {company,role,jdText} <────────────────│
 │                        │  parsed data ←────────────│                        │                  │
 │                        │                          │                        │                  │
 │  Review, click "Add"   │                          │                        │                  │
 │───────────────────────>│                          │                        │                  │
 │                        │  createJob(userId, data)  │                        │                  │
 │                        │─────────────────────────>│  INSERT jobs           │                  │
 │                        │                          │───────────────────────>│                  │
 │                        │  job.id ←─────────────────│                        │                  │
 │                        │                          │                        │                  │
 │  Click "Evaluate Now"  │                          │                        │                  │
 │───────────────────────>│                          │                        │                  │
 │                        │  evaluateJob(jobId,       │                        │                  │
 │                        │    userId, cvText)        │                        │                  │
 │                        │─────────────────────────>│                        │                  │
 │                        │                          │  Step 1: generateText(opus)             │
 │                        │                          │  JD+CV → A-F blocks  ──────────────────>│
 │                        │                          │  evalText (markdown)  <─────────────────│
 │                        │                          │                        │    (~30-60s)     │
 │                        │                          │  Step 2: generateObject(sonnet)          │
 │                        │                          │  evalText → scores   ──────────────────>│
 │                        │                          │  {scores,archetype}  <──────────────────│
 │                        │                          │                        │                  │
 │                        │                          │  INSERT evaluations    │                  │
 │                        │                          │  INSERT eval_blocks    │                  │
 │                        │                          │  UPDATE jobs (score)   │                  │
 │                        │                          │───────────────────────>│                  │
 │                        │                          │                        │                  │
 │  See evaluation result │                          │                        │                  │
 │  (score, blocks, radar)│                          │                        │                  │
 │<───────────────────────│                          │                        │                  │
```

---

## 11. External Dependencies

### Runtime Dependencies

| Package | Role | Used In |
|---------|------|---------|
| `next` 16.2.3 | Framework (App Router, RSC, Server Actions) | Everything |
| `react` 19.2.4 | UI runtime | Everything |
| `better-auth` 1.6 | Authentication (email, OAuth, sessions) | auth.ts, auth-client.ts, API route |
| `drizzle-orm` 0.45 | Type-safe PostgreSQL ORM | All server actions |
| `@neondatabase/serverless` 1.0 | Neon HTTP driver (edge-compatible) | db/index.ts |
| `ai` 6.0 (Vercel AI SDK) | `generateText`, `generateObject` | evaluation, cv, application, fetch-url actions |
| `@ai-sdk/anthropic 3.0 | Claude provider adapter | ai/client.ts |
| `@base-ui/react` 1.3 | Headless UI primitives (under shadcn/ui) | All UI components |
| `recharts` 3.8 | Charts (radar, bar, pie, line) | analytics/, evaluation/score-radar |
| `unpdf` 1.4 | PDF text extraction (WASM) | parse-file.actions.ts |
| `zod` 4.3 | Schema validation | AI output schemas, form validation |
| `react-hook-form` 5.2 | Form state management | Auth pages |
| `sonner` 2.0 | Toast notifications | All pages |
| `lucide-react` 1.7 | Icon library | All components |
| `date-fns` 4.1 | Date formatting | CV page |
| `clsx` + `tailwind-merge` | `cn()` utility for class merging | All components |
| `class-variance-authority` 0.7 | `cva()` for variant-based styling | Button, Badge |

### Build Dependencies

| Package | Role |
|---------|------|
| `tailwindcss` v4 | CSS framework |
| `drizzle-kit` | DB migrations CLI |
| `dotenv` | Env loading for drizzle-kit |
| `typescript` 5.x | Type checking |
| `eslint` + `eslint-config-next` | Linting |

---

## 12. Architectural Gaps & TODOs

### Not Yet Wired

| Item | Status | Impact |
|------|--------|--------|
| Prompt library (`src/lib/ai/prompts/`) | Written, not imported by actions | Actions use simpler inline prompts |
| Canonical Zod schemas (`src/lib/ai/schemas/`) | Written, not imported | Actions define inline schemas |
| React Query | Provider set up, zero usage | Could replace useState+useEffect pattern |
| Zustand | Installed, zero usage | Could manage shared state (sidebar, theme) |
| `next-themes` | Installed, custom ThemeProvider used | Redundant package |
| Route protection middleware | Only `/cv` checks auth | Other pages silently fail if not logged in |
| Tailored CV generation | Schema exists, no action | No `generateTailoredCV()` server action |
| Portal scanning | UI exists (mock), no real scraping | Portals page uses hardcoded data |
| Interview prep generation | Placeholder tab, no action | No `generateInterviewPrep()` server action |
| Pattern analysis | Analytics page uses mock data | No `analyzePatterns()` server action |
| Email notifications | Schema exists, no sending | No integration with Resend or similar |
| Settings persistence | Save buttons exist, show toast | TODO comments: `// call upsertSettings` |

### Known Issues

| Issue | Location | Description |
|-------|----------|-------------|
| Dual theme systems | header.tsx + theme-provider.tsx | Both manipulate `classList` independently |
| In-memory filtering | job.actions.ts:`getUserJobs` | Fetches ALL jobs, filters in JS — won't scale |
| Block parsing fragility | evaluation.actions.ts:146 | Splits by `/## Block [A-F]/` regex — brittle |
| No upsert | application.actions.ts:60 | Manual check-then-insert (race condition) |
| Mock data in pages | dashboard, analytics, portals, interviews | Not wired to real DB yet |

---

*Generated: 2026-04-09*
*Careetor v0.1.0 — Next.js 16.2.3 + Claude API + Neon PostgreSQL*
