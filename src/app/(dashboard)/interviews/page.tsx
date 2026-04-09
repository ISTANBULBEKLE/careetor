"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  BookOpen,
  Plus,
  ArrowRight,
  Tag,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { ScoreBadge } from "@/components/shared/score-badge";
import { EmptyState } from "@/components/shared/empty-state";
import type { StoryInput } from "@/types";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface InterviewJob {
  id: string;
  company: string;
  role: string;
  score: number;
  interviewDate?: string;
}

const MOCK_INTERVIEW_JOBS: InterviewJob[] = [
  {
    id: "3",
    company: "Vercel",
    role: "AI Forward Deployed Engineer",
    score: 4.1,
    interviewDate: "Apr 12, 2026",
  },
  {
    id: "7",
    company: "Anthropic",
    role: "AI Platform Engineer",
    score: 4.7,
    interviewDate: "Apr 15, 2026",
  },
  {
    id: "9",
    company: "Notion",
    role: "Technical AI PM",
    score: 3.9,
  },
];

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

const MOCK_STORIES: Story[] = [
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
];

// ---------------------------------------------------------------------------
// Add Story dialog
// ---------------------------------------------------------------------------

function AddStoryDialog() {
  const [open, setOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [form, setForm] = useState<Omit<StoryInput, "tags">>({
    title: "",
    situation: "",
    task: "",
    action: "",
    result: "",
    reflection: "",
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
    // TODO: call server action to save story
    setOpen(false);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-3.5" data-icon="inline-start" />
        Add Story
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add STAR+R Story</DialogTitle>
          <DialogDescription>
            Record a situation using the STAR+R framework for interview prep.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="story-title">Title</Label>
            <Input
              id="story-title"
              placeholder="Brief title for this story"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="story-situation">Situation</Label>
            <Textarea
              id="story-situation"
              placeholder="What was the context?"
              value={form.situation}
              onChange={(e) => setForm({ ...form, situation: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="story-task">Task</Label>
            <Textarea
              id="story-task"
              placeholder="What was your responsibility?"
              value={form.task}
              onChange={(e) => setForm({ ...form, task: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="story-action">Action</Label>
            <Textarea
              id="story-action"
              placeholder="What did you do?"
              value={form.action}
              onChange={(e) => setForm({ ...form, action: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="story-result">Result</Label>
            <Textarea
              id="story-result"
              placeholder="What was the outcome? Use metrics."
              value={form.result}
              onChange={(e) => setForm({ ...form, result: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="story-reflection">Reflection</Label>
            <Textarea
              id="story-reflection"
              placeholder="What did you learn?"
              value={form.reflection}
              onChange={(e) =>
                setForm({ ...form, reflection: e.target.value })
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="story-tags">Tags</Label>
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
              id="story-tags"
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
            disabled={!form.title || !form.situation || !form.action || !form.result}
          >
            Save Story
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function InterviewsPage() {
  const hasInterviews = MOCK_INTERVIEW_JOBS.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interview Prep</h1>
          <p className="text-muted-foreground">
            Prepare for upcoming interviews and manage your story bank.
          </p>
        </div>
        <AddStoryDialog />
      </div>

      {/* Active interviews */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="size-4 text-amber-500" />
          Active Interviews
        </h2>

        {hasInterviews ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_INTERVIEW_JOBS.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{job.role}</CardTitle>
                      <CardDescription>{job.company}</CardDescription>
                    </div>
                    <ScoreBadge score={job.score} size="sm" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {job.interviewDate && (
                    <p className="text-xs text-muted-foreground">
                      Scheduled: {job.interviewDate}
                    </p>
                  )}
                  <Link
                    href={`/jobs/${job.id}`}
                    className={buttonVariants({ variant: "outline", size: "sm", className: "w-full" })}
                  >
                    <BookOpen className="size-3.5" />
                    Prepare
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent>
              <EmptyState
                icon={MessageSquare}
                title="No active interviews yet"
                description="When a job moves to interview status, it will appear here with preparation tools."
              />
            </CardContent>
          </Card>
        )}
      </section>

      <Separator />

      {/* STAR+R Story Bank */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="size-4 text-indigo-500" />
            STAR+R Story Bank
          </h2>
          <Link
            href="/interviews/stories"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Manage all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {MOCK_STORIES.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {MOCK_STORIES.map((story) => (
              <Card key={story.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm">{story.title}</CardTitle>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      Used {story.usedCount}x
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {story.situation}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {story.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Tag className="size-2.5 mr-0.5" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
      </section>
    </div>
  );
}
