import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// ============================================================
// Provider Setup
// ============================================================

const anthropic = process.env.ANTHROPIC_API_KEY
  ? createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const google = process.env.GOOGLE_GEMINI_API_KEY
  ? createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY })
  : null;

// ============================================================
// Model Definitions
// ============================================================

const claudeSonnet = anthropic?.("claude-sonnet-4-6");
const claudeOpus = anthropic?.("claude-opus-4-6");
const geminiFlash = google?.("gemini-2.0-flash");

function requireModel<T>(primary: T | undefined, fallback: T | undefined): T {
  const model = primary ?? fallback;
  if (!model) {
    throw new Error(
      "No AI provider configured. Set ANTHROPIC_API_KEY or GOOGLE_GEMINI_API_KEY in .env.local"
    );
  }
  return model;
}

/**
 * Primary models — uses Anthropic if available, Gemini as fallback.
 *
 * sonnet: fast model for structured output (CV parsing, scoring, URL parsing)
 * opus: powerful model for long-form generation (A-F evaluations)
 */
export const sonnet = requireModel(claudeSonnet, geminiFlash);
export const opus = requireModel(claudeOpus, geminiFlash);

/**
 * Fallback model — Gemini Flash if available, otherwise null.
 * Use this when the primary model hits rate limits.
 *
 * Usage in actions:
 *   import { sonnet, fallbackModel } from "@/lib/ai/client";
 *   try {
 *     await generateText({ model: sonnet, ... });
 *   } catch (e) {
 *     if (isRateLimited(e) && fallbackModel) {
 *       await generateText({ model: fallbackModel, ... });
 *     }
 *   }
 */
export const fallbackModel = geminiFlash ?? (anthropic ? claudeSonnet : null);

/**
 * Check if an error is a rate limit / quota error.
 */
export function isRateLimited(error: unknown): boolean {
  const err = error as { statusCode?: number; message?: string };
  return (
    err.statusCode === 429 ||
    err.statusCode === 529 ||
    (typeof err.message === "string" &&
      (err.message.includes("rate") ||
        err.message.includes("quota") ||
        err.message.includes("overloaded") ||
        err.message.includes("credit") ||
        err.message.includes("billing")))
  );
}
