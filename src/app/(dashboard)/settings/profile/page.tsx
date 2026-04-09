"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4";
import {
  User,
  Briefcase,
  DollarSign,
  Link2,
  Plus,
  X,
  Target,
  Save,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ARCHETYPES } from "@/types";

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Valid email required"),
  location: z.string().optional(),
  timezone: z.string().optional(),
  headline: z.string().optional(),
  targetRoles: z.array(z.string()),
  superpowers: z.array(z.string()),
  exitStory: z.string().optional(),
  archetypes: z.array(
    z.object({
      name: z.string(),
      level: z.string(),
      fit: z.enum(["primary", "secondary", "adjacent"]),
    })
  ),
  salaryTarget: z.coerce.number().optional(),
  salaryMin: z.coerce.number().optional(),
  currency: z.string().default("USD"),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
});

type ProfileValues = z.infer<typeof profileSchema>;

// ---------------------------------------------------------------------------
// Multi-input with tags
// ---------------------------------------------------------------------------

function MultiInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = input.trim().replace(/,$/, "");
      if (val && !values.includes(val)) {
        onChange([...values, val]);
      }
      setInput("");
    }
    if (e.key === "Backspace" && !input && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {values.map((val) => (
          <Badge
            key={val}
            variant="secondary"
            className="gap-1 cursor-pointer"
            onClick={() => onChange(values.filter((v) => v !== val))}
          >
            {val}
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
// Archetype entry
// ---------------------------------------------------------------------------

interface ArchetypeEntry {
  name: string;
  level: string;
  fit: "primary" | "secondary" | "adjacent";
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  // --- Personal ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [timezone, setTimezone] = useState("");

  // --- Career ---
  const [headline, setHeadline] = useState("");
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [superpowers, setSuperpowers] = useState<string[]>([]);
  const [exitStory, setExitStory] = useState("");

  // --- Archetypes ---
  const [archetypes, setArchetypes] = useState<ArchetypeEntry[]>([]);

  // --- Compensation ---
  const [salaryTarget, setSalaryTarget] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [currency, setCurrency] = useState("USD");

  // --- Links ---
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  // --- Archetype helpers ---
  function addArchetype() {
    setArchetypes([
      ...archetypes,
      { name: ARCHETYPES[0], level: "Senior", fit: "primary" },
    ]);
  }

  function removeArchetype(index: number) {
    setArchetypes(archetypes.filter((_, i) => i !== index));
  }

  function updateArchetype(
    index: number,
    field: keyof ArchetypeEntry,
    value: string
  ) {
    setArchetypes(
      archetypes.map((a, i) =>
        i === index ? { ...a, [field]: value } : a
      )
    );
  }

  // --- Submit ---
  function handleSave() {
    const data = {
      name,
      email,
      location,
      timezone,
      headline,
      targetRoles,
      superpowers,
      exitStory,
      archetypes,
      salaryTarget: salaryTarget ? Number(salaryTarget) : undefined,
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      currency,
      linkedinUrl,
      portfolioUrl,
      githubUrl,
    };

    const result = profileSchema.safeParse(data);
    if (!result.success) {
      const firstError = result.error.issues[0];
      toast.error(`Validation error: ${firstError.message}`);
      return;
    }

    // TODO: call upsertProfile server action
    toast.success("Profile saved successfully");
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Career Profile</h1>
        <p className="text-muted-foreground">
          Your profile powers CV tailoring, job scoring, and application
          drafting.
        </p>
      </div>

      {/* Personal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-4" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Full Name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-location">Location</Label>
            <Input
              id="profile-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-tz">Timezone</Label>
            <Input
              id="profile-tz"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="e.g., Europe/Berlin"
            />
          </div>
        </CardContent>
      </Card>

      {/* Career */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="size-4" />
            Career Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="profile-headline">Headline</Label>
            <Input
              id="profile-headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g., Senior AI Engineer specializing in LLM evaluation systems"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Target Roles</Label>
            <MultiInput
              values={targetRoles}
              onChange={setTargetRoles}
              placeholder="Type a role and press Enter..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Superpowers</Label>
            <MultiInput
              values={superpowers}
              onChange={setSuperpowers}
              placeholder="Type a superpower and press Enter..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-exit">Exit Story / Unique Narrative</Label>
            <Textarea
              id="profile-exit"
              value={exitStory}
              onChange={(e) => setExitStory(e.target.value)}
              placeholder="What makes you unique? What is your career narrative?"
            />
          </div>
        </CardContent>
      </Card>

      {/* Archetypes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="size-4" />
            Career Archetypes
          </CardTitle>
          <CardDescription>
            Map your background to career archetypes. This drives how
            evaluations frame your fit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {archetypes.map((arch, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-border p-3"
            >
              <Select
                value={arch.name}
                onValueChange={(v) => v && updateArchetype(i, "name", v)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ARCHETYPES.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={arch.level}
                onValueChange={(v) => v && updateArchetype(i, "level", v)}
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Junior">Junior</SelectItem>
                  <SelectItem value="Mid">Mid</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Principal">Principal</SelectItem>
                  <SelectItem value="Lead">Lead</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={arch.fit}
                onValueChange={(v) => v && updateArchetype(i, "fit", v)}
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="adjacent">Adjacent</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeArchetype(i)}
              >
                <X className="size-3.5" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={addArchetype}>
            <Plus className="size-3.5" data-icon="inline-start" />
            Add Archetype
          </Button>
        </CardContent>
      </Card>

      {/* Compensation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="size-4" />
            Compensation
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="profile-salary-target">Target Salary</Label>
            <Input
              id="profile-salary-target"
              type="number"
              value={salaryTarget}
              onChange={(e) => setSalaryTarget(e.target.value)}
              placeholder="150000"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-salary-min">Minimum</Label>
            <Input
              id="profile-salary-min"
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              placeholder="120000"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v ?? "USD")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="CHF">CHF</SelectItem>
                <SelectItem value="ILS">ILS</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
                <SelectItem value="AUD">AUD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="size-4" />
            Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="profile-linkedin">LinkedIn</Label>
            <Input
              id="profile-linkedin"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-portfolio">Portfolio</Label>
            <Input
              id="profile-portfolio"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://your-portfolio.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-github">GitHub</Label>
            <Input
              id="profile-github"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end pb-8">
        <Button size="lg" onClick={handleSave}>
          <Save className="size-4" data-icon="inline-start" />
          Save Profile
        </Button>
      </div>
    </div>
  );
}
