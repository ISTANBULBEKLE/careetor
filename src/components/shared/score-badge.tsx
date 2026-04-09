import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  getScoreColor,
  getScoreBgColor,
  getScoreLabel,
} from "@/types";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "text-xs px-1.5 py-0 h-5",
  md: "text-sm px-2 py-0.5 h-6",
  lg: "text-base px-3 py-1 h-8 font-semibold",
} as const;

export function ScoreBadge({
  score,
  size = "md",
  className,
}: ScoreBadgeProps) {
  const label = getScoreLabel(score);
  const colorClass = getScoreColor(score);
  const bgClass = getScoreBgColor(score);

  return (
    <Badge
      variant="secondary"
      className={cn(
        "inline-flex items-center gap-1 border-transparent font-medium",
        bgClass,
        colorClass,
        sizeStyles[size],
        className
      )}
    >
      <span className="font-semibold">{score.toFixed(1)}</span>
      {size !== "sm" && (
        <span className="opacity-80">{label}</span>
      )}
    </Badge>
  );
}
