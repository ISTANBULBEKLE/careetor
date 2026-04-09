"use client";

import * as React from "react";
import Link from "next/link";
import {
  LayoutGrid,
  List,
  Search,
  MoreHorizontal,
  ExternalLink,
  Eye,
  Trash2,
  ChevronDown,
  Briefcase,
  CheckCircle2,
  MessageSquare,
  Trophy,
  XCircle,
  Archive,
} from "lucide-react";

import { useSession } from "@/lib/auth-client";
import {
  getUserJobs,
  updateJobStatus,
  deleteJob,
  getJobStats,
} from "@/actions/job.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";

import {
  type JobStatus,
  getScoreColor,
  getScoreBgColor,
} from "@/types";

import { toast } from "sonner";

type Job = Awaited<ReturnType<typeof getUserJobs>>[number];

const KANBAN_COLUMNS: {
  status: JobStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { status: "evaluated", label: "Evaluated", icon: Briefcase },
  { status: "applied", label: "Applied", icon: CheckCircle2 },
  { status: "interview", label: "Interview", icon: MessageSquare },
  { status: "offer", label: "Offer", icon: Trophy },
];

const COLLAPSED_STATUSES: {
  status: JobStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { status: "rejected", label: "Rejected", icon: XCircle },
  { status: "discarded", label: "Discarded", icon: Archive },
];

const ALL_STATUSES: JobStatus[] = [
  "pending",
  "evaluated",
  "applied",
  "responded",
  "interview",
  "offer",
  "rejected",
  "discarded",
  "skip",
];

export default function ApplicationsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [stats, setStats] = React.useState<Awaited<
    ReturnType<typeof getJobStats>
  > | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<"table" | "kanban">("table");

  // Filters
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");
  const [minScore, setMinScore] = React.useState<string>("0");

  // Fetch data
  React.useEffect(() => {
    if (!userId) return;

    async function fetchData() {
      try {
        const [jobsData, statsData] = await Promise.all([
          getUserJobs(userId!),
          getJobStats(userId!),
        ]);
        setJobs(jobsData);
        setStats(statsData);
      } catch (error) {
        console.error("Failed to load applications:", error);
        toast.error("Failed to load applications");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  // Filter jobs
  const filteredJobs = React.useMemo(() => {
    let result = jobs;

    if (statusFilter !== "all") {
      result = result.filter((j) => j.status === statusFilter);
    }

    if (Number(minScore) > 0) {
      result = result.filter(
        (j) => j.score && Number(j.score) >= Number(minScore)
      );
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.company.toLowerCase().includes(s) ||
          j.role.toLowerCase().includes(s)
      );
    }

    return result;
  }, [jobs, statusFilter, search, minScore]);

  const handleStatusChange = React.useCallback(
    async (jobId: string, newStatus: string) => {
      if (!userId) return;
      try {
        await updateJobStatus(jobId, userId, newStatus);
        setJobs((prev) =>
          prev.map((j) =>
            j.id === jobId
              ? { ...j, status: newStatus as JobStatus }
              : j
          )
        );
        toast.success(`Status updated to ${newStatus}`);
      } catch {
        toast.error("Failed to update status");
      }
    },
    [userId]
  );

  const handleDelete = React.useCallback(
    async (jobId: string) => {
      if (!userId) return;
      try {
        await deleteJob(jobId, userId);
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
        toast.success("Job deleted");
      } catch {
        toast.error("Failed to delete job");
      }
    },
    [userId]
  );

  if (loading) {
    return <ApplicationsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track and manage your job applications pipeline
        </p>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Pending" value={stats.pending} />
          <StatCard label="Evaluated" value={stats.evaluated} />
          <StatCard label="Applied" value={stats.applied} />
          <StatCard label="Interview" value={stats.interview} />
          <StatCard label="Offer" value={stats.offer} />
          <StatCard
            label="Avg Score"
            value={stats.avgScore > 0 ? stats.avgScore.toFixed(1) : "-"}
          />
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ALL_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={minScore} onValueChange={(v) => setMinScore(v ?? "0")}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any Score</SelectItem>
            <SelectItem value="3">3.0+</SelectItem>
            <SelectItem value="3.5">3.5+</SelectItem>
            <SelectItem value="4">4.0+</SelectItem>
            <SelectItem value="4.5">4.5+</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setViewMode("table")}
          >
            <List className="size-4" />
            <span className="sr-only">Table view</span>
          </Button>
          <Button
            variant={viewMode === "kanban" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setViewMode("kanban")}
          >
            <LayoutGrid className="size-4" />
            <span className="sr-only">Kanban view</span>
          </Button>
        </div>
      </div>

      {/* View */}
      {viewMode === "table" ? (
        <ApplicationsTableView
          jobs={filteredJobs}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      ) : (
        <KanbanView
          jobs={filteredJobs}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

// -- Table View --

function ApplicationsTableView({
  jobs,
  onStatusChange,
  onDelete,
}: {
  jobs: Job[];
  onStatusChange: (jobId: string, status: string) => Promise<void>;
  onDelete: (jobId: string) => Promise<void>;
}) {
  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No applications found matching your filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Added</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => {
            const score = job.score ? Number(job.score) : null;
            return (
              <TableRow key={job.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="transition-colors hover:text-primary"
                  >
                    {job.company}
                  </Link>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                  {job.role}
                </TableCell>
                <TableCell>
                  {score !== null ? (
                    <span
                      className={`font-mono text-sm font-semibold ${getScoreColor(score)}`}
                    >
                      {score.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Select
                    value={job.status ?? "pending"}
                    onValueChange={(val) => val && onStatusChange(job.id, val)}
                  >
                    <SelectTrigger size="sm" className="h-6 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {job.createdAt
                    ? new Date(job.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "-"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-xs" />
                      }
                    >
                      <MoreHorizontal className="size-3.5" />
                      <span className="sr-only">Actions</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        render={<Link href={`/jobs/${job.id}`} />}
                      >
                        <Eye className="size-3.5" />
                        View Details
                      </DropdownMenuItem>
                      {job.sourceUrl && (
                        <DropdownMenuItem
                          render={
                            <a
                              href={job.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          }
                        >
                          <ExternalLink className="size-3.5" />
                          Open Source
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDelete(job.id)}
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

// -- Kanban View --

function KanbanView({
  jobs,
  onStatusChange,
}: {
  jobs: Job[];
  onStatusChange: (jobId: string, status: string) => Promise<void>;
}) {
  const jobsByStatus = React.useMemo(() => {
    const map = new Map<string, Job[]>();
    for (const status of [
      ...KANBAN_COLUMNS.map((c) => c.status),
      ...COLLAPSED_STATUSES.map((c) => c.status),
    ]) {
      map.set(status, []);
    }
    for (const job of jobs) {
      const status = job.status ?? "pending";
      const current = map.get(status);
      if (current) {
        current.push(job);
      }
    }
    return map;
  }, [jobs]);

  return (
    <div className="space-y-6">
      {/* Main columns */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KANBAN_COLUMNS.map((col) => {
          const Icon = col.icon;
          const columnJobs = jobsByStatus.get(col.status) ?? [];
          return (
            <div key={col.status} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">{col.label}</h3>
                <Badge variant="secondary" className="ml-auto">
                  {columnJobs.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {columnJobs.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <p className="text-xs text-muted-foreground">No jobs</p>
                  </div>
                ) : (
                  columnJobs.map((job) => (
                    <KanbanCard
                      key={job.id}
                      job={job}
                      onStatusChange={onStatusChange}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Collapsed sections */}
      {COLLAPSED_STATUSES.map((col) => {
        const Icon = col.icon;
        const columnJobs = jobsByStatus.get(col.status) ?? [];
        if (columnJobs.length === 0) return null;

        return (
          <Collapsible key={col.status}>
            <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted">
              <Icon className="size-4 text-muted-foreground" />
              {col.label}
              <Badge variant="secondary" className="ml-1">
                {columnJobs.length}
              </Badge>
              <ChevronDown className="ml-auto size-4 text-muted-foreground transition-transform [[data-open]>&]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {columnJobs.map((job) => (
                  <KanbanCard
                    key={job.id}
                    job={job}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}

function KanbanCard({
  job,
  onStatusChange,
}: {
  job: Job;
  onStatusChange: (jobId: string, status: string) => Promise<void>;
}) {
  const score = job.score ? Number(job.score) : null;

  return (
    <Card size="sm">
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/jobs/${job.id}`}
              className="text-sm font-semibold transition-colors hover:text-primary"
            >
              {job.company}
            </Link>
            {score !== null && (
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-mono font-semibold ${getScoreBgColor(score)} ${getScoreColor(score)}`}
              >
                {score.toFixed(1)}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {job.role}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <Select
              value={job.status ?? "pending"}
              onValueChange={(val) => val && onStatusChange(job.id, val)}
            >
              <SelectTrigger size="sm" className="h-6 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// -- Stat Card --

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card size="sm">
      <CardContent>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

// -- Loading Skeleton --

function ApplicationsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-8 flex-1 max-w-xs" />
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-8 w-32" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
