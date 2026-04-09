"use server";

import { db } from "@/lib/db";
import { applications, applicationAnswers, jobs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateText } from "ai";
import { sonnet, fallbackModel, isRateLimited } from "@/lib/ai/client";

export async function createApplication(
  jobId: string,
  userId: string,
  tailoredCvId?: string
) {
  const [app] = await db
    .insert(applications)
    .values({
      jobId,
      userId,
      tailoredCvId: tailoredCvId || null,
    })
    .returning();

  return app;
}

export async function generateCoverLetter(
  jobId: string,
  userId: string,
  cvText: string
) {
  const job = await db.query.jobs.findFirst({
    where: and(eq(jobs.id, jobId), eq(jobs.userId, userId)),
  });

  if (!job) throw new Error("Job not found");

  const coverLetterOptions = {
    system: `You are an expert cover letter writer for modern tech/professional roles. Your cover letters are compelling, specific, and results-driven.

RULES:
- DO NOT include any header block (no name, address, date, phone, "Dear Hiring Manager" etc.)
- Start directly with a strong opening paragraph that hooks the reader
- Write 3-4 paragraphs totaling 250-350 words
- Each paragraph must map a specific JD requirement to a concrete candidate achievement with metrics
- Use the "I'm choosing you" tone — confident, specific, not generic
- NEVER use cliches: "passionate about", "leveraged", "spearheaded", "synergies", "I am writing to apply"
- NEVER fabricate experience — only reference what's in the CV
- End with a forward-looking closing that signals mutual fit
- Format as clean paragraphs with no markdown, no bullet points, no headers`,
    prompt: `Write a modern, compelling cover letter body for this application.

COMPANY: ${job.company}
ROLE: ${job.role}

JOB DESCRIPTION:
${job.jdText}

CANDIDATE CV:
${cvText}

Write ONLY the cover letter body paragraphs. No header, no greeting, no signature — just the content paragraphs. Start with a compelling opening line.`,
    maxOutputTokens: 4096,
  } as const;

  let text: string;
  try {
    const result = await generateText({ model: sonnet, ...coverLetterOptions });
    text = result.text;
  } catch (error) {
    if (isRateLimited(error) && fallbackModel) {
      console.warn("[AI Fallback] Sonnet rate limited — using Gemini for cover letter");
      const result = await generateText({
        model: fallbackModel,
        ...coverLetterOptions,
        providerOptions: {
          google: { thinkingConfig: { thinkingBudget: 0 } },
        },
      });
      text = result.text;
    } else {
      throw error;
    }
  }

  // Save cover letter
  const existing = await db.query.applications.findFirst({
    where: and(
      eq(applications.jobId, jobId),
      eq(applications.userId, userId)
    ),
  });

  if (existing) {
    await db
      .update(applications)
      .set({ coverLetter: text })
      .where(eq(applications.id, existing.id));
  } else {
    await db.insert(applications).values({
      jobId,
      userId,
      coverLetter: text,
    });
  }

  return { coverLetter: text };
}

export async function generateApplicationAnswers(
  jobId: string,
  userId: string,
  cvText: string,
  questions: string[]
) {
  const job = await db.query.jobs.findFirst({
    where: and(eq(jobs.id, jobId), eq(jobs.userId, userId)),
  });

  if (!job) throw new Error("Job not found");

  const { text } = await generateText({
    model: sonnet,
    system: `You are an expert at drafting application form answers. For each question:
- Be specific and concrete — reference actual experience from the CV
- Keep answers 2-4 sentences unless the question requires more
- Use the framework: proof point first, then context
- "Why this role?" → Map JD requirement to CV proof point
- "Why this company?" → Mention specific product/value
- "Relevant experience?" → One quantified proof point
- Never fabricate experience or metrics`,
    prompt: `Draft answers for these application questions.

COMPANY: ${job.company}
ROLE: ${job.role}
JD: ${job.jdText.substring(0, 3000)}

CV: ${cvText.substring(0, 3000)}

QUESTIONS:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

For each question, provide a clear, specific answer. Format:

**Q: [question]**
[answer]

---`,
    maxOutputTokens: 3000,
  });

  return { answers: text };
}

export async function getApplication(jobId: string, userId: string) {
  return db.query.applications.findFirst({
    where: and(
      eq(applications.jobId, jobId),
      eq(applications.userId, userId)
    ),
  });
}

export async function updateApplicationNotes(
  applicationId: string,
  notes: string
) {
  await db
    .update(applications)
    .set({ notes })
    .where(eq(applications.id, applicationId));
}
