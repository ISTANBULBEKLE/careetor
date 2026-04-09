"use server";

import { db } from "@/lib/db";
import { profiles, userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getProfile(userId: string) {
  return db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
}

export async function upsertProfile(
  userId: string,
  data: {
    headline?: string;
    location?: string;
    timezone?: string;
    targetRoles?: string[];
    archetypes?: { name: string; level: string; fit: string }[];
    salaryMin?: number;
    salaryTarget?: number;
    salaryCurrency?: string;
    visaStatus?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    githubUrl?: string;
    superpowers?: string[];
    exitStory?: string;
  }
) {
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });

  if (existing) {
    await db
      .update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.userId, userId));
  } else {
    await db.insert(profiles).values({ userId, ...data });
  }
}

export async function getSettings(userId: string) {
  return db.query.userSettings.findFirst({
    where: eq(userSettings.userId, userId),
  });
}

export async function upsertSettings(
  userId: string,
  data: {
    titleFilterPositive?: string[];
    titleFilterNegative?: string[];
    seniorityBoost?: string[];
    scanFrequency?: string;
    emailNotifications?: boolean;
    theme?: "light" | "dark" | "system";
    language?: string;
  }
) {
  const existing = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, userId),
  });

  if (existing) {
    await db
      .update(userSettings)
      .set(data)
      .where(eq(userSettings.userId, userId));
  } else {
    await db.insert(userSettings).values({ userId, ...data });
  }
}
