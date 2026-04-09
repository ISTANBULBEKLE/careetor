"use server";

import { generateObject } from "ai";
import { sonnet, fallbackModel, isRateLimited } from "@/lib/ai/client";
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

// Sites known to block server-side fetches
const BLOCKED_DOMAINS = [
  "indeed.com",
  "linkedin.com",
  "glassdoor.com",
  "monster.com",
  "ziprecruiter.com",
  "dice.com",
];

// Multiple User-Agent strings to try
const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
];

function stripHtml(html: string): string {
  return html
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
    .substring(0, 15000);
}

export async function fetchAndParseJobUrl(url: string): Promise<ParsedJob> {
  // Check for known blocked domains
  const hostname = new URL(url).hostname.toLowerCase();
  const blockedDomain = BLOCKED_DOMAINS.find(
    (d) => hostname.includes(d)
  );
  if (blockedDomain) {
    throw new Error(
      `${blockedDomain} blocks automated fetching. ` +
      `Please open the job page in your browser, copy the full job description text, ` +
      `and paste it in the "Paste Text" tab instead.`
    );
  }

  // Try fetching with multiple User-Agents
  let html: string | null = null;
  let lastError: string = "";

  for (const ua of USER_AGENTS) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": ua,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        html = await response.text();
        break;
      }

      lastError = `${response.status} ${response.statusText}`;

      // Don't retry on 403/401 — the site is blocking us
      if (response.status === 403 || response.status === 401) {
        throw new Error(
          `This site blocked the request (${response.status}). ` +
          `Please open the job page in your browser, copy the full job description, ` +
          `and paste it in the "Paste Text" tab.`
        );
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("blocked")) {
        throw error; // Re-throw our formatted errors
      }
      lastError =
        error instanceof Error ? error.message : "Unknown fetch error";
    }
  }

  if (!html) {
    throw new Error(
      `Could not fetch the page (${lastError}). ` +
      `Try copying the job description and using the "Paste Text" tab.`
    );
  }

  const textContent = stripHtml(html);

  if (textContent.length < 100) {
    throw new Error(
      "Could not extract enough text from the page. " +
      "The page might require JavaScript to render (single-page app). " +
      "Please copy the job description text and use the \"Paste Text\" tab."
    );
  }

  // Use LLM to extract structured job info from the raw text
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
