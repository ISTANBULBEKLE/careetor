// ============================================================
// Application Answers Prompt — generate answers for form questions
// ============================================================

/**
 * Build the user prompt for generating answers to common application
 * form questions (e.g., "Why do you want to work here?",
 * "Describe a time you led a project", visa/sponsorship questions).
 *
 * Use with `getSharedContext(profile)` as the system message.
 */
export function buildApplicationAnswersPrompt(
  jdText: string,
  cvText: string,
  questions: { id: string; question: string; max_length?: number }[]
): string {
  const questionsBlock = questions
    .map((q) => {
      const limit = q.max_length ? ` (max ${q.max_length} characters)` : "";
      return `- **[${q.id}]** ${q.question}${limit}`;
    })
    .join("\n");

  return `# Application Form Answers Request

Generate answers for the following application form questions. Each answer must be tailored to the specific role and grounded in the candidate's CV.

## Instructions

### General Rules
1. **Every answer must reference specific experience from the CV.** No generic responses. If the CV does not contain relevant experience for a question, use the closest adjacent experience and be transparent about the connection.
2. **Respect character limits.** If a max_length is specified, the answer MUST be at or below that character count. Count carefully.
3. **Mirror the JD's language.** Use keywords and phrases from the job description naturally.
4. **First person, active voice.** Write as the candidate speaking directly.
5. **No filler.** Every sentence must add value. Avoid "I believe", "I think", "I am passionate about" filler openers.

### Question-Type Strategies

**"Why this company/role?" questions:**
- Reference something specific about the company (product, mission, tech stack, recent news) from the JD.
- Connect it to a specific project or achievement from the CV.
- Show alignment between the candidate's trajectory and the role's scope.

**"Tell me about a time..." (behavioral) questions:**
- Use the STAR format: Situation (1 sentence), Task (1 sentence), Action (2-3 sentences), Result (1 sentence with metrics).
- Pick the most relevant story from the CV's experience entries.
- End with what was learned or how it applies to the target role.

**"What is your greatest strength/weakness?" questions:**
- Strength: Pick a skill that directly matches the JD's top requirement. Back it with a specific achievement.
- Weakness: Pick a genuine area of growth that is NOT a core JD requirement. Show active mitigation.

**"Salary expectations" questions:**
- If the candidate profile has salary info, use the target range from the profile.
- If no profile salary info, respond with: "I'm open to discussing compensation based on the full package and scope of the role."

**"Visa/authorization" questions:**
- Use visa status from the candidate profile if available.
- If no visa info, leave the answer as: "[CANDIDATE TO FILL — visa status not in profile]"

**"Anything else you'd like to share?" questions:**
- Highlight 1-2 unique differentiators not covered in other answers.
- Keep it brief (2-3 sentences max).

**Short-answer/yes-no questions:**
- Answer directly first, then provide brief context if relevant.

### Critical Constraints
1. **NEVER fabricate experience, skills, or achievements.**
2. **NEVER contradict information in the CV.** Dates, titles, and company names must be accurate.
3. **NEVER disclose internal evaluation scores or recommendations.**
4. **Character limits are HARD limits** — truncate gracefully if needed, don't just cut mid-sentence.

## Job Description

<jd>
${jdText}
</jd>

## Candidate CV

<cv>
${cvText}
</cv>

## Questions

${questionsBlock}

## Output Format

Return a JSON object with:
- \`answers\`: Array of objects, each with:
  - \`id\`: The question ID (matching the input).
  - \`question\`: The original question text.
  - \`answer\`: The generated answer text.
  - \`character_count\`: Integer character count of the answer.
  - \`cv_sources\`: Array of strings — specific CV entries/bullets used as source material.

Do not wrap in markdown code fences.`;
}
