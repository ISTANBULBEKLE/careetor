"use server";

import { generateObject } from "ai";
import { sonnet } from "@/lib/ai/client";
import { z } from "zod";

const jobParseSchema = z.object({
  company: z.string().describe("Company name"),
  role: z.string().describe("Job title/role"),
  location: z.string().optional().describe("Job location if mentioned"),
  remotePolicy: z
    .string()
    .optional()
    .describe("Remote/hybrid/onsite policy if mentioned"),
  salaryRange: z
    .string()
    .optional()
    .describe("Salary range if mentioned"),
  jdText: z
    .string()
    .describe(
      "The full job description text, cleaned up and well-formatted. Include all requirements, responsibilities, qualifications, and benefits."
    ),
});

export type ParsedJob = z.infer<typeof jobParseSchema>;

export async function fetchAndParseJobUrl(url: string): Promise<ParsedJob> {
  // Fetch the page HTML
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  // Strip scripts, styles, and HTML tags to get readable text
  const textContent = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim()
    .substring(0, 15000); // Limit to avoid token overflow

  if (textContent.length < 100) {
    throw new Error(
      "Could not extract enough text from the page. The page might require JavaScript to render. Try copying the job description text manually."
    );
  }

  // Use Claude to extract structured job info from the raw text
  const { object } = await generateObject({
    model: sonnet,
    schema: jobParseSchema,
    prompt: `Extract the job posting details from this web page content.

Source URL: ${url}

PAGE CONTENT:
${textContent}

Extract:
- Company name
- Job title/role
- Location (if mentioned)
- Remote policy (remote/hybrid/onsite, if mentioned)
- Salary range (if mentioned)
- The full job description text — include ALL requirements, responsibilities, qualifications, about the company, and benefits. Clean it up and format it nicely but don't lose any information.

If you can't find a company name, infer it from the URL domain.
If you can't find a role title, use the page title or first heading.`,
  });

  return object;
}
