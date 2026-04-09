import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { type JobStatus, getStatusColor } from "@/types";

interface StatusBadgeProps {
  status: JobStatus;
  className?: string;
}

const statusLabels: Record<JobStatus, string> = {
  pending: "Pending",
  evaluated: "Evaluated",
  applied: "Applied",
  responded: "Responded",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  discarded: "Discarded",
  skip: "Skip",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "border-transparent font-medium capitalize",
        getStatusColor(status),
        className
      )}
    >
      {statusLabels[status]}
    </Badge>
  );
}
