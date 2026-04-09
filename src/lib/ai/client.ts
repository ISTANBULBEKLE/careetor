import { createAnthropic } from "@ai-sdk/anthropic";

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Model shortcuts
export const sonnet = anthropic("claude-sonnet-4-6");
export const opus = anthropic("claude-opus-4-6");
