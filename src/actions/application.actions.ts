"use server";

import { db } from "@/lib/db";
import { applications, applicationAnswers, jobs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateText } from "ai";
import { sonnet } from "@/lib/ai/client";

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

  const { text } = await generateText({
    model: sonnet,
    system: `You are an expert cover letter writer. Write compelling, specific cover letters that:
- Map JD requirements directly to candidate proof points
- Use the "I'm choosing you" tone — confident without arrogance
- Stay under 1 page (300-400 words)
- Never use cliches: "passionate about", "leveraged", "spearheaded", "synergies"
- Be specific and concrete — mention actual projects, metrics, outcomes
- Never fabricate experience`,
    prompt: `Write a cover letter for this application.

COMPANY: ${job.company}
ROLE: ${job.role}
JOB DESCRIPTION:
${job.jdText}

CANDIDATE CV:
${cvText}

Write a professional, specific cover letter. Format as clean text (not markdown).`,
    maxOutputTokens: 1500,
  });

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
