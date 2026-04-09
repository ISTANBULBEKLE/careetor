"use client";

import dynamic from "next/dynamic";

interface BinData {
  range: string;
  count: number;
  fill: string;
}

function buildBins(scores: number[]): BinData[] {
  const bins: BinData[] = [
    { range: "<3.0", count: 0, fill: "#f43f5e" },
    { range: "3.0-3.4", count: 0, fill: "#f59e0b" },
    { range: "3.5-3.9", count: 0, fill: "#eab308" },
    { range: "4.0-4.4", count: 0, fill: "#3b82f6" },
    { range: "4.5-5.0", count: 0, fill: "#10b981" },
  ];

  for (const s of scores) {
    if (s < 3.0) bins[0].count++;
    else if (s < 3.5) bins[1].count++;
    else if (s < 4.0) bins[2].count++;
    else if (s < 4.5) bins[3].count++;
    else bins[4].count++;
  }

  return bins;
}

const RechartsHistogram = dynamic(
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
        Cell,
      } = mod;

      function Histogram({ bins }: { bins: BinData[] }) {
        return (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={bins}
              margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="range"
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
              <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                {bins.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      }

      return Histogram;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[280px] items-center justify-center">
        <div className="flex items-end gap-2 h-48">
          {[40, 60, 80, 100, 50].map((h, i) => (
            <div
              key={i}
              className="w-10 rounded-t-md bg-muted animate-pulse"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    ),
  }
);

interface ScoreDistributionProps {
  scores: number[];
}

export function ScoreDistribution({ scores }: ScoreDistributionProps) {
  const bins = buildBins(scores);
  return <RechartsHistogram bins={bins} />;
}
