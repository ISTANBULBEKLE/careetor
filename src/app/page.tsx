import Link from "next/link";
import {
  ScanSearch,
  BrainCircuit,
  FileText,
  PenLine,
  KanbanSquare,
  Mic,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

const features = [
  {
    icon: ScanSearch,
    title: "Smart Scanning",
    description:
      "Automatically parse job postings from any portal and extract key requirements, skills, and deadlines.",
  },
  {
    icon: BrainCircuit,
    title: "AI Evaluation",
    description:
      "Get an instant fit score comparing your profile against each role with actionable gap analysis.",
  },
  {
    icon: FileText,
    title: "Tailored CVs",
    description:
      "Generate role-specific resumes that highlight your most relevant experience for every application.",
  },
  {
    icon: PenLine,
    title: "Application Drafting",
    description:
      "AI-crafted cover letters and responses tuned to each company's tone and requirements.",
  },
  {
    icon: KanbanSquare,
    title: "Pipeline Tracking",
    description:
      "Kanban-style board to manage every application from discovery through offer, with reminders.",
  },
  {
    icon: Mic,
    title: "Interview Prep",
    description:
      "Practice with AI mock interviews tailored to the role, complete with feedback and scoring.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground text-sm">
              C
            </div>
            <span className="font-heading text-lg font-semibold tracking-tight">
              Careetor
            </span>
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent dark:from-indigo-500/5" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-24 text-center sm:px-6 sm:pt-32 lg:pt-40">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <span className="inline-block size-2 rounded-full bg-emerald-500" />
            Now in beta
          </div>

          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Your AI-powered
            <br />
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
              career command center
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            From job description to tailored application in 10 minutes.
            <br className="hidden sm:block" />
            Stop spending hours on each application — let AI do the heavy
            lifting.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register" className={buttonVariants({ size: "lg" })}>
              Get Started Free
            </Link>
            <a href="#features" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t border-border bg-muted/30 dark:bg-muted/10"
      >
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to land your next role
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Six powerful tools working together to give you an unfair
              advantage in your job search.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-foreground/15 hover:bg-card/80"
              >
                <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="font-heading text-base font-semibold">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:py-28">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to supercharge your job search?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Join thousands of professionals who are landing interviews faster
            with Careetor.
          </p>
          <div className="mt-8">
            <Link href="/register" className={buttonVariants({ size: "lg" })}>
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              C
            </div>
            <span>&copy; {new Date().getFullYear()} Careetor</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link
              href="/login"
              className="transition-colors hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="transition-colors hover:text-foreground"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
