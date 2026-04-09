"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Settings,
  User,
  Filter,
  Clock,
  Shield,
  Sun,
  Moon,
  Monitor,
  X,
  Save,
} from "lucide-react";
import { z } from "zod/v4";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const generalSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  language: z.string().min(2),
  emailNotifications: z.boolean(),
});

const filtersSchema = z.object({
  positiveKeywords: z.array(z.string()),
  negativeKeywords: z.array(z.string()),
  seniorityBoost: z.array(z.string()),
});

const scanSchema = z.object({
  scanFrequency: z.enum(["daily", "every_3_days", "weekly", "manual"]),
});

type GeneralValues = z.infer<typeof generalSchema>;
type FiltersValues = z.infer<typeof filtersSchema>;
type ScanValues = z.infer<typeof scanSchema>;

// ---------------------------------------------------------------------------
// Tag Input helper
// ---------------------------------------------------------------------------

function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = input.trim().replace(/,$/, "");
      if (tag && !tags.includes(tag)) {
        onChange([...tags, tag]);
      }
      setInput("");
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="gap-1 cursor-pointer"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
          >
            {tag}
            <X className="size-2.5" />
          </Badge>
        ))}
      </div>
      <Input
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  // General section
  const [theme, setTheme] = useState<GeneralValues["theme"]>("system");
  const [language, setLanguage] = useState("en");
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Filters section
  const [positiveKeywords, setPositiveKeywords] = useState([
    "AI",
    "ML",
    "LLM",
    "Agent",
    "GenAI",
    "NLP",
    "MLOps",
  ]);
  const [negativeKeywords, setNegativeKeywords] = useState([
    "Junior",
    "Intern",
    "Java",
    ".NET",
    "Blockchain",
  ]);
  const [seniorityBoost, setSeniorityBoost] = useState([
    "Senior",
    "Staff",
    "Principal",
    "Lead",
    "Head",
  ]);

  // Scan section
  const [scanFrequency, setScanFrequency] =
    useState<ScanValues["scanFrequency"]>("weekly");

  // Delete account confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  function handleSaveGeneral() {
    const result = generalSchema.safeParse({
      theme,
      language,
      emailNotifications,
    });
    if (!result.success) {
      toast.error("Invalid settings");
      return;
    }
    // TODO: call upsertSettings server action
    toast.success("General settings saved");
  }

  function handleSaveFilters() {
    const result = filtersSchema.safeParse({
      positiveKeywords,
      negativeKeywords,
      seniorityBoost,
    });
    if (!result.success) {
      toast.error("Invalid filter settings");
      return;
    }
    // TODO: call upsertSettings server action
    toast.success("Filter settings saved");
  }

  function handleSaveScan() {
    const result = scanSchema.safeParse({ scanFrequency });
    if (!result.success) {
      toast.error("Invalid scan settings");
      return;
    }
    // TODO: call upsertSettings server action
    toast.success("Scan settings saved");
  }

  function handleDeleteAccount() {
    if (deleteConfirmText !== "DELETE") return;
    // TODO: call delete account action
    toast.success("Account deleted");
    setDeleteConfirmOpen(false);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your Careetor experience.
        </p>
      </div>

      {/* Profile link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-4" />
            Career Profile
          </CardTitle>
          <CardDescription>
            Your target roles, archetypes, salary, and career narrative.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/settings/profile"
            className={buttonVariants({ variant: "outline" })}
          >
            Edit Career Profile
          </Link>
        </CardContent>
      </Card>

      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="size-4" />
            General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Theme</Label>
              <p className="text-xs text-muted-foreground">
                Choose your preferred appearance.
              </p>
            </div>
            <Select
              value={theme}
              onValueChange={(val) =>
                setTheme(val as GeneralValues["theme"])
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <span className="flex items-center gap-2">
                    <Sun className="size-3" /> Light
                  </span>
                </SelectItem>
                <SelectItem value="dark">
                  <span className="flex items-center gap-2">
                    <Moon className="size-3" /> Dark
                  </span>
                </SelectItem>
                <SelectItem value="system">
                  <span className="flex items-center gap-2">
                    <Monitor className="size-3" /> System
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Language</Label>
              <p className="text-xs text-muted-foreground">
                Language for evaluations and CV generation.
              </p>
            </div>
            <Select value={language} onValueChange={(v) => setLanguage(v ?? "en")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="de">German (DACH)</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive emails for new scan results.
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex justify-end">
            <Button size="sm" onClick={handleSaveGeneral}>
              <Save className="size-3.5" data-icon="inline-start" />
              Save General
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="size-4" />
            Job Filters
          </CardTitle>
          <CardDescription>
            Keywords for filtering scanned job titles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label>Positive Keywords (must match)</Label>
            <TagInput
              tags={positiveKeywords}
              onChange={setPositiveKeywords}
              placeholder="Type a keyword and press Enter..."
            />
            <p className="text-xs text-muted-foreground">
              Job titles must contain at least one of these.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Negative Keywords (exclude)</Label>
            <TagInput
              tags={negativeKeywords}
              onChange={setNegativeKeywords}
              placeholder="Type a keyword and press Enter..."
            />
            <p className="text-xs text-muted-foreground">
              Job titles containing these are excluded.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Seniority Boost</Label>
            <TagInput
              tags={seniorityBoost}
              onChange={setSeniorityBoost}
              placeholder="Type a keyword and press Enter..."
            />
            <p className="text-xs text-muted-foreground">
              These titles are prioritized but not required.
            </p>
          </div>

          <div className="flex justify-end">
            <Button size="sm" onClick={handleSaveFilters}>
              <Save className="size-3.5" data-icon="inline-start" />
              Save Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scan Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="size-4" />
            Scan Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Scan Frequency</Label>
              <p className="text-xs text-muted-foreground">
                How often to check for new jobs.
              </p>
            </div>
            <Select
              value={scanFrequency}
              onValueChange={(val) =>
                setScanFrequency(val as ScanValues["scanFrequency"])
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="every_3_days">Every 3 Days</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="manual">Manual Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button size="sm" onClick={handleSaveScan}>
              <Save className="size-3.5" data-icon="inline-start" />
              Save Scan Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="size-4" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline">Change Password</Button>

          <Separator />

          <Dialog
            open={deleteConfirmOpen}
            onOpenChange={setDeleteConfirmOpen}
          >
            <DialogTrigger
              render={<Button variant="destructive" />}
            >
              Delete Account
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription>
                  This will permanently delete your account and all data. This
                  action cannot be undone. Type DELETE to confirm.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder='Type "DELETE" to confirm'
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleteConfirmText !== "DELETE"}
                  onClick={handleDeleteAccount}
                >
                  Confirm Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
