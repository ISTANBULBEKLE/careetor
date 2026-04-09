"use server";

import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createJob(
  userId: string,
  data: {
    company: string;
    role: string;
    sourceUrl?: string;
    jdText: string;
    location?: string;
    remotePolicy?: string;
    salaryRange?: string;
    source?: "manual" | "scan" | "import";
  }
) {
  const [job] = await db
    .insert(jobs)
    .values({
      userId,
      company: data.company,
      companySlug: slugify(data.company),
      role: data.role,
      sourceUrl: data.sourceUrl || null,
      jdText: data.jdText,
      location: data.location || null,
      remotePolicy: data.remotePolicy || null,
      salaryRange: data.salaryRange || null,
      source: data.source || "manual",
      status: "pending",
    })
    .returning();

  return job;
}

export async function getUserJobs(
  userId: string,
  filters?: {
    status?: string;
    minScore?: number;
    search?: string;
  }
) {
  let query = db.query.jobs.findMany({
    where: eq(jobs.userId, userId),
    orderBy: [desc(jobs.createdAt)],
  });

  const allJobs = await query;

  let filtered = allJobs;

  if (filters?.status && filters.status !== "all") {
    filtered = filtered.filter((j) => j.status === filters.status);
  }

  if (filters?.minScore) {
    filtered = filtered.filter(
      (j) => j.score && Number(j.score) >= filters.minScore!
    );
  }

  if (filters?.search) {
    const s = filters.search.toLowerCase();
    filtered = filtered.filter(
      (j) =>
        j.company.toLowerCase().includes(s) ||
        j.role.toLowerCase().includes(s)
    );
  }

  return filtered;
}

export async function getJob(jobId: string, userId: string) {
  return db.query.jobs.findFirst({
    where: and(eq(jobs.id, jobId), eq(jobs.userId, userId)),
  });
}

export async function updateJobStatus(
  jobId: string,
  userId: string,
  status: string
) {
  await db
    .update(jobs)
    .set({
      status: status as typeof jobs.status.enumValues[number],
      updatedAt: new Date(),
    })
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));
}

export async function updateJobScore(
  jobId: string,
  score: number,
  archetype: string
) {
  await db
    .update(jobs)
    .set({
      score: score.toFixed(1),
      detectedArchetype: archetype,
      status: "evaluated",
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, jobId));
}

export async function deleteJob(jobId: string, userId: string) {
  await db
    .delete(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));
}

export async function getJobStats(userId: string) {
  const allJobs = await db.query.jobs.findMany({
    where: eq(jobs.userId, userId),
  });

  const stats = {
    total: allJobs.length,
    pending: allJobs.filter((j) => j.status === "pending").length,
    evaluated: allJobs.filter((j) => j.status === "evaluated").length,
    applied: allJobs.filter((j) => j.status === "applied").length,
    interview: allJobs.filter((j) => j.status === "interview").length,
    offer: allJobs.filter((j) => j.status === "offer").length,
    rejected: allJobs.filter((j) => j.status === "rejected").length,
    avgScore:
      allJobs.filter((j) => j.score).length > 0
        ? allJobs
            .filter((j) => j.score)
            .reduce((sum, j) => sum + Number(j.score), 0) /
          allJobs.filter((j) => j.score).length
        : 0,
  };

  return stats;
}
