"use client";

import { useState } from "react";
import {
  BookOpen,
  Plus,
  Tag,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EmptyState } from "@/components/shared/empty-state";
import type { StoryInput } from "@/types";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface Story {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  reflection: string;
  tags: string[];
  usedCount: number;
}

const INITIAL_STORIES: Story[] = [
  {
    id: "s1",
    title: "Led AI platform migration at scale",
    situation:
      "Legacy ML pipeline was causing 40% of production incidents and costing $50k/mo in compute waste.",
    task: "Redesign and migrate the entire ML serving infrastructure to a modern LLMOps platform.",
    action:
      "Built a phased migration plan, introduced feature flags for gradual rollout, and set up parallel inference pipelines for A/B testing.",
    result:
      "Reduced incidents by 85%, cut compute costs by 60%, and improved model deployment time from 2 days to 30 minutes.",
    reflection:
      "Learned that early stakeholder buy-in is critical for infrastructure migrations -- started with a small win to build credibility.",
    tags: ["leadership", "infrastructure", "AI/ML"],
    usedCount: 3,
  },
  {
    id: "s2",
    title: "Shipped autonomous agent in 6 weeks",
    situation:
      "Sales team was spending 4+ hours daily on manual data entry from customer emails.",
    task: "Build an agentic system to parse emails, extract structured data, and update CRM automatically.",
    action:
      "Designed a multi-agent architecture using Claude with tool use, implemented human-in-the-loop for edge cases, and deployed with monitoring dashboards.",
    result:
      "Automated 90% of data entry tasks, saving the team 20+ hours/week and reducing error rate from 12% to 0.5%.",
    reflection:
      "Realized the importance of defining clear agent guardrails upfront instead of retrofitting them.",
    tags: ["agentic", "automation", "shipping"],
    usedCount: 2,
  },
  {
    id: "s3",
    title: "Resolved critical outage under pressure",
    situation:
      "Production recommendation engine went down during Black Friday, affecting 2M+ users.",
    task: "Diagnose root cause, restore service, and prevent recurrence within the 1-hour SLA.",
    action:
      "Led a war room of 5 engineers, identified a cascading failure in the vector DB layer, implemented a circuit breaker pattern, and rolled back to a cached fallback model.",
    result:
      "Service restored in 38 minutes. Post-incident review led to new chaos engineering practices that prevented 3 similar incidents.",
    reflection:
      "Calm communication during incidents is as important as technical skill. Started running regular incident simulations afterward.",
    tags: ["incident-response", "leadership", "reliability"],
    usedCount: 1,
  },
  {
    id: "s4",
    title: "Championed developer experience improvement",
    situation:
      "CI/CD pipeline took 45 minutes per run, causing developers to batch changes and increase merge conflict risk.",
    task: "Reduce pipeline time to under 10 minutes while maintaining test coverage.",
    action:
      "Profiled the pipeline, parallelized test suites, introduced incremental builds with Turborepo, and implemented test impact analysis.",
    result:
      "Pipeline time dropped to 7 minutes. Developer satisfaction scores rose from 3.2 to 4.6/5. PRs per developer increased by 40%.",
    reflection:
      "DX improvements have a compounding effect on team velocity that is often underestimated in planning.",
    tags: ["DX", "CI/CD", "tooling"],
    usedCount: 0,
  },
];

// ---------------------------------------------------------------------------
// Add/Edit Story dialog
// ---------------------------------------------------------------------------

function StoryFormDialog({
  story,
  trigger,
  onSave,
}: {
  story?: Story;
  trigger: React.ReactNode;
  onSave: (data: StoryInput & { id?: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(story?.tags ?? []);
  const [form, setForm] = useState<Omit<StoryInput, "tags">>({
    title: story?.title ?? "",
    situation: story?.situation ?? "",
    task: story?.task ?? "",
    action: story?.action ?? "",
    result: story?.result ?? "",
    reflection: story?.reflection ?? "",
  });

  function handleAddTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,$/, "");
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
      }
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleSubmit() {
    onSave({ ...form, tags, id: story?.id });
    setOpen(false);
    if (!story) {
      setForm({
        title: "",
        situation: "",
        task: "",
        action: "",
        result: "",
        reflection: "",
      });
      setTags([]);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement}>
        {/* trigger content rendered by caller */}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{story ? "Edit" : "Add"} STAR+R Story</DialogTitle>
          <DialogDescription>
            {story
              ? "Update your story details."
              : "Record a new situation using the STAR+R framework."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sf-title">Title</Label>
            <Input
              id="sf-title"
              placeholder="Brief title for this story"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sf-situation">Situation</Label>
            <Textarea
              id="sf-situation"
              placeholder="What was the context?"
              value={form.situation}
              onChange={(e) => setForm({ ...form, situation: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sf-task">Task</Label>
            <Textarea
              id="sf-task"
              placeholder="What was your responsibility?"
              value={form.task}
              onChange={(e) => setForm({ ...form, task: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sf-action">Action</Label>
            <Textarea
              id="sf-action"
              placeholder="What did you do?"
              value={form.action}
              onChange={(e) => setForm({ ...form, action: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sf-result">Result</Label>
            <Textarea
              id="sf-result"
              placeholder="What was the outcome? Use metrics."
              value={form.result}
              onChange={(e) => setForm({ ...form, result: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sf-reflection">Reflection</Label>
            <Textarea
              id="sf-reflection"
              placeholder="What did you learn?"
              value={form.reflection}
              onChange={(e) =>
                setForm({ ...form, reflection: e.target.value })
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sf-tags">Tags</Label>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeTag(tag)}
                >
                  {tag} &times;
                </Badge>
              ))}
            </div>
            <Input
              id="sf-tags"
              placeholder="Type a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={
              !form.title || !form.situation || !form.action || !form.result
            }
          >
            {story ? "Update" : "Save"} Story
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Story card with expand
// ---------------------------------------------------------------------------

function StoryCard({
  story,
  onEdit,
  onDelete,
}: {
  story: Story;
  onEdit: (data: StoryInput & { id?: string }) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm leading-snug">{story.title}</CardTitle>
          <div className="flex items-center gap-1 shrink-0">
            <Badge variant="outline" className="text-xs">
              Used {story.usedCount}x
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {story.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Tag className="size-2.5 mr-0.5" />
              {tag}
            </Badge>
          ))}
        </div>

        {/* Situation preview */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {story.situation}
        </p>

        {/* Expandable full STAR+R */}
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger
            render={
              <Button variant="ghost" size="sm" className="w-full" />
            }
          >
            {expanded ? (
              <>
                <ChevronUp className="size-3.5" data-icon="inline-start" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="size-3.5" data-icon="inline-start" />
                View full story
              </>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-3 space-y-3 rounded-lg bg-muted/50 p-3 text-sm">
              <div>
                <p className="font-medium text-foreground">Situation</p>
                <p className="text-muted-foreground">{story.situation}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Task</p>
                <p className="text-muted-foreground">{story.task}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Action</p>
                <p className="text-muted-foreground">{story.action}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Result</p>
                <p className="text-muted-foreground">{story.result}</p>
              </div>
              {story.reflection && (
                <div>
                  <p className="font-medium text-foreground">Reflection</p>
                  <p className="text-muted-foreground">{story.reflection}</p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <StoryFormDialog
            story={story}
            trigger={
              <Button variant="outline" size="sm" className="flex-1">
                <Pencil className="size-3" data-icon="inline-start" />
                Edit
              </Button>
            }
            onSave={onEdit}
          />
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-destructive hover:text-destructive"
            onClick={() => onDelete(story.id)}
          >
            <Trash2 className="size-3" data-icon="inline-start" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);

  function handleSave(data: StoryInput & { id?: string }) {
    if (data.id) {
      setStories((prev) =>
        prev.map((s) =>
          s.id === data.id
            ? { ...s, ...data, tags: data.tags ?? [], id: data.id! }
            : s
        )
      );
    } else {
      const newStory: Story = {
        id: `s${Date.now()}`,
        title: data.title,
        situation: data.situation,
        task: data.task,
        action: data.action,
        result: data.result,
        reflection: data.reflection ?? "",
        tags: data.tags ?? [],
        usedCount: 0,
      };
      setStories((prev) => [newStory, ...prev]);
    }
  }

  function handleDelete(id: string) {
    setStories((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Story Bank</h1>
          <p className="text-muted-foreground">
            Manage your STAR+R stories for interview preparation.
          </p>
        </div>
        <StoryFormDialog
          trigger={
            <Button>
              <Plus className="size-3.5" data-icon="inline-start" />
              Add Story
            </Button>
          }
          onSave={handleSave}
        />
      </div>

      {/* Stories grid */}
      {stories.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onEdit={handleSave}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent>
            <EmptyState
              icon={BookOpen}
              title="No stories yet"
              description="Add your first STAR+R story to build your interview preparation bank."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
