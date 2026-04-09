"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  FileText,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { useSession } from "@/lib/auth-client";
import { createJob } from "@/actions/job.actions";
import { fetchAndParseJobUrl } from "@/actions/fetch-url.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NewJobPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();

  // URL mode
  const [url, setUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  // Text mode
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jdText, setJdText] = useState("");
  const [location, setLocation] = useState("");
  const [remotePolicy, setRemotePolicy] = useState("");
  const [salary, setSalary] = useState("");

  // Post-creation
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);

  const userId = session?.user?.id;

  async function handleUrlSubmit() {
    if (!url.trim()) {
      toast.error("Please enter a job URL");
      return;
    }
    setIsFetching(true);
    try {
      const parsed = await fetchAndParseJobUrl(url.trim());
      // Populate the text form fields with parsed data
      setCompany(parsed.company);
      setRole(parsed.role);
      setJdText(parsed.jdText);
      setLocation(parsed.location || "");
      setRemotePolicy(parsed.remotePolicy || "");
      setSalary(parsed.salaryRange || "");
      toast.success(`Parsed: ${parsed.company} — ${parsed.role}. Review the details in the Text tab and submit.`);
      // Switch to text tab by clicking it programmatically
      const textTab = document.querySelector('[data-value="text"]') as HTMLElement;
      textTab?.click();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch and parse the URL"
      );
    } finally {
      setIsFetching(false);
    }
  }

  function handleTextSubmit() {
    if (!userId) {
      toast.error("Please sign in to add a job");
      return;
    }
    if (!company.trim()) {
      toast.error("Please enter the company name");
      return;
    }
    if (!role.trim()) {
      toast.error("Please enter the role title");
      return;
    }
    if (!jdText.trim()) {
      toast.error("Please enter the job description");
      return;
    }

    startTransition(async () => {
      try {
        const job = await createJob(userId, {
          company: company.trim(),
          role: role.trim(),
          jdText: jdText.trim(),
          location: location.trim() || undefined,
          remotePolicy: remotePolicy.trim() || undefined,
          salaryRange: salary.trim() || undefined,
          source: "manual",
        });

        toast.success("Job added successfully!");
        setCreatedJobId(job.id);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to add job"
        );
      }
    });
  }

  const isTextValid =
    company.trim().length > 0 &&
    role.trim().length > 0 &&
    jdText.trim().length > 0;

  // Post-creation view
  if (createdJobId) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Job Added</h1>
          <p className="text-sm text-muted-foreground">
            {company} &mdash; {role}
          </p>
        </div>

        <Separator />

        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="size-7 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold">Ready to evaluate?</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Let AI score this opportunity against your CV, identify gaps,
                and prepare a personalization plan.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => router.push("/jobs")}>
                Back to Jobs
              </Button>
              <Button onClick={() => router.push(`/jobs/${createdJobId}`)}>
                <Sparkles className="size-4" data-icon="inline-start" />
                Evaluate Now
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Job</h1>
        <p className="text-sm text-muted-foreground">
          Add a new job opportunity to evaluate and track.
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="text">
        <TabsList>
          <TabsTrigger value="url">
            <Globe className="size-3.5" />
            From URL
          </TabsTrigger>
          <TabsTrigger value="text">
            <FileText className="size-3.5" />
            Paste Text
          </TabsTrigger>
        </TabsList>

        {/* URL Mode */}
        <TabsContent value="url">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Job URL</CardTitle>
              <CardDescription>
                Paste a link to the job posting and we will fetch the details
                automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-url">URL</Label>
                <Input
                  id="job-url"
                  type="url"
                  placeholder="https://jobs.lever.co/company/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleUrlSubmit} disabled={isFetching || !url.trim()}>
                  {isFetching ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Fetching & Parsing...
                    </>
                  ) : (
                    <>
                      <Globe className="size-4" />
                      Fetch & Parse
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Text Mode */}
        <TabsContent value="text">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Job Details</CardTitle>
              <CardDescription>
                Enter the company, role, and paste the full job description.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Required fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company">
                    Company <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="company"
                    placeholder="e.g. Anthropic"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Role <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="role"
                    placeholder="e.g. Senior AI Engineer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jd-text">
                  Job Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="jd-text"
                  placeholder="Paste the full job description here..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  disabled={isPending}
                  className="min-h-48 resize-y text-sm"
                />
                {jdText.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {jdText.length.toLocaleString()} characters
                  </p>
                )}
              </div>

              {/* Optional fields */}
              <Separator />
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Optional
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g. San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remote-policy">Remote Policy</Label>
                  <Input
                    id="remote-policy"
                    placeholder="e.g. Hybrid, Remote"
                    value={remotePolicy}
                    onChange={(e) => setRemotePolicy(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary Range</Label>
                  <Input
                    id="salary"
                    placeholder="e.g. $180k-$250k"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/jobs")}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTextSubmit}
                  disabled={!isTextValid || isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Job"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
