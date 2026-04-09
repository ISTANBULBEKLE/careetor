// ============================================================
// Tailor CV Prompt — rewrite CV sections for a specific JD
// ============================================================

import type { CVSection } from "@/lib/ai/schemas/cv-sections.schema";

/**
 * Build the user prompt for tailoring CV sections to a specific job description.
 *
 * Use with `getSharedContext(profile)` as the system message.
 * The response is a JSON object with `sections` (rewritten CVSection[])
 * and `changes_made` (string[] describing each modification).
 */
export function buildTailorCVPrompt(
  cvSections: CVSection[],
  jdText: string,
  keywords: string[],
  archetype: string
): string {
  const sectionsJson = JSON.stringify(cvSections, null, 2);

  return `# CV Tailoring Request

Rewrite the candidate's CV sections to maximize relevance for the target job description. The role has been classified as the **${archetype}** archetype.

## Tailoring Rules

### Keyword Injection
The following keywords were extracted from the JD. Incorporate as many as possible into the CV — but ONLY where the candidate has genuine supporting experience. Place keywords in context, not as a bare list.

**Target Keywords:** ${keywords.join(", ")}

### Section-by-Section Instructions

#### Summary
- Rewrite the summary to directly address the role's primary requirements.
- Open with the candidate's strongest qualification for THIS specific role.
- Mention the target archetype domain naturally (e.g., "AI platform engineer" not "AI Platform / LLMOps").
- Include 2-3 of the highest-priority JD keywords.
- Keep it to 3-4 sentences max.

#### Experience
- **Bullet reordering:** For each experience entry, move the most JD-relevant bullets to the top. The first 2-3 bullets of the most recent roles get the most attention from recruiters.
- **Bullet rewording:** Rephrase bullets to mirror the JD's language where the underlying achievement is the same. For example, if the JD says "model evaluation" and the CV says "tested ML models," rewrite to "Designed and executed model evaluation pipelines..."
- **Metric emphasis:** Ensure every bullet that has a quantifiable result leads with the metric. Use the format: "Achieved [metric] by [action] using [technology]."
- **Keyword threading:** Weave target keywords into bullet points naturally. Do not force keywords where they don't belong.
- **Do NOT add new bullets.** Only reorder and rephrase existing ones.
- **Do NOT remove bullets** unless they are completely irrelevant to the role and the section has more than 5 bullets.

#### Skills
- Reorder skills to lead with those most relevant to the JD.
- Group skills into categories that mirror the JD's structure (e.g., if the JD has "Languages," "Frameworks," "Cloud" sections).
- Do NOT add skills the candidate does not possess.

#### Education
- No changes unless the JD specifically values a particular degree or field — in that case, move relevant coursework or thesis details to the front.

#### Projects
- Reorder to prioritize projects most relevant to the JD.
- Rephrase descriptions to highlight alignment with the role requirements.

### Critical Constraints
1. **NEVER invent skills, experience, tools, or achievements.** If the candidate hasn't used a technology mentioned in the JD, do not add it. This is a hard rule.
2. **NEVER change company names, dates, job titles, or degree information.**
3. **Preserve all factual content.** Rephrasing for clarity and keyword alignment is allowed; fabrication is not.
4. **Maintain professional tone.** Do not use first person. Match the original CV's register.
5. **Track every change.** For each modification, add an entry to the \`changes_made\` array describing what was changed and why.

## Job Description

<jd>
${jdText}
</jd>

## Current CV Sections

<cv_sections>
${sectionsJson}
</cv_sections>

## Output Format

Return a JSON object with two fields:
- \`sections\`: Array of rewritten CV sections (same schema as the input, with updated \`content\` and reordered entries).
- \`changes_made\`: Array of strings, each describing one specific change (e.g., "Reordered experience bullets at Acme Corp to lead with MLOps pipeline achievement", "Injected keyword 'model evaluation' into second bullet at WidgetCo").

Do not wrap in markdown code fences.`;
}
