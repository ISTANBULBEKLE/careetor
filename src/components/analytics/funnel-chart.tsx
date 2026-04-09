"use client";

import dynamic from "next/dynamic";

const RechartsBarChart = dynamic(
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

      function FunnelBarChart({
        data,
      }: {
        data: { stage: string; count: number; color: string }[];
      }) {
        return (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="var(--color-border)"
              />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="stage"
                tick={{ fontSize: 13, fill: "var(--color-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={90}
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
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={32}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      }

      return FunnelBarChart;
    }),
  { ssr: false, loading: () => <FunnelSkeleton /> }
);

function FunnelSkeleton() {
  return (
    <div className="flex h-[280px] items-center justify-center">
      <div className="flex flex-col gap-3 w-full px-8">
        {[100, 75, 50, 25].map((w, i) => (
          <div
            key={i}
            className="h-8 rounded-md bg-muted animate-pulse"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  );
}

interface FunnelChartProps {
  data: { stage: string; count: number; color: string }[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  return <RechartsBarChart data={data} />;
}
