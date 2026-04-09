"use client";

import * as React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  PolarRadiusAxis,
} from "recharts";

import type { JobScores } from "@/types";

interface ScoreRadarProps {
  scores: JobScores;
  className?: string;
}

const DIMENSION_LABELS: Record<keyof JobScores, string> = {
  archetype_alignment: "Archetype",
  cv_match: "CV Match",
  seniority_fit: "Seniority",
  compensation: "Compensation",
  career_growth: "Growth",
  remote_policy: "Remote",
  company_reputation: "Company",
  tech_stack: "Tech Stack",
  process_speed: "Speed",
  cultural_signals: "Culture",
};

export function ScoreRadar({ scores, className }: ScoreRadarProps) {
  const data = React.useMemo(
    () =>
      Object.entries(scores).map(([key, value]) => ({
        dimension: DIMENSION_LABELS[key as keyof JobScores] ?? key,
        value: value as number,
        fullMark: 5,
      })),
    [scores]
  );

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid
            stroke="currentColor"
            className="text-border"
          />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-muted-foreground"
          />
          <PolarRadiusAxis
            domain={[0, 5]}
            tickCount={6}
            tick={{ fontSize: 10 }}
            className="text-muted-foreground"
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
