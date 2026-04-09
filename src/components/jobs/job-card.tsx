"use client";

import Link from "next/link";
import {
  ExternalLink,
  Sparkles,
  FileText,
  Trash2,
  Eye,
  MoreHorizontal,
  Calendar,
  MapPin,
  Building2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

interface JobCardProps {
  job: Job;
  onDelete?: (jobId: string) => void;
}

function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function JobCard({ job, onDelete }: JobCardProps) {
  const score = job.score ? Number(job.score) : null;
  const status = (job.status ?? "pending") as JobStatus;

  return (
    <Card className="group transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Building2 className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  {job.company}
                </p>
                <CardTitle className="truncate text-sm font-semibold">
                  {job.role}
                </CardTitle>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                />
              }
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem render={<Link href={`/jobs/${job.id}`} />}>
                <Eye className="size-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href={`/jobs/${job.id}#evaluate`} />}
              >
                <Sparkles className="size-4" />
                Evaluate
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href={`/jobs/${job.id}#generate-cv`} />}
              >
                <FileText className="size-4" />
                Generate CV
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
                  <ExternalLink className="size-4" />
                  View Posting
                </DropdownMenuItem>
              )}
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
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status} />
          {score !== null && <ScoreBadge score={score} size="sm" />}
          {job.detectedArchetype && (
            <Badge variant="outline" className="text-xs">
              {job.detectedArchetype}
            </Badge>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {job.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            {formatDate(job.createdAt)}
          </span>
          {job.sourceUrl && (
            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="size-3" />
              Source
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
