// ============================================================
// Parse CV Prompt — extract structured sections from raw CV text
// ============================================================

/**
 * Build the user prompt for parsing raw CV text into structured sections.
 *
 * Use with a minimal system message (or `getSharedContext()` without profile)
 * and `cvParsedOutputSchema` for structured output.
 */
export function buildCVParsePrompt(rawText: string): string {
  return `# CV Parsing Request

Parse the following raw CV/resume text into structured sections. Extract every identifiable section and classify it correctly.

## Instructions

1. **Section Detection:** Identify each section by its heading. Common patterns include "Experience", "Professional Experience", "Work History", "Education", "Skills", "Technical Skills", "Projects", "Certifications", "Summary", "Objective", "About". If a section has no clear heading but contains identifiable content (e.g., a list of skills), infer the type.

2. **Section Types:** Classify each section as one of:
   - \`summary\` — Professional summary, objective, or about section.
   - \`experience\` — Work experience entries. Each job should be a separate section entry with its own metadata.
   - \`education\` — Academic credentials.
   - \`skills\` — Technical or soft skills lists.
   - \`projects\` — Personal, open-source, or notable projects.
   - \`certifications\` — Professional certifications and licenses.
   - \`other\` — Anything that does not fit the above (e.g., volunteering, publications, awards, languages).

3. **Experience Entries:** For each experience entry, extract metadata:
   - Company name, job title, location (if stated).
   - Start date and end date in YYYY-MM format when possible. If only the year is given, use YYYY.
   - Whether it is the current role.
   - Quantifiable metrics from bullet points (e.g., "Increased throughput by 3x", "Managed team of 8"). Extract every measurable achievement.
   - Technologies and tools mentioned in the bullets.

4. **Education Entries:** Extract institution, degree, field, graduation date, GPA (if stated), and honors.

5. **Project Entries:** Extract project name, URL, technologies, and a brief description.

6. **Certification Entries:** Extract issuer, date, credential ID, and verification URL.

7. **Content Preservation:** The \`content\` field for each section must preserve the original text faithfully — including bullet points, formatting indicators, and line breaks. Do not summarize or rewrite.

8. **Ordering:** Set \`order_index\` based on the section's position in the original document (0-based).

9. **Contact Information:** Extract name, email, phone, location, LinkedIn URL, GitHub URL, and portfolio URL from the header/contact section. These go in the top-level fields, not as a section.

10. **Years of Experience:** Estimate total professional experience by summing non-overlapping employment periods. Round to the nearest integer.

## Raw CV Text

<cv>
${rawText}
</cv>

## Output Format

Return a single JSON object matching the CV parsed output schema. Do not wrap in markdown code fences. Every section in the CV must be represented — do not skip any content.`;
}
