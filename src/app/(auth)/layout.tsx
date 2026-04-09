import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* Subtle gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent dark:from-indigo-500/5" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-violet-500/8 via-transparent to-transparent dark:from-violet-500/4" />

      {/* Dot pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Logo */}
      <div className="relative z-10 mb-8 flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground shadow-sm">
          C
        </div>
        <span className="font-heading text-2xl font-semibold tracking-tight">
          Careetor
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">{children}</div>

      {/* Footer */}
      <p className="relative z-10 mt-8 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Careetor. All rights reserved.
      </p>
    </div>
  );
}
