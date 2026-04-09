"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  ExternalLink,
  Eye,
  Sparkles,
  FileText,
  Trash2,
  MoreHorizontal,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScoreBadge } from "@/components/shared/score-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import type { JobStatus } from "@/types";

interface Job {
  id: string;
  company: string;
  role: string;
  status: JobStatus | null;
  score: string | null;
  detectedArchetype: string | null;
  sourceUrl: string | null;
  location: string | null;
  createdAt: Date;
}

interface JobTableProps {
  jobs: Job[];
  onDelete?: (jobId: string) => void;
}

type SortField = "company" | "role" | "score" | "status" | "date";
type SortDir = "asc" | "desc";

function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function JobTable({ jobs, onDelete }: JobTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "score" ? "desc" : "asc");
    }
  }

  const sorted = [...jobs].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortField) {
      case "company":
        return a.company.localeCompare(b.company) * dir;
      case "role":
        return a.role.localeCompare(b.role) * dir;
      case "score": {
        const sa = a.score ? Number(a.score) : 0;
        const sb = b.score ? Number(b.score) : 0;
        return (sa - sb) * dir;
      }
      case "status":
        return (a.status ?? "").localeCompare(b.status ?? "") * dir;
      case "date":
        return (
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
          dir
        );
      default:
        return 0;
    }
  });

  function SortableHeader({
    field,
    children,
    className,
  }: {
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <TableHead className={className}>
        <button
          className="inline-flex items-center gap-1 hover:text-foreground"
          onClick={() => toggleSort(field)}
        >
          {children}
          <ArrowUpDown
            className={cn(
              "size-3",
              sortField === field
                ? "text-foreground"
                : "text-muted-foreground/50"
            )}
          />
        </button>
      </TableHead>
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 text-center">#</TableHead>
            <SortableHeader field="company">Company</SortableHeader>
            <SortableHeader field="role">Role</SortableHeader>
            <SortableHeader field="score">Score</SortableHeader>
            <SortableHeader field="status">Status</SortableHeader>
            <TableHead>Archetype</TableHead>
            <SortableHeader field="date">Date</SortableHeader>
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((job, index) => {
            const score = job.score ? Number(job.score) : null;
            const status = (job.status ?? "pending") as JobStatus;

            return (
              <TableRow
                key={job.id}
                className="cursor-pointer"
                onClick={() => router.push(`/jobs/${job.id}`)}
              >
                <TableCell className="text-center text-xs text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{job.company}</span>
                    {job.sourceUrl && (
                      <a
                        href={job.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="max-w-48 truncate text-sm">{job.role}</span>
                </TableCell>
                <TableCell>
                  {score !== null ? (
                    <ScoreBadge score={score} size="sm" />
                  ) : (
                    <span className="text-xs text-muted-foreground">--</span>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={status} />
                </TableCell>
                <TableCell>
                  {job.detectedArchetype ? (
                    <Badge variant="outline" className="text-xs">
                      {job.detectedArchetype}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">--</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(job.createdAt)}
                </TableCell>
                <TableCell>
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-xs" />
                        }
                      >
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          render={<Link href={`/jobs/${job.id}`} />}
                        >
                          <Eye className="size-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          render={
                            <Link href={`/jobs/${job.id}#evaluate`} />
                          }
                        >
                          <Sparkles className="size-4" />
                          Evaluate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          render={
                            <Link href={`/jobs/${job.id}#generate-cv`} />
                          }
                        >
                          <FileText className="size-4" />
                          Generate CV
                        </DropdownMenuItem>
                        {onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => onDelete(job.id)}
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
