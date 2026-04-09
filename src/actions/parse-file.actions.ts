"use server";

import { extractText } from "unpdf";

export async function extractTextFromPDF(
  base64Data: string
): Promise<string> {
  const buffer = Buffer.from(base64Data, "base64");

  const { text } = await extractText(new Uint8Array(buffer));

  const cleaned = (Array.isArray(text) ? text.join("\n") : String(text)).trim();

  if (cleaned.length < 50) {
    throw new Error(
      "Could not extract enough text from the PDF. The file might be image-based or scanned. Try copying and pasting the text instead."
    );
  }

  return cleaned;
}
