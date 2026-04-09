"use client";

import * as React from "react";
// AI cover letter generation uses server actions that return completed results

import { generateCoverLetter } from "@/actions/application.actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AiStreamingText } from "@/components/shared/ai-streaming-text";
import {
  FileText,
  Copy,
  RefreshCw,
  Loader2,
  Check,
  Pencil,
  Eye,
} from "lucide-react";

import { getMasterCV } from "@/actions/cv.actions";
import { toast } from "sonner";

interface CoverLetterEditorProps {
  jobId: string;
  userId: string;
  initialText?: string;
}

type EditorState = "empty" | "generating" | "editing" | "viewing";

export function CoverLetterEditor({
  jobId,
  userId,
  initialText,
}: CoverLetterEditorProps) {
  const [state, setState] = React.useState<EditorState>(
    initialText ? "viewing" : "empty"
  );
  const [content, setContent] = React.useState(initialText ?? "");
  const [streamContent, setStreamContent] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const handleGenerate = React.useCallback(async () => {
    setState("generating");
    setStreamContent("");

    try {
      const masterCv = await getMasterCV(userId);
      if (!masterCv?.rawText) {
        toast.error("Please upload your CV first");
        setState(content ? "viewing" : "empty");
        return;
      }

      const { coverLetter } = await generateCoverLetter(
        jobId,
        userId,
        masterCv.rawText
      );

      setStreamContent(coverLetter);
      setContent(coverLetter);
      setState("viewing");
      toast.success("Cover letter generated");
    } catch (err) {
      console.error("Cover letter generation failed:", err);
      toast.error("Failed to generate cover letter");
      setState(content ? "viewing" : "empty");
    }
  }, [jobId, userId, content]);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }, [content]);

  if (state === "empty") {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted">
            <FileText className="size-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-semibold">Cover Letter</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Generate an AI-crafted cover letter tailored to this specific role
            and your CV.
          </p>
          <Button className="mt-6" onClick={handleGenerate}>
            <FileText className="size-3.5" data-icon="inline-start" />
            Generate Cover Letter
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (state === "generating") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin text-primary" />
            <CardTitle>Generating Cover Letter...</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <AiStreamingText
            stream={streamContent}
            isLoading={true}
            className="max-h-[500px] overflow-y-auto"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cover Letter</CardTitle>
        <CardAction>
          <div className="flex items-center gap-1">
            {state === "viewing" && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setState("editing")}
              >
                <Pencil className="size-3.5" />
                <span className="sr-only">Edit</span>
              </Button>
            )}
            {state === "editing" && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setState("viewing")}
              >
                <Eye className="size-3.5" />
                <span className="sr-only">Preview</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-500" />
              ) : (
                <Copy className="size-3.5" />
              )}
              <span className="sr-only">Copy</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleGenerate}
            >
              <RefreshCw className="size-3.5" />
              <span className="sr-only">Regenerate</span>
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        {state === "editing" ? (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
            placeholder="Edit your cover letter..."
          />
        ) : (
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {content}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
