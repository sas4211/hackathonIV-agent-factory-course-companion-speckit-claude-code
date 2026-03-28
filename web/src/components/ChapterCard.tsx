"use client";

import Link from "next/link";
import ProgressRing from "./ProgressRing";
import type { ChapterSummary } from "@/lib/types";

interface ChapterCardProps {
  chapter: ChapterSummary;
  completedLessons?: string[];
  isLocked?: boolean;
  onLockedClick?: () => void;
}

export default function ChapterCard({
  chapter,
  completedLessons = [],
  isLocked = false,
  onLockedClick,
}: ChapterCardProps) {
  // Calculate progress based on completed lessons that belong to this chapter
  // We don't have lesson IDs here, so we use a heuristic based on chapter ID prefix
  const lessonCount = chapter.lesson_count || 0;
  const completedCount = completedLessons.filter((id) =>
    id.startsWith(chapter.id)
  ).length;
  const progress =
    lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;

  const content = (
    <div
      className="card p-6 h-full flex flex-col gap-4 cursor-pointer group"
      style={{
        opacity: isLocked ? 0.7 : 1,
        border: isLocked
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid rgba(255,255,255,0.08)",
      }}
      onClick={isLocked ? onLockedClick : undefined}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--muted)" }}
            >
              Ch {String(chapter.order).padStart(2, "0")}
            </span>
            {chapter.is_free ? (
              <span className="badge badge-free">Free</span>
            ) : (
              <span className="badge badge-premium">Premium</span>
            )}
            {isLocked && <span className="badge badge-locked">Locked</span>}
          </div>
          <h3
            className="font-bold text-base leading-snug"
            style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}
          >
            {chapter.title}
          </h3>
        </div>

        {isLocked ? (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
        ) : (
          <div className="flex-shrink-0">
            <ProgressRing
              value={progress}
              size={52}
              strokeWidth={4}
              color={progress === 100 ? "#4ade80" : "#3b82f6"}
              label={`${progress}%`}
            />
          </div>
        )}
      </div>

      {/* Summary */}
      {chapter.summary && (
        <p
          className="text-sm leading-relaxed flex-1"
          style={{ color: "#94a3b8" }}
        >
          {chapter.summary.length > 120
            ? chapter.summary.slice(0, 120) + "…"
            : chapter.summary}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          {chapter.lesson_count}{" "}
          {chapter.lesson_count === 1 ? "lesson" : "lessons"}
        </span>
        {!isLocked && (
          <span
            className="text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
            style={{ color: "#3b82f6" }}
          >
            {progress > 0 ? "Continue" : "Start"}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        )}
        {isLocked && (
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--yellow)" }}
          >
            Upgrade to unlock
          </span>
        )}
      </div>
    </div>
  );

  if (isLocked) return content;

  return (
    <Link href={`/chapters/${chapter.id}`} className="block h-full">
      {content}
    </Link>
  );
}
