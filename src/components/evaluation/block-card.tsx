import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import type { EvaluationBlock } from "@/types";

interface BlockCardProps {
  block: EvaluationBlock;
  title: string;
  content: string;
  className?: string;
}

const BLOCK_COLORS: Record<string, string> = {
  A: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  B: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  C: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  D: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  E: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  F: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  G: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export function BlockCard({ block, title, content, className }: BlockCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className={`border-transparent text-sm font-bold ${BLOCK_COLORS[block] ?? BLOCK_COLORS.G}`}
          >
            {block}
          </Badge>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <MarkdownRenderer content={content} />
      </CardContent>
    </Card>
  );
}
