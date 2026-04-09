import { z } from "zod";

// ============================================================
// CV Sections Schema — structured output for CV parsing
// ============================================================

export const experienceMetadataSchema = z.object({
  company: z.string().describe("Company or organization name"),
  title: z.string().describe("Job title held"),
  location: z.string().optional().describe("Work location"),
  start_date: z.string().describe("Start date (YYYY-MM or YYYY)"),
  end_date: z
    .string()
    .optional()
    .describe('End date (YYYY-MM or YYYY), omit if current role'),
  is_current: z.boolean().describe("Whether this is the current position"),
  metrics: z
    .array(z.string())
    .describe(
      "Quantifiable achievements extracted from bullet points (e.g. 'Reduced latency by 40%')"
    ),
  technologies: z
    .array(z.string())
    .describe("Technologies, tools, and frameworks mentioned in this entry"),
});

export const educationMetadataSchema = z.object({
  institution: z.string().describe("University or institution name"),
  degree: z.string().describe("Degree type (e.g. B.Sc., M.Eng., Ph.D.)"),
  field: z.string().describe("Field of study"),
  graduation_date: z.string().optional().describe("Graduation date"),
  gpa: z.string().optional().describe("GPA if mentioned"),
  honors: z.array(z.string()).optional().describe("Honors, awards, distinctions"),
});

export const projectMetadataSchema = z.object({
  name: z.string().describe("Project name"),
  url: z.string().optional().describe("Project URL if available"),
  technologies: z.array(z.string()).describe("Technologies used"),
  description: z.string().describe("Brief description of the project"),
});

export const certificationMetadataSchema = z.object({
  issuer: z.string().describe("Certifying body"),
  date: z.string().optional().describe("Date obtained"),
  credential_id: z.string().optional().describe("Credential ID if provided"),
  url: z.string().optional().describe("Verification URL"),
});

export const cvSectionSchema = z.object({
  type: z
    .enum([
      "summary",
      "experience",
      "education",
      "skills",
      "projects",
      "certifications",
      "other",
    ])
    .describe("Section category"),
  title: z
    .string()
    .describe(
      "Section heading as it appears in the CV (e.g. 'Professional Experience', 'Technical Skills')"
    ),
  content: z
    .string()
    .describe("Full text content of the section, preserving bullet points"),
  order_index: z
    .number()
    .int()
    .describe("Position of this section in the original CV, starting from 0"),
  metadata: z
    .union([
      experienceMetadataSchema,
      educationMetadataSchema,
      projectMetadataSchema,
      certificationMetadataSchema,
      z.record(z.string(), z.unknown()),
    ])
    .optional()
    .describe(
      "Structured metadata — shape depends on section type"
    ),
});

export const cvParsedOutputSchema = z.object({
  sections: z
    .array(cvSectionSchema)
    .describe("All parsed CV sections in document order"),
  detected_name: z.string().optional().describe("Candidate full name"),
  detected_email: z.string().optional().describe("Candidate email"),
  detected_phone: z.string().optional().describe("Candidate phone number"),
  detected_location: z.string().optional().describe("Candidate location"),
  detected_linkedin: z.string().optional().describe("LinkedIn profile URL"),
  detected_github: z.string().optional().describe("GitHub profile URL"),
  detected_portfolio: z.string().optional().describe("Portfolio/website URL"),
  total_years_experience: z
    .number()
    .optional()
    .describe("Estimated total years of professional experience"),
});

// Inferred types
export type CVSection = z.infer<typeof cvSectionSchema>;
export type CVParsedOutput = z.infer<typeof cvParsedOutputSchema>;
export type ExperienceMetadata = z.infer<typeof experienceMetadataSchema>;
export type EducationMetadata = z.infer<typeof educationMetadataSchema>;
export type ProjectMetadata = z.infer<typeof projectMetadataSchema>;
export type CertificationMetadata = z.infer<typeof certificationMetadataSchema>;
