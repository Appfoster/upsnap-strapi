import React from "react";
import { Box, Typography } from "@strapi/design-system";

interface CircleProgressProps {
  score: number;
  label: string;
  size?: number;
}

const CircleProgress: React.FC<CircleProgressProps> = ({
  score,
  label,
  size = 120,
}) => {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getStrokeColor = (score: number) => {
    if (score >= 90) return "#10b981";
    if (score >= 50) return "#d97706";
    return "#ef4444";
  };

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={12}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getStrokeColor(score)}
          strokeWidth={12}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s" }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          fontSize={28}
          fontWeight={700}
          fill={getStrokeColor(score)}
        >
          {score}
        </text>
      </svg>
      <Typography variant="pi" fontWeight="bold">
        {label}
      </Typography>
    </Box>
  );
};

export default CircleProgress;