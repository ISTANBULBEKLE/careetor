"use server";

import { db } from "@/lib/db";
import { cvs, cvSections } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateObject } from "ai";
import { sonnet, fallbackModel, isRateLimited } from "@/lib/ai/client";
import { z } from "zod";

const cvSectionSchema = z.object({
  sections: z.array(
    z.object({
      type: z.enum([
        "summary",
        "experience",
        "education",
        "skills",
        "projects",
        "certifications",
        "other",
      ]),
      title: z.string(),
      content: z.string(),
      metadata: z
        .object({
          company: z.string().optional(),
          dateRange: z.string().optional(),
          location: z.string().optional(),
          metrics: z.array(z.string()).optional(),
        })
        .optional(),
    })
  ),
});

export async function createCV(userId: string, name: string, rawText: string) {
  const [cv] = await db
    .insert(cvs)
    .values({
      userId,
      name,
      rawText,
      isMaster: true,
    })
    .returning();

  return cv;
}

export async function parseCV(cvId: string, userId: string) {
  const cv = await db.query.cvs.findFirst({
    where: and(eq(cvs.id, cvId), eq(cvs.userId, userId)),
  });

  if (!cv?.rawText) throw new Error("CV not found or has no text");

  const { object } = await generateObject({
    model: sonnet,
    schema: cvSectionSchema,
    prompt: `Parse the following CV/resume text into structured sections.
For each section, identify the type (summary, experience, education, skills, projects, certifications, or other).
For experience entries, extract company name, date range, location, and key metrics (numbers, percentages, dollar amounts).
Preserve all content accurately — do not summarize or lose information.

CV TEXT:
${cv.rawText}`,
  });

  // Save parsed sections to database
  const sectionRecords = object.sections.map((section, index) => ({
    cvId,
    type: section.type as
      | "summary"
      | "experience"
      | "education"
      | "skills"
      | "projects"
      | "certifications"
      | "other",
    title: section.title,
    content: section.content,
    orderIndex: index,
    metadata: section.metadata || null,
  }));

  if (sectionRecords.length > 0) {
    await db.insert(cvSections).values(sectionRecords);
  }

  // Update CV with parsed JSON
  await db
    .update(cvs)
    .set({ parsedJson: object, updatedAt: new Date() })
    .where(eq(cvs.id, cvId));

  return object;
}

export async function getUserCVs(userId: string) {
  return db.query.cvs.findMany({
    where: eq(cvs.userId, userId),
    orderBy: (cvs, { desc }) => [desc(cvs.createdAt)],
  });
}

export async function getMasterCV(userId: string) {
  return db.query.cvs.findFirst({
    where: and(eq(cvs.userId, userId), eq(cvs.isMaster, true)),
  });
}

export async function getCVSections(cvId: string) {
  return db.query.cvSections.findMany({
    where: eq(cvSections.cvId, cvId),
    orderBy: (sections, { asc }) => [asc(sections.orderIndex)],
  });
}

export async function updateCVSection(
  sectionId: string,
  content: string
) {
  await db
    .update(cvSections)
    .set({ content })
    .where(eq(cvSections.id, sectionId));
}

export async function deleteCV(cvId: string, userId: string) {
  await db
    .delete(cvs)
    .where(and(eq(cvs.id, cvId), eq(cvs.userId, userId)));
}
