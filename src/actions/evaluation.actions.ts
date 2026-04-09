"use server";

import { db } from "@/lib/db";
import { evaluations, evaluationBlocks, jobs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateText, generateObject } from "ai";
import { opus, sonnet, fallbackModel, isRateLimited } from "@/lib/ai/client";
import { z } from "zod";
import { updateJobScore } from "./job.actions";

const scoringSchema = z.object({
  archetype: z.string().describe("Primary archetype detected from JD"),
  scores: z.object({
    archetype_alignment: z.number().min(1).max(5),
    cv_match: z.number().min(1).max(5),
    seniority_fit: z.number().min(1).max(5),
    compensation: z.number().min(1).max(5),
    career_growth: z.number().min(1).max(5),
    remote_policy: z.number().min(1).max(5),
    company_reputation: z.number().min(1).max(5),
    tech_stack: z.number().min(1).max(5),
    process_speed: z.number().min(1).max(5),
    cultural_signals: z.number().min(1).max(5),
  }),
  overall_score: z.number().min(1).max(5),
  recommendation: z.enum(["strong_apply", "apply", "review", "skip"]),
  summary: z.string().describe("One-line TL;DR"),
  keywords: z.array(z.string()).describe("15-20 keywords extracted from JD"),
  gaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
      mitigation: z.string(),
    })
  ),
});

export async function evaluateJob(
  jobId: string,
  userId: string,
  cvText: string
) {
  const job = await db.query.jobs.findFirst({
    where: and(eq(jobs.id, jobId), eq(jobs.userId, userId)),
  });

  if (!job) throw new Error("Job not found");

  // Step 1: Generate the full evaluation text (A-F blocks)
  const evalPromptOptions = {
    system: `You are an expert career advisor and job evaluation system. You evaluate job descriptions against a candidate's CV using a structured A-F block methodology.

SCORING DIMENSIONS (1-5 each, weighted):
- Archetype Alignment (25%): How well does this role match the candidate's career archetype?
- CV Match (15%): How many JD requirements are covered by the CV?
- Seniority Fit (15%): Is the level appropriate?
- Compensation (10%): Market rate alignment
- Career Growth (10%): Growth opportunity
- Remote Policy (5%): Flexibility
- Company Reputation (5%): Brand value
- Tech Stack (5%): Technology alignment
- Process Speed (5%): Hiring process efficiency
- Cultural Signals (5%): Culture fit indicators

ARCHETYPES (detect which fits best):
1. AI Platform / LLMOps — production ML, observability, evals
2. Agentic / Automation — agent systems, HITL, orchestration
3. Technical AI PM — product discovery, roadmaps
4. AI Solutions Architect — enterprise integrations, system design
5. AI Forward Deployed Engineer — client-facing, fast delivery
6. AI Transformation Lead — change management, adoption

RULES:
- NEVER invent experience the candidate doesn't have
- Be honest about gaps — identify them and suggest mitigation
- All metrics must come from the CV provided
- Score fairly — not every job is a 4.5`,
    prompt: `Evaluate this job against the candidate's CV.

## Job Description
${job.jdText}

## Candidate CV
${cvText}

Generate a comprehensive evaluation with these blocks:

## Block A — Role Summary
Table format: Archetype, Domain, Function, Seniority Level, Remote Policy, Team Size (if mentioned), TL;DR (one sentence).

## Block B — CV Match
For each key JD requirement, map to specific CV evidence. List gaps with severity and mitigation strategy.

## Block C — Level Strategy
What level does the JD target? What's the candidate's natural level? Strategy for positioning.

## Block D — Compensation & Market
What's the likely salary range for this role? How does it compare to the candidate's expectations?

## Block E — CV Personalization Plan
Top 5 specific changes to make to the CV for this application. Keywords to inject. Summary rewrite suggestions.

## Block F — Interview Preparation
6-8 likely interview questions mapped to the candidate's experience. Key stories to prepare. Red flags to address.

End with a brief OVERALL ASSESSMENT with the score and recommendation.`,
    maxOutputTokens: 6000,
  } as const;

  let evalText: string;
  try {
    const result = await generateText({ model: opus, ...evalPromptOptions });
    evalText = result.text;
  } catch (error) {
    if (isRateLimited(error) && fallbackModel) {
      console.warn("[AI Fallback] Opus rate limited — using Gemini Flash for evaluation");
      const result = await generateText({
        model: fallbackModel,
        ...evalPromptOptions,
        maxOutputTokens: 8192,
        providerOptions: {
          google: { thinkingConfig: { thinkingBudget: 0 } },
        },
      });
      evalText = result.text;
    } else {
      throw error;
    }
  }

  // Step 2: Generate structured scoring
  const { object: scoring } = await generateObject({
    model: sonnet,
    schema: scoringSchema,
    prompt: `Based on this evaluation, generate structured scores.

JOB: ${job.company} — ${job.role}
JD: ${job.jdText.substring(0, 2000)}

EVALUATION:
${evalText.substring(0, 4000)}

CV SUMMARY:
${cvText.substring(0, 2000)}

Generate accurate scores for all 10 dimensions (1-5), overall score (weighted average), archetype, recommendation, keywords, gaps, and summary.`,
  });

  // Step 3: Save to database
  const [evaluation] = await db
    .insert(evaluations)
    .values({
      jobId,
      userId,
      overallScore: scoring.overall_score.toFixed(1),
      scoresJson: scoring.scores,
      archetype: scoring.archetype,
      summary: scoring.summary,
      recommendation: scoring.recommendation,
      keywords: scoring.keywords,
      gaps: scoring.gaps,
    })
    .returning();

  // Save evaluation blocks
  const blockTexts = evalText.split(/## Block [A-F]/);
  const blockLabels = ["A", "B", "C", "D", "E", "F"] as const;
  const blockTitles = [
    "Role Summary",
    "CV Match",
    "Level Strategy",
    "Compensation & Market",
    "CV Personalization Plan",
    "Interview Preparation",
  ];

  for (let i = 0; i < blockLabels.length; i++) {
    const content = blockTexts[i + 1]?.trim();
    if (content) {
      await db.insert(evaluationBlocks).values({
        evaluationId: evaluation.id,
        block: blockLabels[i],
        title: blockTitles[i],
        content,
      });
    }
  }

  // Update job with score
  await updateJobScore(jobId, scoring.overall_score, scoring.archetype);

  return { evaluationText: evalText, scoring };
}

export async function getEvaluation(jobId: string, userId: string) {
  const evaluation = await db.query.evaluations.findFirst({
    where: and(
      eq(evaluations.jobId, jobId),
      eq(evaluations.userId, userId)
    ),
  });

  if (!evaluation) return null;

  const blocks = await db.query.evaluationBlocks.findMany({
    where: eq(evaluationBlocks.evaluationId, evaluation.id),
  });

  return { ...evaluation, blocks };
}
