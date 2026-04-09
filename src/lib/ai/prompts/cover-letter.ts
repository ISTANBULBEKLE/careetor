// ============================================================
// Cover Letter Prompt — generate a targeted cover letter
// ============================================================

/**
 * Build the user prompt for generating a cover letter.
 *
 * Use with `getSharedContext(profile)` as the system message.
 * The `evaluation` parameter should be the summary/recommendation
 * from a prior evaluation call, providing context on fit and gaps.
 */
export function buildCoverLetterPrompt(
  jdText: string,
  cvText: string,
  evaluation: {
    archetype: string;
    summary: string;
    keywords: string[];
    gaps: { skill: string; severity: string; mitigation: string }[];
    recommendation: string;
    overall_score: number;
  }
): string {
  return `# Cover Letter Generation Request

Write a compelling one-page cover letter for this role. The letter must map specific JD requirements to concrete proof points from the candidate's CV.

## Evaluation Context

The role was evaluated as **${evaluation.archetype}** with an overall score of **${evaluation.overall_score}/5** (recommendation: ${evaluation.recommendation}).

**Evaluation Summary:** ${evaluation.summary}

**Key Gaps to Address:** ${evaluation.gaps.length > 0 ? evaluation.gaps.map((g) => `${g.skill} (${g.severity}) — ${g.mitigation}`).join("; ") : "No significant gaps identified."}

## Cover Letter Requirements

### Structure
1. **Opening paragraph (2-3 sentences):** Hook with the candidate's most relevant achievement that directly addresses the role's core challenge. Name the company and role. Show you understand what the company does and why this role matters to them.

2. **Body paragraph 1 — Technical Fit (3-4 sentences):** Map the candidate's strongest technical qualifications to the JD's must-have requirements. Use specific metrics and project names from the CV. Mirror the JD's language and keywords naturally.

3. **Body paragraph 2 — Impact & Leadership (3-4 sentences):** Demonstrate scope and influence. Highlight cross-functional work, team leadership, or organizational impact that aligns with the role's level. Connect to the archetype's core value proposition.

4. **Body paragraph 3 — Gap Mitigation (2-3 sentences, only if gaps exist):** If there are medium or high severity gaps, proactively address the most critical one. Frame it as a growth opportunity or demonstrate adjacent experience. If no significant gaps, use this paragraph to reinforce cultural/mission alignment.

5. **Closing paragraph (2-3 sentences):** Express genuine interest. Reference something specific about the company (product, mission, recent news). End with a clear call to action.

### Tone & Style
- Professional but not stiff. Confident but not arrogant.
- First person, active voice.
- No generic platitudes ("I am passionate about...", "I would be a great fit...").
- Every sentence must earn its place — if it does not advance the case, cut it.
- Total length: 300-400 words. Must fit on one page.

### Keyword Integration
Incorporate these JD keywords naturally throughout the letter: ${evaluation.keywords.slice(0, 15).join(", ")}

### Critical Constraints
1. **NEVER claim skills, tools, or achievements not present in the CV.**
2. **NEVER mention the evaluation score or recommendation.** This is internal context only.
3. **DO NOT use the word "passionate" or "excited" more than once in the entire letter.**
4. **DO NOT open with "Dear Hiring Manager" if the JD mentions a specific team or person — address them.**
5. **DO NOT include a subject line — just the letter body.**

## Job Description

<jd>
${jdText}
</jd>

## Candidate CV

<cv>
${cvText}
</cv>

## Output Format

Return a JSON object with:
- \`cover_letter\`: The full cover letter text (plain text with paragraph breaks, no markdown formatting).
- \`word_count\`: Integer word count.
- \`proof_points_used\`: Array of strings — each CV proof point referenced in the letter (verbatim from CV).
- \`keywords_used\`: Array of strings — JD keywords successfully incorporated.

Do not wrap in markdown code fences.`;
}
