"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Globe, Play, Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

interface ScanResult {
  company: string;
  role: string;
  url: string;
  status: "added" | "skipped_dup" | "skipped_title";
}

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [scanComplete, setScanComplete] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    setProgress(0);
    setScanComplete(false);
    setResults([]);

    // Simulate scan progress for demo
    const mockResults: ScanResult[] = [
      { company: "Anthropic", role: "Senior AI Engineer", url: "https://jobs.ashbyhq.com/anthropic/123", status: "added" },
      { company: "OpenAI", role: "ML Platform Lead", url: "https://boards.greenhouse.io/openai/456", status: "added" },
      { company: "Mistral", role: "Applied ML Engineer", url: "https://jobs.lever.co/mistral/789", status: "added" },
      { company: "Cohere", role: "NLP Research Engineer", url: "https://jobs.ashbyhq.com/cohere/012", status: "skipped_dup" },
      { company: "LangChain", role: "Platform Engineer", url: "https://boards.greenhouse.io/langchain/345", status: "added" },
      { company: "Vercel", role: "Junior Frontend Dev", url: "https://vercel.com/careers/678", status: "skipped_title" },
    ];

    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 300));
      setProgress(i);
      if (i > 0 && i <= mockResults.length * 10 + 10) {
        const idx = Math.floor(i / 10) - 1;
        if (idx >= 0 && idx < mockResults.length) {
          setResults((prev) => [...prev, mockResults[idx]]);
        }
      }
    }

    setIsScanning(false);
    setScanComplete(true);
  };

  const addedCount = results.filter((r) => r.status === "added").length;
  const skippedCount = results.filter((r) => r.status !== "added").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Portal Scanner</h1>
        <p className="text-muted-foreground">
          Scan company career portals for new job openings matching your profile.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Scan Job Portals
          </CardTitle>
          <CardDescription>
            Scans your watched companies for new openings. Filters by your keywords and deduplicates against existing jobs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isScanning && !scanComplete && (
            <Button onClick={handleScan} size="lg" className="w-full">
              <Play className="mr-2 h-4 w-4" />
              Start Scan
            </Button>
          )}

          {isScanning && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Scanning portals...</span>
              </div>
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">
                Checking {Math.floor(progress / 2)} of 50 companies...
              </p>
            </div>
          )}

          {scanComplete && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Scan Complete</span>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-emerald-600 font-medium">
                  {addedCount} new jobs found
                </span>
                <span className="text-muted-foreground">
                  {skippedCount} skipped (duplicates or filtered)
                </span>
              </div>
              <Button onClick={handleScan} variant="outline" className="mt-2">
                Scan Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scan Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {result.status === "added" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{result.company}</div>
                      <div className="text-xs text-muted-foreground">
                        {result.role}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={result.status === "added" ? "default" : "secondary"}
                    >
                      {result.status === "added"
                        ? "Added"
                        : result.status === "skipped_dup"
                          ? "Duplicate"
                          : "Filtered"}
                    </Badge>
                    {result.status === "added" && (
                      <a href={result.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
