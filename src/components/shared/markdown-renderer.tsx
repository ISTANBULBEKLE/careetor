"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderMarkdown(markdown: string): string {
  let html = escapeHtml(markdown);

  // Code blocks (triple backtick)
  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    (_match, _lang, code) =>
      `<pre class="rounded-lg bg-muted p-4 overflow-x-auto text-sm"><code>${code.trim()}</code></pre>`
  );

  // Inline code
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">$1</code>'
  );

  // Headings (must come before bold to avoid conflicts)
  html = html.replace(
    /^#### (.+)$/gm,
    '<h4 class="mt-4 mb-2 text-sm font-semibold">$1</h4>'
  );
  html = html.replace(
    /^### (.+)$/gm,
    '<h3 class="mt-5 mb-2 text-base font-semibold">$1</h3>'
  );
  html = html.replace(
    /^## (.+)$/gm,
    '<h2 class="mt-6 mb-3 text-lg font-semibold">$1</h2>'
  );
  html = html.replace(
    /^# (.+)$/gm,
    '<h1 class="mt-6 mb-3 text-xl font-bold">$1</h1>'
  );

  // Bold and italic
  html = html.replace(
    /\*\*\*(.+?)\*\*\*/g,
    "<strong><em>$1</em></strong>"
  );
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Horizontal rule
  html = html.replace(
    /^---$/gm,
    '<hr class="my-4 border-border" />'
  );

  // Unordered lists
  html = html.replace(/^[-*] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(
    /(<li[^>]*>.*<\/li>\n?)+/g,
    (match) => `<ul class="my-2 space-y-1">${match}</ul>`
  );

  // Ordered lists
  html = html.replace(
    /^\d+\. (.+)$/gm,
    '<li class="ml-4 list-decimal">$1</li>'
  );
  html = html.replace(
    /(<li class="ml-4 list-decimal">.*<\/li>\n?)+/g,
    (match) => `<ol class="my-2 space-y-1">${match}</ol>`
  );

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-primary underline underline-offset-4 hover:text-primary/80" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Paragraphs — wrap remaining text lines
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      // Don't wrap blocks that are already HTML elements
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<blockquote")
      ) {
        return trimmed;
      }
      return `<p class="my-2 leading-relaxed">${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");

  return html;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const html = React.useMemo(() => renderMarkdown(content), [content]);

  return (
    <div
      className={cn(
        "prose-sm text-foreground [&_strong]:font-semibold [&_em]:italic",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
