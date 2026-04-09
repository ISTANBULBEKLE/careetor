import { createOpenAI } from "@ai-sdk/openai";

// Ollama exposes an OpenAI-compatible API at localhost:11434
const ollama = createOpenAI({
  baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
  apiKey: "ollama", // Ollama doesn't need a real key but the SDK requires one
});

// Model name from env or default to Qwen 2.5 32B
const modelName = process.env.OLLAMA_MODEL || "qwen2.5:32b";

// Both exports use the same local model via Ollama chat completions API
// sonnet = used for structured output (generateObject): CV parsing, scoring, URL parsing
// opus = used for long-form generation (generateText): evaluations, cover letters
export const sonnet = ollama.chat(modelName);
export const opus = ollama.chat(modelName);
