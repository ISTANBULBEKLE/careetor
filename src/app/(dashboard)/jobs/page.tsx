"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, Plus, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import { useSession } from "@/lib/auth-client";
import { getUserJobs, deleteJob } from "@/actions/job.actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { JobTable } from "@/components/jobs/job-table";
import type { JobStatus } from "@/types";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "evaluated", label: "Evaluated" },
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "skip", label: "Skip" },
];

const SCORE_OPTIONS: { value: string; label: string }[] = [
  { value: "0", label: "Any Score" },
  { value: "3", label: "3.0+" },
  { value: "3.5", label: "3.5+" },
  { value: "4", label: "4.0+" },
  { value: "4.5", label: "4.5+" },
];

export default function JobsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();

  const [jobs, setJobs] = useState<Awaited<ReturnType<typeof getUserJobs>>>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("0");
  const [search, setSearch] = useState("");

  const userId = session?.user?.id;

  const fetchJobs = useCallback(() => {
    if (!userId) return;

    startTransition(async () => {
      try {
        const result = await getUserJobs(userId, {
          status: statusFilter !== "all" ? statusFilter : undefined,
          minScore: Number(scoreFilter) > 0 ? Number(scoreFilter) : undefined,
          search: search.trim() || undefined,
        });
        setJobs(result);
      } catch {
        toast.error("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    });
  }, [userId, statusFilter, scoreFilter, search]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  async function handleDelete(jobId: string) {
    if (!userId) return;
    try {
      await deleteJob(jobId, userId);
      toast.success("Job deleted");
      fetchJobs();
    } catch {
      toast.error("Failed to delete job");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
          <p className="text-sm text-muted-foreground">
            Track and evaluate job opportunities in your pipeline.
          </p>
        </div>
        <Link href="/jobs/new" className={buttonVariants()}>
          <Plus className="size-4" />
          Add Job
        </Link>
      </div>

      <Separator />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger>
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={scoreFilter} onValueChange={(v) => setScoreFilter(v ?? "0")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCORE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <TableSkeleton rows={6} columns={7} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description={
            statusFilter !== "all" || search
              ? "No jobs match your current filters. Try adjusting your search or filters."
              : "Add your first job to evaluate. Paste a job description and let AI score it against your CV."
          }
          action={
            statusFilter === "all" && !search
              ? {
                  label: "Add your first job",
                  onClick: () => router.push("/jobs/new"),
                }
              : undefined
          }
        />
      ) : (
        <JobTable jobs={jobs} onDelete={handleDelete} />
      )}
    </div>
  );
}
