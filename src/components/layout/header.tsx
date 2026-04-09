"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Plus,
  Bell,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MobileNav } from "@/components/layout/mobile-nav";

/** Map route segments to readable breadcrumb labels. */
const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  cv: "My CV",
  jobs: "Jobs",
  applications: "Applications",
  interviews: "Interviews",
  analytics: "Analytics",
  portals: "Portals",
  settings: "Settings",
  profile: "Profile",
  new: "New",
  edit: "Edit",
};

function useBreadcrumbs() {
  const pathname = usePathname();

  return React.useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const label =
        segmentLabels[segment] ??
        segment.charAt(0).toUpperCase() + segment.slice(1);
      const isLast = index === segments.length - 1;
      return { href, label, isLast };
    });
  }, [pathname]);
}

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const breadcrumbs = useBreadcrumbs();

  // Sync theme with document on mount
  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = React.useCallback(() => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }, [theme]);

  return (
    <>
      <header
        className={cn(
          "flex h-14 items-center gap-3 border-b border-border bg-background px-4 lg:px-6",
          className
        )}
      >
        {/* Mobile menu trigger */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              {index > 0 && (
                <ChevronRight className="size-3 text-muted-foreground" />
              )}
              {crumb.isLast ? (
                <span className="font-medium text-foreground">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1">
          <TooltipProvider>
            {/* Quick add */}
            <Link href="/jobs/new" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">New Job</span>
            </Link>

            <Separator orientation="vertical" className="mx-1 h-5" />

            {/* Notifications */}
            <Tooltip>
              <TooltipTrigger
                render={<Button variant="ghost" size="icon-sm" />}
              >
                <Bell className="size-4" />
                <span className="sr-only">Notifications</span>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>

            {/* Theme toggle */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button variant="ghost" size="icon-sm" onClick={toggleTheme} />
                }
              >
                {theme === "light" ? (
                  <Moon className="size-4" />
                ) : (
                  <Sun className="size-4" />
                )}
                <span className="sr-only">Toggle theme</span>
              </TooltipTrigger>
              <TooltipContent>
                {theme === "light" ? "Dark mode" : "Light mode"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      {/* Mobile navigation sheet */}
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </>
  );
}
