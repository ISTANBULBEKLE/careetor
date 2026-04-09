import { z } from "zod";

// ============================================================
// Evaluation Schema — structured output for job evaluation
// ============================================================

export const gapSchema = z.object({
  skill: z.string().describe("The missing or weak skill/requirement"),
  severity: z.enum(["low", "medium", "high"]).describe("Impact on candidacy"),
  mitigation: z
    .string()
    .describe("How the candidate can address or frame this gap"),
});

export const evaluationBlockSchema = z.object({
  block: z.enum(["A", "B", "C", "D", "E", "F"]).describe("Block identifier"),
  title: z.string().describe("Block title"),
  content: z.string().describe("Detailed analysis in markdown"),
  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .describe("Block-specific structured data"),
});

export const scoresSchema = z.object({
  archetype_alignment: z
    .number()
    .min(1)
    .max(5)
    .describe("How well the role maps to a target archetype (weight: 0.20)"),
  cv_match: z
    .number()
    .min(1)
    .max(5)
    .describe(
      "Keyword and experience overlap between CV and JD (weight: 0.18)"
    ),
  seniority_fit: z
    .number()
    .min(1)
    .max(5)
    .describe(
      "Match between candidate seniority and role level (weight: 0.12)"
    ),
  compensation: z
    .number()
    .min(1)
    .max(5)
    .describe("Alignment with salary expectations (weight: 0.10)"),
  career_growth: z
    .number()
    .min(1)
    .max(5)
    .describe(
      "Opportunity for skill development and career progression (weight: 0.10)"
    ),
  remote_policy: z
    .number()
    .min(1)
    .max(5)
    .describe("Match with remote/hybrid/onsite preference (weight: 0.08)"),
  company_reputation: z
    .number()
    .min(1)
    .max(5)
    .describe("Brand strength, funding stage, market position (weight: 0.07)"),
  tech_stack: z
    .number()
    .min(1)
    .max(5)
    .describe(
      "Overlap between candidate tech stack and JD requirements (weight: 0.07)"
    ),
  process_speed: z
    .number()
    .min(1)
    .max(5)
    .describe(
      "Estimated hiring timeline and process complexity (weight: 0.04)"
    ),
  cultural_signals: z
    .number()
    .min(1)
    .max(5)
    .describe(
      "DEI signals, work-life balance indicators, team culture (weight: 0.04)"
    ),
});

export const evaluationOutputSchema = z.object({
  scores: scoresSchema.describe("Scores across all 10 evaluation dimensions"),
  overall_score: z
    .number()
    .min(1)
    .max(5)
    .describe("Weighted composite score across all dimensions"),
  archetype: z
    .enum([
      "AI Platform / LLMOps",
      "Agentic / Automation",
      "Technical AI PM",
      "AI Solutions Architect",
      "AI Forward Deployed Engineer",
      "AI Transformation Lead",
    ])
    .describe("Best-fit archetype for this role"),
  recommendation: z
    .enum(["strong_apply", "apply", "review", "skip"])
    .describe("Action recommendation based on overall evaluation"),
  keywords: z
    .array(z.string())
    .describe(
      "JD keywords and phrases the candidate should incorporate in their application"
    ),
  gaps: z
    .array(gapSchema)
    .describe("Skills or requirements where the candidate falls short"),
  summary: z
    .string()
    .describe(
      "Executive summary of the evaluation: fit assessment, key strengths, and critical gaps in 2-4 sentences"
    ),
  blocks: z
    .array(evaluationBlockSchema)
    .describe("Detailed analysis for each evaluation block A through F"),
});

// Inferred types
export type EvaluationOutput = z.infer<typeof evaluationOutputSchema>;
export type EvaluationScores = z.infer<typeof scoresSchema>;
export type EvaluationGap = z.infer<typeof gapSchema>;
export type EvaluationBlock = z.infer<typeof evaluationBlockSchema>;
