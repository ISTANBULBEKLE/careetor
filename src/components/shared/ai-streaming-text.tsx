"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";

interface AiStreamingTextProps {
  stream: string;
  isLoading: boolean;
  className?: string;
}

export function AiStreamingText({
  stream,
  isLoading,
  className,
}: AiStreamingTextProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as content streams in
  React.useEffect(() => {
    if (containerRef.current && isLoading) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [stream, isLoading]);

  if (!stream && isLoading) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <span className="text-sm">Thinking</span>
        <span className="inline-flex gap-0.5">
          <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
          <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
          <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
        </span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <MarkdownRenderer content={stream} />
      {isLoading && (
        <span
          className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-foreground align-text-bottom"
          aria-label="Loading"
        />
      )}
    </div>
  );
}
