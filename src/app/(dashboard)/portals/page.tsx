"use client";

import { useState } from "react";
import {
  Globe,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Download,
} from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import type { AtsType, ScanMethod } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Portal {
  id: string;
  company: string;
  careersUrl: string;
  atsType: AtsType;
  scanMethod: ScanMethod;
  enabled: boolean;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const INITIAL_PORTALS: Portal[] = [
  {
    id: "p1",
    company: "Anthropic",
    careersUrl: "https://www.anthropic.com/careers",
    atsType: "greenhouse",
    scanMethod: "api",
    enabled: true,
  },
  {
    id: "p2",
    company: "OpenAI",
    careersUrl: "https://openai.com/careers",
    atsType: "greenhouse",
    scanMethod: "api",
    enabled: true,
  },
  {
    id: "p3",
    company: "Stripe",
    careersUrl: "https://stripe.com/jobs",
    atsType: "greenhouse",
    scanMethod: "api",
    enabled: true,
  },
  {
    id: "p4",
    company: "Vercel",
    careersUrl: "https://vercel.com/careers",
    atsType: "ashby",
    scanMethod: "api",
    enabled: true,
  },
  {
    id: "p5",
    company: "Notion",
    careersUrl: "https://www.notion.so/careers",
    atsType: "lever",
    scanMethod: "api",
    enabled: false,
  },
  {
    id: "p6",
    company: "Figma",
    careersUrl: "https://www.figma.com/careers",
    atsType: "greenhouse",
    scanMethod: "playwright",
    enabled: true,
  },
];

const DEFAULT_COMPANIES: Omit<Portal, "id">[] = [
  { company: "Google DeepMind", careersUrl: "https://deepmind.google/careers/", atsType: "workday", scanMethod: "playwright", enabled: true },
  { company: "Meta AI", careersUrl: "https://ai.meta.com/join-us/", atsType: "custom", scanMethod: "playwright", enabled: true },
  { company: "Apple ML", careersUrl: "https://jobs.apple.com/en-us/search?team=machine-learning-and-ai", atsType: "custom", scanMethod: "playwright", enabled: true },
  { company: "Microsoft AI", careersUrl: "https://careers.microsoft.com/", atsType: "workday", scanMethod: "playwright", enabled: true },
  { company: "Amazon AGI", careersUrl: "https://www.amazon.jobs/en/teams/artificial-general-intelligence", atsType: "custom", scanMethod: "playwright", enabled: true },
  { company: "Databricks", careersUrl: "https://www.databricks.com/company/careers", atsType: "greenhouse", scanMethod: "api", enabled: true },
  { company: "Scale AI", careersUrl: "https://scale.com/careers", atsType: "lever", scanMethod: "api", enabled: true },
  { company: "Cohere", careersUrl: "https://cohere.com/careers", atsType: "lever", scanMethod: "api", enabled: true },
  { company: "Mistral AI", careersUrl: "https://mistral.ai/careers", atsType: "ashby", scanMethod: "api", enabled: true },
  { company: "Hugging Face", careersUrl: "https://huggingface.co/jobs", atsType: "ashby", scanMethod: "api", enabled: true },
  { company: "Datadog", careersUrl: "https://careers.datadoghq.com/", atsType: "greenhouse", scanMethod: "api", enabled: true },
  { company: "Snowflake", careersUrl: "https://careers.snowflake.com/", atsType: "workday", scanMethod: "playwright", enabled: true },
  { company: "Cloudflare", careersUrl: "https://www.cloudflare.com/careers/", atsType: "greenhouse", scanMethod: "api", enabled: true },
  { company: "MongoDB", careersUrl: "https://www.mongodb.com/careers", atsType: "greenhouse", scanMethod: "api", enabled: true },
  { company: "Confluent", careersUrl: "https://www.confluent.io/careers/", atsType: "greenhouse", scanMethod: "api", enabled: true },
  { company: "Elastic", careersUrl: "https://www.elastic.co/careers/", atsType: "greenhouse", scanMethod: "api", enabled: true },
  { company: "HashiCorp", careersUrl: "https://www.hashicorp.com/careers", atsType: "greenhouse", scanMethod: "api", enabled: true },
  { company: "GitLab", careersUrl: "https://about.gitlab.com/jobs/", atsType: "greenhouse", scanMethod: "api", enabled: true },
  { company: "Sourcegraph", careersUrl: "https://about.sourcegraph.com/careers", atsType: "ashby", scanMethod: "api", enabled: true },
  { company: "Linear", careersUrl: "https://linear.app/careers", atsType: "ashby", scanMethod: "api", enabled: true },
  { company: "Retool", careersUrl: "https://retool.com/careers", atsType: "lever", scanMethod: "api", enabled: true },
  { company: "Supabase", careersUrl: "https://supabase.com/careers", atsType: "ashby", scanMethod: "api", enabled: true },
  { company: "PlanetScale", careersUrl: "https://planetscale.com/careers", atsType: "lever", scanMethod: "api", enabled: true },
  { company: "Fly.io", careersUrl: "https://fly.io/jobs/", atsType: "custom", scanMethod: "websearch", enabled: true },
  { company: "Railway", careersUrl: "https://railway.app/careers", atsType: "custom", scanMethod: "websearch", enabled: true },
  { company: "Weights & Biases", careersUrl: "https://wandb.ai/careers", atsType: "lever", scanMethod: "api", enabled: true },
  { company: "Runway ML", careersUrl: "https://runwayml.com/careers/", atsType: "lever", scanMethod: "api", enabled: true },
  { company: "Stability AI", careersUrl: "https://stability.ai/careers", atsType: "lever", scanMethod: "api", enabled: true },
  { company: "Adept AI", careersUrl: "https://www.adept.ai/careers", atsType: "lever", scanMethod: "api", enabled: true },
  { company: "Character AI", careersUrl: "https://character.ai/careers", atsType: "ashby", scanMethod: "api", enabled: true },
  { company: "Inflection AI", careersUrl: "https://inflection.ai/careers", atsType: "lever", scanMethod: "api", enabled: true },
  { company: "Perplexity AI", careersUrl: "https://www.perplexity.ai/hub/careers", atsType: "ashby", scanMethod: "api", enabled: true },
  { company: "Anyscale", careersUrl: "https://www.anyscale.com/careers", atsType: "greenhouse", scanMethod: "api", enabled: true },
  { company: "Modal", careersUrl: "https://modal.com/careers", atsType: "ashby", scanMethod: "api", enabled: true },
  { company: "Replicate", careersUrl: "https://replicate.com/jobs", atsType: "ashby", scanMethod: "api", enabled: true },
  { company: "Together AI", careersUrl: "https://www.together.ai/careers", atsType: "ashby", scanMethod: "api", enabled: true },
  { company: "Groq", careersUrl: "https://groq.com/careers/", atsType: "lever", scanMethod: "api", enabled: true },
  { company: "Cerebras", careersUrl: "https://www.cerebras.net/careers/", atsType: "greenhouse", scanMethod: "api", enabled: true },
  { company: "Neon", careersUrl: "https://neon.tech/careers", atsType: "ashby", scanMethod: "api", enabled: true },
  { company: "Clerk", careersUrl: "https://clerk.com/careers", atsType: "ashby", scanMethod: "api", enabled: true },
  { company: "Resend", careersUrl: "https://resend.com/careers", atsType: "ashby", scanMethod: "api", enabled: true },
  { company: "Liveblocks", careersUrl: "https://liveblocks.io/careers", atsType: "ashby", scanMethod: "api", enabled: true },
  { company: "Airtable", careersUrl: "https://airtable.com/careers", atsType: "greenhouse", scanMethod: "api", enabled: true },
  { company: "Rippling", careersUrl: "https://www.rippling.com/careers", atsType: "greenhouse", scanMethod: "api", enabled: true },
  { company: "Ramp", careersUrl: "https://ramp.com/careers", atsType: "ashby", scanMethod: "api", enabled: true },
];

const ATS_COLORS: Record<AtsType, string> = {
  greenhouse: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  lever: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  ashby: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  workday: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  custom: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

// ---------------------------------------------------------------------------
// Add/Edit Portal dialog
// ---------------------------------------------------------------------------

function PortalFormDialog({
  portal,
  trigger,
  onSave,
}: {
  portal?: Portal;
  trigger: React.ReactNode;
  onSave: (data: Omit<Portal, "id"> & { id?: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    company: portal?.company ?? "",
    careersUrl: portal?.careersUrl ?? "",
    atsType: portal?.atsType ?? ("greenhouse" as AtsType),
    scanMethod: portal?.scanMethod ?? ("api" as ScanMethod),
    enabled: portal?.enabled ?? true,
  });

  function handleSubmit() {
    onSave({ ...form, id: portal?.id });
    setOpen(false);
    if (!portal) {
      setForm({
        company: "",
        careersUrl: "",
        atsType: "greenhouse",
        scanMethod: "api",
        enabled: true,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement}>
        {/* trigger content rendered by caller */}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {portal ? "Edit" : "Add"} Company Portal
          </DialogTitle>
          <DialogDescription>
            {portal
              ? "Update company portal settings."
              : "Add a new company careers portal to scan."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="portal-company">Company Name</Label>
            <Input
              id="portal-company"
              placeholder="e.g. Anthropic"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="portal-url">Careers URL</Label>
            <Input
              id="portal-url"
              placeholder="https://example.com/careers"
              value={form.careersUrl}
              onChange={(e) =>
                setForm({ ...form, careersUrl: e.target.value })
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>ATS Type</Label>
            <Select
              value={form.atsType}
              onValueChange={(val) =>
                setForm({ ...form, atsType: val as AtsType })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="greenhouse">Greenhouse</SelectItem>
                <SelectItem value="lever">Lever</SelectItem>
                <SelectItem value="ashby">Ashby</SelectItem>
                <SelectItem value="workday">Workday</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Scan Method</Label>
            <Select
              value={form.scanMethod}
              onValueChange={(val) =>
                setForm({ ...form, scanMethod: val as ScanMethod })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="playwright">Playwright</SelectItem>
                <SelectItem value="websearch">Web Search</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!form.company || !form.careersUrl}
          >
            {portal ? "Update" : "Add"} Portal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PortalsPage() {
  const [portals, setPortals] = useState<Portal[]>(INITIAL_PORTALS);

  function handleSave(data: Omit<Portal, "id"> & { id?: string }) {
    if (data.id) {
      setPortals((prev) =>
        prev.map((p) =>
          p.id === data.id ? { ...p, ...data, id: data.id! } : p
        )
      );
    } else {
      const newPortal: Portal = {
        id: `p${Date.now()}`,
        ...data,
      };
      setPortals((prev) => [...prev, newPortal]);
    }
  }

  function handleDelete(id: string) {
    setPortals((prev) => prev.filter((p) => p.id !== id));
  }

  function handleToggle(id: string) {
    setPortals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  }

  function handleImportDefaults() {
    const existingSlugs = new Set(
      portals.map((p) => p.company.toLowerCase())
    );
    const toAdd = DEFAULT_COMPANIES.filter(
      (c) => !existingSlugs.has(c.company.toLowerCase())
    );
    const newPortals = toAdd.map((c, i) => ({
      ...c,
      id: `pdef${Date.now()}-${i}`,
    }));
    setPortals((prev) => [...prev, ...newPortals]);
    toast.success(`Imported ${newPortals.length} companies`, {
      description: `${toAdd.length} new portals added. ${DEFAULT_COMPANIES.length - toAdd.length} duplicates skipped.`,
    });
  }

  function handleScanNow() {
    toast.info("Scan started", {
      description:
        "Scanning all enabled portals. This may take a few minutes.",
    });
  }

  const enabledCount = portals.filter((p) => p.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portals</h1>
          <p className="text-muted-foreground">
            {enabledCount} of {portals.length} company portals enabled for
            scanning.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleScanNow}>
            <RefreshCw className="size-3.5" data-icon="inline-start" />
            Scan Now
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImportDefaults}
          >
            <Download className="size-3.5" data-icon="inline-start" />
            Import Default List
          </Button>
          <PortalFormDialog
            trigger={
              <Button size="sm">
                <Plus className="size-3.5" data-icon="inline-start" />
                Add Company
              </Button>
            }
            onSave={handleSave}
          />
        </div>
      </div>

      {/* Table */}
      {portals.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Careers URL
                  </TableHead>
                  <TableHead>ATS</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Method
                  </TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portals.map((portal) => (
                  <TableRow
                    key={portal.id}
                    className={!portal.enabled ? "opacity-60" : ""}
                  >
                    <TableCell className="font-medium">
                      {portal.company}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <a
                        href={portal.careersUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[220px] inline-block"
                      >
                        {portal.careersUrl.replace(
                          /^https?:\/\/(www\.)?/,
                          ""
                        )}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`capitalize ${ATS_COLORS[portal.atsType]}`}
                      >
                        {portal.atsType}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell capitalize text-muted-foreground">
                      {portal.scanMethod}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={portal.enabled}
                        onCheckedChange={() => handleToggle(portal.id)}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <PortalFormDialog
                          portal={portal}
                          trigger={
                            <Button variant="ghost" size="icon-xs">
                              <Pencil className="size-3" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          }
                          onSave={handleSave}
                        />
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(portal.id)}
                        >
                          <Trash2 className="size-3" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <EmptyState
              icon={Globe}
              title="No portals configured"
              description="Add company portals to start scanning for new job openings automatically."
              action={{
                label: "Import Default List",
                onClick: handleImportDefaults,
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
