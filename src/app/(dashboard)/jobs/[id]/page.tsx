"use client";

import * as React from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Building2,
  DollarSign,
  Wifi,
  Sparkles,
  FileText,
  Send,
  Clock,
  MessageSquare,
} from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { getJob } from "@/actions/job.actions";
import { getEvaluation } from "@/actions/evaluation.actions";
import { getApplication } from "@/actions/application.actions";
import { getMasterCV } from "@/actions/cv.actions";
import { updateJobStatus } from "@/actions/job.actions";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { StatusBadge } from "@/components/shared/status-badge";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { EvaluationStream } from "@/components/evaluation/evaluation-stream";
import { ScoreRadar } from "@/components/evaluation/score-radar";
import { BlockCard } from "@/components/evaluation/block-card";
import { CoverLetterEditor } from "@/components/application/cover-letter-editor";

import {
  type JobStatus,
  type JobScores,
  getScoreColor,
  getScoreBgColor,
  getScoreLabel,
} from "@/types";

import { toast } from "sonner";

type Job = NonNullable<Awaited<ReturnType<typeof getJob>>>;
type Evaluation = Awaited<ReturnType<typeof getEvaluation>>;
type Application = NonNullable<Awaited<ReturnType<typeof getApplication>>>;

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [job, setJob] = React.useState<Job | null>(null);
  const [evaluation, setEvaluation] = React.useState<Evaluation>(null);
  const [application, setApplication] = React.useState<Application | null>(null);
  const [cvText, setCvText] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);

  const userId = session?.user?.id;

  // Fetch data on mount
  React.useEffect(() => {
    if (!userId) return;

    async function fetchData() {
      try {
        const [jobData, evalData, appData, masterCv] = await Promise.all([
          getJob(id, userId!),
          getEvaluation(id, userId!),
          getApplication(id, userId!),
          getMasterCV(userId!),
        ]);
        setJob(jobData ?? null);
        setEvaluation(evalData);
        setApplication(appData ?? null);
        setCvText(masterCv?.rawText ?? "");
      } catch (error) {
        console.error("Failed to load job details:", error);
        toast.error("Failed to load job details");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, userId]);

  const handleStatusChange = React.useCallback(
    async (newStatus: string) => {
      if (!userId || !job) return;
      try {
        await updateJobStatus(job.id, userId, newStatus);
        setJob((prev) => (prev ? { ...prev, status: newStatus as JobStatus } : prev));
        toast.success(`Status updated to ${newStatus}`);
      } catch {
        toast.error("Failed to update status");
      }
    },
    [userId, job]
  );

  const handleEvaluationComplete = React.useCallback(() => {
    // Refetch evaluation and job data after evaluation completes
    if (!userId) return;
    Promise.all([getJob(id, userId), getEvaluation(id, userId)]).then(
      ([jobData, evalData]) => {
        setJob(jobData ?? null);
        setEvaluation(evalData);
      }
    );
  }, [id, userId]);

  if (loading) {
    return <JobDetailSkeleton />;
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <h2 className="text-lg font-semibold">Job not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This job may have been deleted or you do not have access.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/jobs")}>
          Back to Jobs
        </Button>
      </div>
    );
  }

  const score = job.score ? Number(job.score) : null;

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-3.5" data-icon="inline-start" />
        Back
      </Button>

      {/* Job Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-muted-foreground" />
            <h1 className="text-2xl font-bold tracking-tight">{job.company}</h1>
          </div>
          <h2 className="text-lg text-muted-foreground">{job.role}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={job.status as JobStatus} />
            {score !== null && (
              <Badge
                variant="secondary"
                className={`border-transparent font-mono font-semibold ${getScoreBgColor(score)} ${getScoreColor(score)}`}
              >
                {score.toFixed(1)} - {getScoreLabel(score)}
              </Badge>
            )}
            {job.detectedArchetype && (
              <Badge variant="outline">{job.detectedArchetype}</Badge>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {job.location}
              </span>
            )}
            {job.remotePolicy && (
              <span className="flex items-center gap-1">
                <Wifi className="size-3.5" />
                {job.remotePolicy}
              </span>
            )}
            {job.salaryRange && (
              <span className="flex items-center gap-1">
                <DollarSign className="size-3.5" />
                {job.salaryRange}
              </span>
            )}
            {job.sourceUrl && (
              <a
                href={job.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary transition-colors hover:text-primary/80"
              >
                <ExternalLink className="size-3.5" />
                Source
              </a>
            )}
          </div>
        </div>

        {/* Status dropdown */}
        <Select value={job.status ?? "pending"} onValueChange={(v) => v && handleStatusChange(v)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="evaluated">Evaluated</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="responded">Responded</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="discarded">Discarded</SelectItem>
            <SelectItem value="skip">Skip</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList variant="line">
          <TabsTrigger value="overview">
            <FileText className="size-3.5" data-icon="inline-start" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="evaluation">
            <Sparkles className="size-3.5" data-icon="inline-start" />
            Evaluation
          </TabsTrigger>
          <TabsTrigger value="application">
            <Send className="size-3.5" data-icon="inline-start" />
            Application
          </TabsTrigger>
          <TabsTrigger value="interview">
            <MessageSquare className="size-3.5" data-icon="inline-start" />
            Interview Prep
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="mt-4 grid gap-6 lg:grid-cols-3">
            {/* JD Text */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[600px] overflow-y-auto pr-2">
                  <MarkdownRenderer content={job.jdText} />
                </div>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Key Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="font-medium text-muted-foreground">Company</dt>
                      <dd className="mt-0.5">{job.company}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground">Role</dt>
                      <dd className="mt-0.5">{job.role}</dd>
                    </div>
                    {job.location && (
                      <div>
                        <dt className="font-medium text-muted-foreground">Location</dt>
                        <dd className="mt-0.5">{job.location}</dd>
                      </div>
                    )}
                    {job.remotePolicy && (
                      <div>
                        <dt className="font-medium text-muted-foreground">Remote Policy</dt>
                        <dd className="mt-0.5">{job.remotePolicy}</dd>
                      </div>
                    )}
                    {job.salaryRange && (
                      <div>
                        <dt className="font-medium text-muted-foreground">Salary Range</dt>
                        <dd className="mt-0.5">{job.salaryRange}</dd>
                      </div>
                    )}
                    {job.detectedArchetype && (
                      <div>
                        <dt className="font-medium text-muted-foreground">Archetype</dt>
                        <dd className="mt-0.5">
                          <Badge variant="outline">{job.detectedArchetype}</Badge>
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="font-medium text-muted-foreground">Source</dt>
                      <dd className="mt-0.5 capitalize">{job.source}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground">Added</dt>
                      <dd className="mt-0.5">
                        {job.createdAt
                          ? new Date(job.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "-"}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Score summary if evaluated */}
              {score !== null && (
                <Card>
                  <CardHeader>
                    <CardTitle>Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-14 items-center justify-center rounded-xl text-2xl font-bold ${getScoreBgColor(score)} ${getScoreColor(score)}`}
                      >
                        {score.toFixed(1)}
                      </div>
                      <div>
                        <p className={`font-semibold ${getScoreColor(score)}`}>
                          {getScoreLabel(score)}
                        </p>
                        {evaluation?.recommendation && (
                          <p className="text-sm text-muted-foreground capitalize">
                            {evaluation.recommendation.replace("_", " ")}
                          </p>
                        )}
                      </div>
                    </div>
                    {evaluation?.summary && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        {evaluation.summary}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Evaluation Tab */}
        <TabsContent value="evaluation">
          <div className="mt-4">
            {evaluation ? (
              <EvaluationDisplay evaluation={evaluation} />
            ) : (
              <div className="space-y-4">
                {!cvText ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">
                        Please upload your CV first before evaluating this job.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => router.push("/cv")}
                      >
                        Go to CV
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <EvaluationStream
                    jobId={id}
                    userId={userId!}
                    cvText={cvText}
                    onComplete={handleEvaluationComplete}
                  />
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Application Tab */}
        <TabsContent value="application">
          <div className="mt-4 space-y-6">
            {/* Cover Letter */}
            <CoverLetterEditor
              jobId={id}
              userId={userId!}
              initialText={application?.coverLetter ?? undefined}
            />

            {/* Application Notes */}
            {application?.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{application.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => handleStatusChange("applied")}
                disabled={job.status === "applied"}
              >
                <Send className="size-3.5" data-icon="inline-start" />
                Mark as Applied
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Interview Prep Tab */}
        <TabsContent value="interview">
          <div className="mt-4">
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="mx-auto size-10 text-muted-foreground/50" />
                <h3 className="mt-4 text-base font-semibold">Coming Soon</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Interview preparation with AI-generated questions, STAR stories,
                  and company research will be available here.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// -- Sub-components --

function EvaluationDisplay({ evaluation }: { evaluation: NonNullable<Evaluation> }) {
  const scores = evaluation.scoresJson as JobScores | null;
  const blocks = evaluation.blocks ?? [];

  return (
    <div className="space-y-6">
      {/* Score overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Radar Chart */}
        {scores && (
          <Card>
            <CardHeader>
              <CardTitle>Score Dimensions</CardTitle>
              <CardDescription>
                10-dimension radar view of this opportunity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScoreRadar scores={scores} />
            </CardContent>
          </Card>
        )}

        {/* Score Breakdown */}
        {scores && (
          <Card>
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SCORE_DIMENSIONS.map((dim) => {
                  const value = scores[dim.key as keyof JobScores];
                  return (
                    <div key={dim.key} className="flex items-center gap-3">
                      <span className="w-40 shrink-0 text-sm text-muted-foreground">
                        {dim.label}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-indigo-500 transition-all"
                          style={{ width: `${(value / 5) * 100}%` }}
                        />
                      </div>
                      <span className={`w-8 text-right text-sm font-mono font-semibold ${getScoreColor(value)}`}>
                        {value.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Gaps */}
      {evaluation.gaps && (evaluation.gaps as Array<{ skill: string; severity: string; mitigation: string }>).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Identified Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(evaluation.gaps as Array<{ skill: string; severity: string; mitigation: string }>).map((gap, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                  <Badge
                    variant="secondary"
                    className={
                      gap.severity === "high"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                        : gap.severity === "medium"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    }
                  >
                    {gap.severity}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{gap.skill}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {gap.mitigation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keywords */}
      {evaluation.keywords && (evaluation.keywords as string[]).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(evaluation.keywords as string[]).map((keyword, i) => (
                <Badge key={i} variant="outline">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evaluation blocks A-F */}
      {blocks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Detailed Evaluation</h3>
          <Tabs defaultValue={blocks[0]?.block ?? "A"}>
            <TabsList variant="line">
              {blocks.map((block) => (
                <TabsTrigger key={block.block} value={block.block}>
                  Block {block.block}
                </TabsTrigger>
              ))}
            </TabsList>
            {blocks.map((block) => (
              <TabsContent key={block.block} value={block.block}>
                <div className="mt-4">
                  <BlockCard
                    block={block.block as "A" | "B" | "C" | "D" | "E" | "F"}
                    title={block.title}
                    content={block.content}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
}

function JobDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-20" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      <Skeleton className="h-8 w-80" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 lg:col-span-2" />
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  );
}

const SCORE_DIMENSIONS = [
  { key: "archetype_alignment", label: "Archetype Alignment" },
  { key: "cv_match", label: "CV Match" },
  { key: "seniority_fit", label: "Seniority Fit" },
  { key: "compensation", label: "Compensation" },
  { key: "career_growth", label: "Career Growth" },
  { key: "remote_policy", label: "Remote Policy" },
  { key: "company_reputation", label: "Company Reputation" },
  { key: "tech_stack", label: "Tech Stack" },
  { key: "process_speed", label: "Process Speed" },
  { key: "cultural_signals", label: "Cultural Signals" },
] as const;
