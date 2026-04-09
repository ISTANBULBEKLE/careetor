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
const geminiFlash = google?.("gemini-2.5-flash");

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
 * Check if an error is a rate limit, quota, or billing error.
 * Checks nested causes since the AI SDK wraps errors in retry wrappers.
 */
export function isRateLimited(error: unknown): boolean {
  const keywords = ["rate", "quota", "overloaded", "credit", "billing", "exceeded", "limit"];

  function check(err: unknown): boolean {
    if (!err) return false;
    const e = err as { statusCode?: number; message?: string; cause?: unknown };
    if (e.statusCode === 429 || e.statusCode === 529) return true;
    if (typeof e.message === "string") {
      const lower = e.message.toLowerCase();
      if (keywords.some((k) => lower.includes(k))) return true;
    }
    // Check nested cause (AI SDK wraps errors)
    if (e.cause) return check(e.cause);
    // Check stringified error as last resort
    const str = String(err).toLowerCase();
    return keywords.some((k) => str.includes(k));
  }

  return check(error);
}
