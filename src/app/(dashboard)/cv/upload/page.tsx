"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { useSession } from "@/lib/auth-client";
import { createCV, parseCV } from "@/actions/cv.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

type UploadStep = "input" | "parsing" | "done";

export default function CVUploadPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [cvText, setCvText] = useState("");
  const [step, setStep] = useState<UploadStep>("input");
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const userId = session?.user?.id;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files?.[0]) {
      handleFile(files[0]);
    }
  }, []);

  function handleFile(file: File) {
    const validTypes = [
      "text/plain",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith(".txt")) {
      toast.error("Please upload a .pdf, .docx, or .txt file");
      return;
    }

    // For .txt files, read content directly
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCvText(text);
        if (!name) setName(file.name.replace(/\.[^/.]+$/, ""));
      };
      reader.readAsText(file);
    } else {
      // For PDF/DOCX, set the name and prompt user to paste text
      if (!name) setName(file.name.replace(/\.[^/.]+$/, ""));
      toast.info(
        "PDF/DOCX parsing coming soon. Please paste the CV text below for now."
      );
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleSubmit() {
    if (!userId) {
      toast.error("Please sign in to upload a CV");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter a name for your CV");
      return;
    }
    if (!cvText.trim()) {
      toast.error("Please enter or paste your CV text");
      return;
    }

    startTransition(async () => {
      try {
        setStep("parsing");
        setProgress(20);

        const cv = await createCV(userId, name.trim(), cvText.trim());
        setProgress(40);

        await parseCV(cv.id, userId);
        setProgress(100);

        setStep("done");
        toast.success("CV uploaded and parsed successfully!");

        // Redirect after a brief moment
        setTimeout(() => router.push("/cv"), 1500);
      } catch (error) {
        setStep("input");
        setProgress(0);
        toast.error(
          error instanceof Error ? error.message : "Failed to upload CV"
        );
      }
    });
  }

  const isValid = name.trim().length > 0 && cvText.trim().length > 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Upload CV</h1>
        <p className="text-sm text-muted-foreground">
          Add your CV text and we will parse it into structured sections for
          easy editing and tailoring.
        </p>
      </div>

      <Separator />

      {step === "done" ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">CV Parsed Successfully</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your CV has been uploaded and parsed into sections. Redirecting...
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="cv-name">CV Name</Label>
            <Input
              id="cv-name"
              placeholder='e.g. "Master CV", "AI Engineer Resume"'
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={step === "parsing"}
            />
          </div>

          {/* Drag & drop zone */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">CV Content</CardTitle>
              <CardDescription>
                Drag and drop a file, upload one, or paste your CV text directly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drop zone */}
              <div
                className={`relative flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                } ${step === "parsing" ? "pointer-events-none opacity-50" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() =>
                  document.getElementById("file-upload")?.click()
                }
              >
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileInput}
                  disabled={step === "parsing"}
                />
                <Upload className="size-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">
                  Drop a file here or click to upload
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Supports .pdf, .docx, .txt
                </p>
              </div>

              <div className="relative flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs uppercase text-muted-foreground">
                  or paste text
                </span>
                <Separator className="flex-1" />
              </div>

              {/* Text input */}
              <Textarea
                placeholder="Paste your full CV text here..."
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                disabled={step === "parsing"}
                className="min-h-64 resize-y font-mono text-sm"
              />

              {cvText.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {cvText.length.toLocaleString()} characters
                </p>
              )}
            </CardContent>
          </Card>

          {/* Progress */}
          {step === "parsing" && (
            <Card>
              <CardContent className="space-y-3 py-6">
                <div className="flex items-center gap-3">
                  <Loader2 className="size-5 animate-spin text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {progress < 40
                        ? "Uploading CV..."
                        : "AI is parsing your CV into sections..."}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This may take a moment
                    </p>
                  </div>
                </div>
                <Progress value={progress} />
              </CardContent>
            </Card>
          )}

          {/* Submit button */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/cv")}
              disabled={step === "parsing"}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || step === "parsing"}
            >
              {step === "parsing" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <FileText className="size-4" data-icon="inline-start" />
                  Upload & Parse
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
