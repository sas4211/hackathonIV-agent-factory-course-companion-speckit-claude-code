"use client";

import { useEffect, useState } from "react";

interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
}

export default function ProgressRing({
  value,
  size = 80,
  strokeWidth = 6,
  color = "#3b82f6",
  trackColor = "rgba(255,255,255,0.08)",
  label,
  sublabel,
}: ProgressRingProps) {
  const [animValue, setAnimValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animValue / 100) * circumference;
  const center = size / 2;

  useEffect(() => {
    const timer = setTimeout(() => setAnimValue(value), 150);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div
      style={{ position: "relative", width: size, height: size }}
      className="inline-flex items-center justify-center"
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Glow layer */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1.1s cubic-bezier(0.34,1.56,0.64,1)",
            opacity: 0.2,
            filter: `blur(4px)`,
          }}
        />
        {/* Main progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.34,1.56,0.64,1)" }}
        />
      </svg>

      {/* Center label */}
      {label !== undefined && (
        <div
          style={{ position: "absolute", textAlign: "center" }}
          className="flex flex-col items-center"
        >
          <span
            style={{
              fontFamily: "Syne, sans-serif",
              color: color,
              fontSize: size > 80 ? "1rem" : "0.8rem",
              fontWeight: 800,
              lineHeight: 1,
              textShadow: `0 0 20px ${color}88`,
            }}
          >
            {label}
          </span>
          {sublabel && (
            <span style={{ fontSize: "0.62rem", color: "#64748b", marginTop: 3 }}>{sublabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
