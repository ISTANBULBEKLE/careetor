"use client";

import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FunnelChart } from "@/components/analytics/funnel-chart";
import { ScoreDistribution } from "@/components/analytics/score-distribution";
import {
  Lightbulb,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Calendar,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Dynamic recharts components
// ---------------------------------------------------------------------------

const StatusPieChart = dynamic(
  () =>
    import("recharts").then((mod) => {
      const { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } = mod;

      const COLORS = [
        "#6366f1", // indigo - evaluated
        "#3b82f6", // blue - applied
        "#f59e0b", // amber - interview
        "#10b981", // emerald - offer
        "#f43f5e", // rose - rejected
        "#94a3b8", // slate - pending
        "#8b5cf6", // violet - responded
        "#64748b", // slate - discarded/skip
      ];

      function Chart({
        data,
      }: {
        data: { name: string; value: number }[];
      }) {
        return (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: 13,
                  color: "var(--color-popover-foreground)",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span style={{ color: "var(--color-foreground)", fontSize: 12 }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      }

      return Chart;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[280px] items-center justify-center">
        <div className="size-40 rounded-full border-8 border-muted animate-pulse" />
      </div>
    ),
  }
);

const ArchetypeBarChart = dynamic(
  () =>
    import("recharts").then((mod) => {
      const {
        BarChart,
        Bar,
        XAxis,
        YAxis,
        CartesianGrid,
        Tooltip,
        ResponsiveContainer,
        Legend,
      } = mod;

      function Chart({
        data,
      }: {
        data: { archetype: string; avgScore: number; count: number }[];
      }) {
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{ top: 8, right: 16, left: 0, bottom: 40 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="archetype"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={false}
                angle={-20}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: 13,
                  color: "var(--color-popover-foreground)",
                }}
              />
              <Legend
                formatter={(value: string) => (
                  <span style={{ color: "var(--color-foreground)", fontSize: 12 }}>
                    {value}
                  </span>
                )}
              />
              <Bar
                dataKey="avgScore"
                name="Avg Score"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                barSize={28}
              />
              <Bar
                dataKey="count"
                name="Count"
                fill="#a5b4fc"
                radius={[4, 4, 0, 0]}
                barSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      }

      return Chart;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] items-center justify-center">
        <div className="flex items-end gap-3 h-48">
          {[60, 80, 50, 90, 40, 70].map((h, i) => (
            <div
              key={i}
              className="w-7 rounded-t-md bg-muted animate-pulse"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    ),
  }
);

const TimeSeriesChart = dynamic(
  () =>
    import("recharts").then((mod) => {
      const {
        LineChart,
        Line,
        XAxis,
        YAxis,
        CartesianGrid,
        Tooltip,
        ResponsiveContainer,
      } = mod;

      function Chart({
        data,
      }: {
        data: { date: string; count: number }[];
      }) {
        return (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={data}
              margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: 13,
                  color: "var(--color-popover-foreground)",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: "#6366f1", r: 3 }}
                activeDot={{ r: 5, fill: "#6366f1" }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      }

      return Chart;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[280px] items-center justify-center">
        <div className="h-px w-3/4 bg-muted animate-pulse" />
      </div>
    ),
  }
);

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const FUNNEL_DATA = [
  { stage: "Evaluated", count: 24, color: "#6366f1" },
  { stage: "Applied", count: 15, color: "#3b82f6" },
  { stage: "Interview", count: 6, color: "#f59e0b" },
  { stage: "Offer", count: 2, color: "#10b981" },
];

const MOCK_SCORES = [
  2.8, 3.1, 3.2, 3.3, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.1, 4.1, 4.2, 4.3,
  4.3, 4.4, 4.5, 4.5, 4.6, 4.7, 4.8, 3.0, 3.4, 3.9,
];

const STATUS_DATA = [
  { name: "Evaluated", value: 6 },
  { name: "Applied", value: 8 },
  { name: "Interview", value: 3 },
  { name: "Offer", value: 1 },
  { name: "Rejected", value: 2 },
  { name: "Pending", value: 4 },
];

const ARCHETYPE_DATA = [
  { archetype: "AI Platform", avgScore: 4.3, count: 8 },
  { archetype: "Agentic", avgScore: 4.1, count: 5 },
  { archetype: "Tech AI PM", avgScore: 3.8, count: 4 },
  { archetype: "Solutions Arch", avgScore: 3.9, count: 3 },
  { archetype: "FDE", avgScore: 4.5, count: 2 },
  { archetype: "Transformation", avgScore: 3.6, count: 2 },
];

const TIME_SERIES_DATA = [
  { date: "Mar 1", count: 2 },
  { date: "Mar 8", count: 5 },
  { date: "Mar 15", count: 3 },
  { date: "Mar 22", count: 7 },
  { date: "Mar 29", count: 4 },
  { date: "Apr 5", count: 6 },
];

const INSIGHTS = [
  {
    text: "Your AI Platform roles score 15% higher than average.",
    type: "positive" as const,
  },
  {
    text: "Interview conversion rate is 40% -- above the 25% benchmark.",
    type: "positive" as const,
  },
  {
    text: "Consider targeting more FDE roles -- your highest avg score archetype.",
    type: "suggestion" as const,
  },
  {
    text: "Transformation Lead roles trend below 3.7 -- consider adjusting filters.",
    type: "warning" as const,
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track your application pipeline and discover patterns.
        </p>
      </div>

      {/* Top row: funnel + score distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-4 text-indigo-500" />
              Application Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelChart data={FUNNEL_DATA} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-4 text-indigo-500" />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreDistribution scores={MOCK_SCORES} />
          </CardContent>
        </Card>
      </div>

      {/* Middle row: status breakdown + archetype performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="size-4 text-indigo-500" />
              Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusPieChart data={STATUS_DATA} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-4 text-indigo-500" />
              Archetype Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ArchetypeBarChart data={ARCHETYPE_DATA} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: time series + insights */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-4 text-indigo-500" />
              Applications Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimeSeriesChart data={TIME_SERIES_DATA} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="size-4 text-amber-500" />
              Insights
            </CardTitle>
            <CardDescription>AI-generated observations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {INSIGHTS.map((insight, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <Badge
                    variant="secondary"
                    className={
                      insight.type === "positive"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 shrink-0"
                        : insight.type === "suggestion"
                          ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 shrink-0"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 shrink-0"
                    }
                  >
                    {insight.type === "positive"
                      ? "+"
                      : insight.type === "suggestion"
                        ? "?"
                        : "!"}
                  </Badge>
                  <span className="text-muted-foreground">{insight.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
