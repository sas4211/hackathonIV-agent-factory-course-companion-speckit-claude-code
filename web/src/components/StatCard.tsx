"use client";

import { type ReactNode, useState } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subvalue?: string;
  accentColor?: string;
  delay?: number;
}

export default function StatCard({
  icon,
  label,
  value,
  subvalue,
  accentColor = "#3b82f6",
  delay = 0,
}: StatCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? `color-mix(in srgb, ${accentColor} 8%, rgba(10,10,10,0.9))`
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${hovered ? accentColor + "55" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 18,
        padding: "22px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transform: hovered ? "translateY(-8px) scale(1.025)" : "translateY(0) scale(1)",
        boxShadow: hovered
          ? `0 24px 60px ${accentColor}22, 0 4px 20px ${accentColor}18, inset 0 1px 0 ${accentColor}20`
          : "0 2px 12px rgba(0,0,0,0.2)",
        transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
        animation: "slideUpFade 0.55s cubic-bezier(0.34,1.56,0.64,1) both",
        animationDelay: `${delay}ms`,
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Hover glow stripe at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.28s ease",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: hovered ? `${accentColor}22` : `${accentColor}12`,
            border: `1px solid ${accentColor}${hovered ? "44" : "28"}`,
            transform: hovered ? "scale(1.12) rotate(-6deg)" : "scale(1) rotate(0deg)",
            transition: "all 0.28s cubic-bezier(0.34,1.56,0.64,1)",
            color: accentColor,
            boxShadow: hovered ? `0 0 20px ${accentColor}33` : "none",
          }}
        >
          {icon}
        </div>

        {/* Animated accent dot */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: accentColor,
            opacity: hovered ? 1 : 0.3,
            boxShadow: hovered ? `0 0 12px ${accentColor}` : "none",
            transition: "all 0.28s ease",
            animation: "glowPulse 2s ease-in-out infinite",
          }}
        />
      </div>

      <div>
        <p
          style={{
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#475569",
            marginBottom: 6,
          }}
        >
          {label}
        </p>
        <p
          className="stat-value"
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "1.65rem",
            fontWeight: 800,
            color: hovered ? accentColor : "#f1f5f9",
            lineHeight: 1,
            transition: "color 0.2s ease",
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </p>
        {subvalue && (
          <p
            style={{
              fontSize: "0.75rem",
              color: hovered ? "#94a3b8" : "#475569",
              marginTop: 6,
              transition: "color 0.2s ease",
            }}
          >
            {subvalue}
          </p>
        )}
      </div>
    </div>
  );
}
