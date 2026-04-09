"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Send,
  MessageSquare,
  Trophy,
  Sparkles,
  ArrowRight,
  Clock,
  Plus,
} from "lucide-react";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScoreBadge } from "@/components/shared/score-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import type { JobStatus } from "@/types";

// ---------------------------------------------------------------------------
// Mock data -- will be replaced with server action calls
// ---------------------------------------------------------------------------

const MOCK_USER = { name: "Alex" };

const MOCK_STATS = {
  active: 12,
  applied: 8,
  interviews: 3,
  offers: 1,
};

interface RecentJob {
  id: string;
  company: string;
  role: string;
  score: number;
  status: JobStatus;
  createdAt: Date;
}

const MOCK_RECENT_JOBS: RecentJob[] = [
  {
    id: "1",
    company: "Anthropic",
    role: "AI Platform Engineer",
    score: 4.7,
    status: "evaluated",
    createdAt: new Date("2026-04-07"),
  },
  {
    id: "2",
    company: "Stripe",
    role: "Senior Solutions Architect",
    score: 4.3,
    status: "applied",
    createdAt: new Date("2026-04-06"),
  },
  {
    id: "3",
    company: "Vercel",
    role: "AI Forward Deployed Engineer",
    score: 4.1,
    status: "interview",
    createdAt: new Date("2026-04-05"),
  },
  {
    id: "4",
    company: "OpenAI",
    role: "Technical Program Manager",
    score: 3.8,
    status: "evaluated",
    createdAt: new Date("2026-04-04"),
  },
  {
    id: "5",
    company: "Datadog",
    role: "Automation Platform Lead",
    score: 3.5,
    status: "applied",
    createdAt: new Date("2026-04-03"),
  },
];

const PIPELINE_DATA: { status: JobStatus; count: number; label: string }[] = [
  { status: "pending", count: 4, label: "Pending" },
  { status: "evaluated", count: 6, label: "Evaluated" },
  { status: "applied", count: 8, label: "Applied" },
  { status: "interview", count: 3, label: "Interview" },
  { status: "offer", count: 1, label: "Offer" },
  { status: "rejected", count: 2, label: "Rejected" },
];

const PIPELINE_COLORS: Record<string, string> = {
  pending: "bg-slate-400",
  evaluated: "bg-indigo-500",
  applied: "bg-sky-500",
  interview: "bg-amber-500",
  offer: "bg-emerald-500",
  rejected: "bg-rose-400",
};

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-1">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="size-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [quickInput, setQuickInput] = useState("");
  const hasJobs = MOCK_RECENT_JOBS.length > 0;

  const pipelineTotal = PIPELINE_DATA.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {MOCK_USER.name}
        </h1>
        <p className="text-muted-foreground">
          Here is what is happening with your job search.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Briefcase}
          label="Active Jobs"
          value={MOCK_STATS.active}
          accent="bg-indigo-500"
        />
        <StatCard
          icon={Send}
          label="Applied"
          value={MOCK_STATS.applied}
          accent="bg-sky-500"
        />
        <StatCard
          icon={MessageSquare}
          label="Interviews"
          value={MOCK_STATS.interviews}
          accent="bg-amber-500"
        />
        <StatCard
          icon={Trophy}
          label="Offers"
          value={MOCK_STATS.offers}
          accent="bg-emerald-500"
        />
      </div>

      {/* Quick Add */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-indigo-500" />
            Quick Evaluate
          </CardTitle>
          <CardDescription>
            Paste a job URL or description to instantly evaluate fit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              // TODO: navigate to evaluation flow
            }}
          >
            <Input
              placeholder="Paste job URL or description..."
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!quickInput.trim()}>
              <Sparkles className="size-3.5" data-icon="inline-start" />
              Evaluate
            </Button>
          </form>
        </CardContent>
      </Card>

      {hasJobs ? (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent evaluations */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Evaluations</h2>
              <Link href="/jobs" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {MOCK_RECENT_JOBS.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-center gap-4 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted font-semibold text-sm text-muted-foreground">
                    {job.company.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{job.role}</p>
                    <p className="text-xs text-muted-foreground">{job.company}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <ScoreBadge score={job.score} size="sm" />
                    <StatusBadge status={job.status} />
                    <span className="hidden text-xs text-muted-foreground sm:inline-flex items-center gap-1">
                      <Clock className="size-3" />
                      {format(job.createdAt, "MMM d")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Pipeline summary */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Pipeline Summary</h2>
            <Card>
              <CardContent className="space-y-4 pt-1">
                {/* Horizontal bar */}
                <div className="flex h-4 w-full overflow-hidden rounded-full">
                  {PIPELINE_DATA.map((d) => {
                    const pct = pipelineTotal > 0 ? (d.count / pipelineTotal) * 100 : 0;
                    if (pct === 0) return null;
                    return (
                      <div
                        key={d.status}
                        className={`${PIPELINE_COLORS[d.status]} transition-all`}
                        style={{ width: `${pct}%` }}
                        title={`${d.label}: ${d.count}`}
                      />
                    );
                  })}
                </div>

                <Separator />

                {/* Legend */}
                <div className="grid grid-cols-2 gap-2">
                  {PIPELINE_DATA.map((d) => (
                    <div key={d.status} className="flex items-center gap-2">
                      <div
                        className={`size-2.5 shrink-0 rounded-full ${PIPELINE_COLORS[d.status]}`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {d.label}
                      </span>
                      <span className="ml-auto text-xs font-medium tabular-nums">
                        {d.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Onboarding empty state */
        <Card>
          <CardContent>
            <EmptyState
              icon={Plus}
              title="Add your first job to get started"
              description="Paste a job URL or description above, or go to the Jobs page to add one manually. Careetor will evaluate your fit and help you apply."
              action={{
                label: "Go to Jobs",
                onClick: () => {
                  window.location.href = "/jobs";
                },
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
