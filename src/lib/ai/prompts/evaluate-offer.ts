// ============================================================
// Evaluate Offer Prompt — A-F block evaluation of a job against CV
// ============================================================

/**
 * Build the user prompt for a full A-F block evaluation.
 *
 * Returns a prompt that instructs Claude to evaluate the role across
 * six blocks and compute the overall weighted score.
 *
 * Use with `getSharedContext(profile)` as the system message and
 * `evaluationOutputSchema` for structured output.
 */
export function buildEvaluationPrompt(
  jdText: string,
  cvText: string,
  articleDigest?: string
): string {
  const parts: string[] = [];

  parts.push(`# Job Evaluation Request

Evaluate the following job description against the candidate's CV. Produce a structured evaluation across blocks A through F, score all 10 dimensions, compute the weighted overall score, and return a recommendation.`);

  // --- Block definitions ---

  parts.push(`## Evaluation Blocks

### Block A — Role Summary
Provide a concise summary of the role:
- Company name and what the company does (1 sentence).
- Role title and team/division if mentioned.
- Primary archetype classification (pick exactly one from the 6 archetypes).
- Key responsibilities (top 5, extracted verbatim from the JD).
- Stated or inferred seniority level (e.g., IC4, IC5, Staff, Senior Staff, M1, M2).
- Location and remote policy.
- Compensation range if stated; otherwise note "not disclosed".

### Block B — CV Match Analysis
Perform a detailed match between the JD requirements and the candidate's CV:
- List every JD requirement/keyword and mark it as: STRONG MATCH (direct experience), PARTIAL MATCH (adjacent experience), or GAP (not demonstrated in CV).
- Calculate a match percentage: (strong_matches + 0.5 * partial_matches) / total_requirements.
- Identify the candidate's strongest proof points for this role — quote specific CV bullets.
- Identify the top 3 gaps and assess their severity.

### Block C — Level Strategy
Analyze the seniority dynamics:
- What level does the JD target? Look for years-of-experience requirements, scope indicators (team size, budget, org influence), and title signals.
- How does this compare to the candidate's current/most recent level?
- If over-leveled: outline the stretch areas and risk of rejection.
- If under-leveled: assess whether this is a stepping stone or a step back.
- Suggest a positioning strategy (how to frame experience in the application).

### Block D — Compensation Research
Analyze the compensation landscape:
- If the JD states a range, compare it to the candidate's expectations.
- If no range is stated, estimate based on: role level, company stage, location, and archetype benchmarks.
- Flag any red flags (e.g., below-market for the level, equity-heavy with no disclosed valuation).
- Provide a brief negotiation note if the candidate were to receive an offer.

### Block E — CV Personalization Guide
Provide specific instructions for tailoring the CV:
- Which keywords from the JD must appear in the tailored CV? List them verbatim.
- Which CV bullets should be promoted to the top of their section?
- Which bullets should be reworded, and how? Provide before/after examples.
- Should the summary/objective be rewritten? If so, draft a replacement.
- Are there any sections to add or remove for this specific application?
- CRITICAL: Never suggest adding skills or experience the candidate does not have.

### Block F — Interview Prep Snapshot
Prepare the candidate for interviews:
- List 5 likely technical questions based on the JD.
- List 3 likely behavioral questions based on the company culture and role.
- Identify 2-3 STAR stories from the CV that map to this role's key challenges.
- Note any company-specific preparation (recent news, product launches, tech blog posts).
- Suggest 3 questions the candidate should ask the interviewer.`);

  // --- Scoring instructions ---

  parts.push(`## Scoring Instructions

After completing blocks A-F, score all 10 dimensions (1-5 scale) according to the scoring rules in the system prompt. Then:

1. Compute the weighted overall score.
2. Apply the hard-veto rule (any dimension at 1 caps overall at 3.5).
3. Apply the archetype/CV gates (archetype_alignment <= 2 or cv_match <= 2 prevents strong_apply).
4. Map the overall score to a recommendation: strong_apply, apply, review, or skip.
5. Extract all relevant JD keywords for the \`keywords\` array.
6. Populate the \`gaps\` array with every identified gap, severity, and mitigation.
7. Write a 2-4 sentence executive summary.`);

  // --- Input documents ---

  parts.push(`## Job Description

<jd>
${jdText}
</jd>`);

  parts.push(`## Candidate CV

<cv>
${cvText}
</cv>`);

  if (articleDigest) {
    parts.push(`## Additional Context (Company Research / Articles)

<articles>
${articleDigest}
</articles>

Use this context to inform Block D (compensation) and Block F (interview prep). Reference specific articles when relevant.`);
  }

  parts.push(`## Output Format

Return a single JSON object matching the evaluation schema. Do not wrap in markdown code fences. Ensure all blocks A-F are included in the \`blocks\` array.`);

  return parts.join("\n\n");
}
