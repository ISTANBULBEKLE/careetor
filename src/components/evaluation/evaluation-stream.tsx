"use client";

import * as React from "react";
// AI evaluation uses server actions that return completed results

import { evaluateJob } from "@/actions/evaluation.actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AiStreamingText } from "@/components/shared/ai-streaming-text";
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface EvaluationStreamProps {
  jobId: string;
  userId: string;
  cvText: string;
  onComplete?: () => void;
}

type StreamState = "idle" | "streaming" | "complete" | "error";

export function EvaluationStream({
  jobId,
  userId,
  cvText,
  onComplete,
}: EvaluationStreamProps) {
  const [state, setState] = React.useState<StreamState>("idle");
  const [streamContent, setStreamContent] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const handleEvaluate = React.useCallback(async () => {
    setState("streaming");
    setStreamContent("");
    setError(null);

    try {
      const { evaluationText } = await evaluateJob(jobId, userId, cvText);

      setStreamContent(evaluationText);

      setState("complete");
      onComplete?.();
    } catch (err) {
      console.error("Evaluation failed:", err);
      setState("error");
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  }, [jobId, userId, cvText, onComplete]);

  if (state === "idle") {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
            <Sparkles className="size-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="mt-4 text-base font-semibold">AI Evaluation</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Run a comprehensive AI evaluation to analyze this job against your
            CV. This will score the opportunity across 10 dimensions and provide
            detailed block-by-block analysis.
          </p>
          <Button className="mt-6" onClick={handleEvaluate}>
            <Sparkles className="size-3.5" data-icon="inline-start" />
            Evaluate Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (state === "error") {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="mx-auto size-10 text-rose-500" />
          <h3 className="mt-4 text-base font-semibold">Evaluation Failed</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {error ?? "Something went wrong during the evaluation."}
          </p>
          <Button variant="outline" className="mt-4" onClick={handleEvaluate}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      {state === "streaming" && (
        <Card size="sm">
          <CardContent>
            <div className="flex items-center gap-3">
              <Loader2 className="size-4 animate-spin text-indigo-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Evaluating...</p>
                <p className="text-xs text-muted-foreground">
                  Analyzing job description against your CV
                </p>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={null} />
            </div>
          </CardContent>
        </Card>
      )}

      {state === "complete" && (
        <Card size="sm">
          <CardContent>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Evaluation complete! Scoring in progress...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Streaming content */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Report</CardTitle>
          <CardDescription>
            AI-generated analysis of this opportunity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AiStreamingText
            stream={streamContent}
            isLoading={state === "streaming"}
            className="max-h-[600px] overflow-y-auto"
          />
        </CardContent>
      </Card>
    </div>
  );
}
