import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FileText, Plus, Crown, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { getUserCVs } from "@/actions/cv.actions";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CVDeleteButton } from "@/components/cv/cv-delete-button";

function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default async function CVPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const cvs = await getUserCVs(session.user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My CVs</h1>
          <p className="text-sm text-muted-foreground">
            Manage your CVs and keep them ready for applications.
          </p>
        </div>
        <Link href="/cv/upload" className={buttonVariants()}>
          <Plus className="size-4" />
          Upload CV
        </Link>
      </div>

      <Separator />

      {/* CV List or Empty State */}
      {cvs.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <FileText className="size-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">
            No CVs yet
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Upload your first CV to get started. We will parse it into
            structured sections you can edit and tailor for each application.
          </p>
          <Link href="/cv/upload" className={cn(buttonVariants(), "mt-6")}>
            Upload your first CV
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cvs.map((cv) => (
            <Card key={cv.id} className="group relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate text-sm font-medium">
                        {cv.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {formatDate(cv.createdAt)}
                      </CardDescription>
                    </div>
                  </div>
                  {cv.isMaster && (
                    <Badge
                      variant="secondary"
                      className="shrink-0 gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    >
                      <Crown className="size-3" />
                      Master
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  <p className="flex-1 truncate text-xs text-muted-foreground">
                    {cv.parsedJson
                      ? "Parsed and ready"
                      : "Not yet parsed"}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href={`/cv/${cv.id}`}
                    className={buttonVariants({ variant: "outline", size: "sm", className: "flex-1" })}
                  >
                    <Pencil className="size-3" />
                    Edit
                  </Link>
                  <CVDeleteButton cvId={cv.id} userId={session.user.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
