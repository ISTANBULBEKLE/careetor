"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateCVSection } from "@/actions/cv.actions";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { CVSectionType } from "@/types";

interface CVSection {
  id: string;
  cvId: string;
  type: string;
  title: string | null;
  content: string | null;
  orderIndex: number | null;
  metadata: unknown;
  createdAt: Date;
}

interface CVEditorProps {
  sections: CVSection[];
}

const sectionTypeLabels: Record<CVSectionType, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  other: "Other",
};

const sectionTypeColors: Record<CVSectionType, string> = {
  summary: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  experience:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  education:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  skills:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  projects: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  certifications:
    "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  other:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
};

function SectionEditor({ section }: { section: CVSection }) {
  const [content, setContent] = useState(section.content ?? "");
  const [isOpen, setIsOpen] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isDirty, setIsDirty] = useState(false);

  const sectionType = section.type as CVSectionType;

  function handleContentChange(value: string) {
    setContent(value);
    setIsDirty(value !== (section.content ?? ""));
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await updateCVSection(section.id, content);
        setIsDirty(false);
        toast.success(
          `${section.title || sectionTypeLabels[sectionType]} saved`
        );
      } catch {
        toast.error("Failed to save section");
      }
    });
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CollapsibleTrigger className="flex flex-1 items-center gap-3 text-left">
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform",
                  !isOpen && "-rotate-90"
                )}
              />
              <CardTitle className="text-sm font-medium">
                {section.title || sectionTypeLabels[sectionType]}
              </CardTitle>
              <Badge
                variant="secondary"
                className={cn(
                  "border-transparent text-xs",
                  sectionTypeColors[sectionType]
                )}
              >
                {sectionTypeLabels[sectionType]}
              </Badge>
            </CollapsibleTrigger>
            {isDirty && (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Save className="size-3" data-icon="inline-start" />
                )}
                Save
              </Button>
            )}
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <Textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Section content..."
              className="min-h-40 resize-y font-mono text-sm"
            />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function CVEditor({ sections }: CVEditorProps) {
  if (sections.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No sections found. This CV may not have been parsed yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <SectionEditor key={section.id} section={section} />
      ))}
    </div>
  );
}
