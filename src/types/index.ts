// ============================================================
// Careetor — Shared TypeScript Types
// ============================================================

// --- Enums ---

export type Plan = "free" | "pro" | "team";

export type JobStatus =
  | "pending"
  | "evaluated"
  | "applied"
  | "responded"
  | "interview"
  | "offer"
  | "rejected"
  | "discarded"
  | "skip";

export type JobSource = "manual" | "scan" | "import";

export type AtsType = "greenhouse" | "lever" | "ashby" | "workday" | "custom";

export type ScanMethod = "playwright" | "api" | "websearch";

export type ScanStatus = "running" | "completed" | "failed";

export type ScanResult =
  | "added"
  | "skipped_title"
  | "skipped_dup"
  | "skipped_expired";

export type EvaluationBlock = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export type Recommendation = "strong_apply" | "apply" | "review" | "skip";

export type CVSectionType =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "other";

export type PaperFormat = "letter" | "a4";

export type NotificationType =
  | "new_jobs"
  | "status_change"
  | "evaluation_complete"
  | "scan_complete";

export type Theme = "light" | "dark" | "system";

// --- Archetype ---

export const ARCHETYPES = [
  "AI Platform / LLMOps",
  "Agentic / Automation",
  "Technical AI PM",
  "AI Solutions Architect",
  "AI Forward Deployed Engineer",
  "AI Transformation Lead",
] as const;

export type Archetype = (typeof ARCHETYPES)[number];

// --- Score helpers ---

export function getScoreColor(score: number): string {
  if (score >= 4.5) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 4.0) return "text-sky-600 dark:text-sky-400";
  if (score >= 3.5) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

export function getScoreBgColor(score: number): string {
  if (score >= 4.5) return "bg-emerald-100 dark:bg-emerald-900/30";
  if (score >= 4.0) return "bg-sky-100 dark:bg-sky-900/30";
  if (score >= 3.5) return "bg-amber-100 dark:bg-amber-900/30";
  return "bg-rose-100 dark:bg-rose-900/30";
}

export function getScoreLabel(score: number): string {
  if (score >= 4.5) return "Strong Match";
  if (score >= 4.0) return "Good Match";
  if (score >= 3.5) return "Review";
  return "Skip";
}

export function getStatusColor(status: JobStatus): string {
  const colors: Record<JobStatus, string> = {
    pending: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    evaluated:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    applied:
      "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
    responded:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    interview:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    offer:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    rejected:
      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    discarded:
      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    skip: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  };
  return colors[status];
}

// --- Job-related interfaces ---

export interface JobScores {
  archetype_alignment: number;
  cv_match: number;
  seniority_fit: number;
  compensation: number;
  career_growth: number;
  remote_policy: number;
  company_reputation: number;
  tech_stack: number;
  process_speed: number;
  cultural_signals: number;
}

export interface Gap {
  skill: string;
  severity: "low" | "medium" | "high";
  mitigation: string;
}

export interface StoryInput {
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  reflection?: string;
  tags?: string[];
}
