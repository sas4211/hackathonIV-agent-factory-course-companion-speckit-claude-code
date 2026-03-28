"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDemoUser } from "@/lib/useAppUser";
import { listChapters, getProgress } from "@/lib/api";
import type { ChapterSummary, UserProgress } from "@/lib/types";
import StatCard from "@/components/StatCard";
import ProgressRing from "@/components/ProgressRing";
import Phase2Panel from "@/components/Phase2Panel";

export default function DashboardPage() {
  const { user, loading: userLoading } = useDemoUser();

  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading) return;
    async function load() {
      try {
        const [chs, prog] = await Promise.all([
          listChapters(),
          getProgress(user.id),
        ]);
        setChapters(chs);
        setProgress(prog);
      } catch (err) {
        console.error(err);
        setError("Could not connect to the backend. Make sure the backend server is running (cd backend && uvicorn main:app --port 8000).");
      } finally {
        setDataLoading(false);
      }
    }
    load();
  }, [user.id, userLoading]);

  const totalLessons = chapters.reduce((sum, ch) => sum + ch.lesson_count, 0);
  const completedLessons = progress?.completed_lessons.length ?? 0;
  const completedChapters = progress?.completed_chapters.length ?? 0;
  const totalChapters = chapters.length;
  const quizCount = Object.keys(progress?.quiz_scores ?? {}).length;
  const passedQuizzes = Object.values(progress?.quiz_scores ?? {}).filter((q) => q.passed).length;
  const avgScore =
    quizCount > 0
      ? Math.round(
          Object.values(progress?.quiz_scores ?? {}).reduce(
            (sum, q) => sum + (q.score / q.total) * 100,
            0
          ) / quizCount
        )
      : 0;

  const overallProgress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  function SkeletonCard() {
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 18,
          padding: "22px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 14 }} />
        <div>
          <div className="skeleton" style={{ width: 80, height: 10, borderRadius: 4, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 60, height: 28, borderRadius: 6 }} />
        </div>
      </div>
    );
  }

  const recentChapters = chapters.slice(0, 4);
  const FREE_LIMIT = 3;
  const isPremium = user.tier !== "free";

  return (
    <div className="max-w-6xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-10 animate-heroSlideIn">
        <p className="section-tag mb-4">Dashboard</p>
        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            fontWeight: 800,
            marginBottom: 8,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
          }}
        >
          <span className="text-shimmer">
            Welcome back{user.firstName ? `, ${user.firstName}` : ""}
          </span>{" "}
          <span style={{ WebkitTextFillColor: "initial", color: "#2563eb" }}>👋</span>
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.92rem", marginBottom: 14 }}>
          {overallProgress > 0
            ? `You're ${overallProgress}% through the course — keep the momentum going.`
            : "Start your learning journey — pick a chapter below."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/chapters"
            className="btn-outline"
            style={{ fontSize: "0.82rem", padding: "8px 16px" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Browse Chapters
          </Link>
          <Link
            href="/progress"
            className="btn-outline"
            style={{ fontSize: "0.82rem", padding: "8px 16px" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            My Progress
          </Link>
        </div>
      </div>

      {error && (
        <div
          className="mb-6 p-4 rounded-xl flex items-start gap-3"
          style={{
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.2)",
            animation: "slideUpFade 0.4s ease both",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
        </div>
      )}

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {dataLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              delay={80}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              }
              label="Lessons Done"
              value={`${completedLessons} / ${totalLessons}`}
              subvalue={`${overallProgress}% complete`}
              accentColor="#3b82f6"
            />
            <StatCard
              delay={180}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              }
              label="Chapters Done"
              value={`${completedChapters} / ${totalChapters}`}
              subvalue={totalChapters > 0 ? `${Math.round((completedChapters / totalChapters) * 100)}% done` : "No chapters yet"}
              accentColor="#4ade80"
            />
            <StatCard
              delay={280}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 9a3 3 0 115.12-2.12M9 15h.01M12 19c-4 0-7-3.13-7-7 0-3.87 3.13-7 7-7s7 3.13 7 7c0 3.87-3.13 7-7 7z" />
                </svg>
              }
              label="Quizzes Taken"
              value={quizCount}
              subvalue={`${passedQuizzes} passed`}
              accentColor="#f5c518"
            />
            <StatCard
              delay={380}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              label="Avg Quiz Score"
              value={quizCount > 0 ? `${avgScore}%` : "—"}
              subvalue={quizCount > 0 ? (avgScore >= 70 ? "Passing grade" : "Below passing") : "No quizzes yet"}
              accentColor="#f87171"
            />
          </>
        )}
      </div>

      {/* ── Main content ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* Overall progress visual */}
          {!dataLoading && totalLessons > 0 && (
            <div
              className="flex flex-col sm:flex-row sm:items-center"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 22,
                padding: "24px 28px",
                gap: 28,
                animation: "slideUpFade 0.55s ease both",
                animationDelay: "480ms",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Subtle glow behind ring */}
              <div
                style={{
                  position: "absolute",
                  left: 20,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: overallProgress === 100 ? "#4ade80" : "#3b82f6",
                  filter: "blur(40px)",
                  opacity: 0.08,
                  pointerEvents: "none",
                }}
              />
              <ProgressRing
                value={overallProgress}
                size={108}
                strokeWidth={9}
                color={overallProgress === 100 ? "#4ade80" : "#3b82f6"}
                label={`${overallProgress}%`}
                sublabel="done"
              />
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: "1.15rem",
                    fontWeight: 800,
                    color: "#f1f5f9",
                    marginBottom: 6,
                  }}
                >
                  Overall Progress
                </h3>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: 14 }}>
                  {completedLessons} of {totalLessons} lessons completed
                </p>
                <div className="progress-track" style={{ maxWidth: 240 }}>
                  <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* Chapters overview */}
          <div style={{ animation: "slideUpFade 0.55s ease both", animationDelay: "540ms" }}>
            <div className="flex items-center justify-between mb-5">
              <h2
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  color: "#f1f5f9",
                }}
              >
                Course Chapters
              </h2>
              <Link
                href="/chapters"
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#3b82f6",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  textDecoration: "none",
                  transition: "gap 0.2s ease",
                }}
              >
                View all
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {dataLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="skeleton"
                    style={{ height: 68, borderRadius: 14 }}
                  />
                ))}
              </div>
            ) : chapters.length === 0 ? (
              <div
                style={{
                  padding: "28px",
                  borderRadius: 14,
                  textAlign: "center",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <p style={{ color: "#64748b", fontSize: "0.875rem" }}>No chapters found. Make sure the backend is running.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {recentChapters.map((chapter, idx) => {
                  const isLocked = !isPremium && chapter.order > FREE_LIMIT && !chapter.is_free;
                  const chCompleted = progress?.completed_chapters.includes(chapter.id);
                  const chLessonsComplete =
                    progress?.completed_lessons.filter((id) => id.startsWith(chapter.id)).length ?? 0;
                  const chProgress =
                    chapter.lesson_count > 0
                      ? Math.round((chLessonsComplete / chapter.lesson_count) * 100)
                      : 0;

                  return (
                    <Link
                      key={chapter.id}
                      href={isLocked ? "/chapters" : `/chapters/${chapter.id}`}
                      className="block animate-slideInLeft"
                      style={{
                        textDecoration: "none",
                        animationDelay: `${600 + idx * 80}ms`,
                      }}
                    >
                      <div
                        style={{
                          padding: "14px 18px",
                          borderRadius: 14,
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          background: "rgba(255,255,255,0.03)",
                          border: `1px solid ${chCompleted ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.07)"}`,
                          opacity: isLocked ? 0.55 : 1,
                          transition: "all 0.22s ease",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          if (!isLocked) {
                            (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.06)";
                            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(59,130,246,0.25)";
                            (e.currentTarget as HTMLDivElement).style.transform = "translateX(4px)";
                            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(59,130,246,0.08)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
                          (e.currentTarget as HTMLDivElement).style.borderColor = chCompleted ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.07)";
                          (e.currentTarget as HTMLDivElement).style.transform = "translateX(0)";
                          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                        }}
                      >
                        {/* Chapter number / checkmark */}
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            fontFamily: "Syne, sans-serif",
                            background: chCompleted
                              ? "rgba(74,222,128,0.18)"
                              : "rgba(255,255,255,0.06)",
                            color: chCompleted ? "#4ade80" : "#64748b",
                            border: chCompleted
                              ? "1px solid rgba(74,222,128,0.35)"
                              : "1px solid rgba(255,255,255,0.09)",
                            boxShadow: chCompleted ? "0 0 12px rgba(74,222,128,0.2)" : "none",
                          }}
                        >
                          {chCompleted ? "✓" : String(chapter.order).padStart(2, "0")}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <span
                              style={{
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                color: "#e2e8f0",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {chapter.title}
                            </span>
                            {isLocked && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                <path d="M7 11V7a5 5 0 0110 0v4" />
                              </svg>
                            )}
                          </div>
                          {!isLocked && (
                            <div className="progress-track" style={{ height: 4 }}>
                              <div className="progress-fill" style={{ width: `${chProgress}%` }} />
                            </div>
                          )}
                        </div>

                        <div style={{ flexShrink: 0, fontSize: "0.72rem", color: "#475569", fontWeight: 600 }}>
                          {chapter.lesson_count}L
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right col */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            animation: "slideUpFade 0.55s ease both",
            animationDelay: "500ms",
          }}
        >
          {/* AI Phase 2 Panel */}
          <Phase2Panel
            userId={user.id}
            tier={user.tier}
            availableChapters={chapters.map((c) => ({ id: c.id, title: c.title }))}
          />

          {/* Quiz scores */}
          {!dataLoading && quizCount > 0 && (
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18,
                padding: "20px",
              }}
            >
              <h3
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  color: "#f1f5f9",
                  marginBottom: 16,
                }}
              >
                Recent Quiz Scores
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Object.entries(progress!.quiz_scores)
                  .slice(0, 5)
                  .map(([quizId, score]) => (
                    <Link
                      key={quizId}
                      href={`/quiz/${quizId}`}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, textDecoration: "none" }}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#94a3b8",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                        }}
                      >
                        {quizId}
                      </span>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          padding: "2px 10px",
                          borderRadius: 99,
                          flexShrink: 0,
                          background: score.passed ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)",
                          color: score.passed ? "#4ade80" : "#f87171",
                          border: `1px solid ${score.passed ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}`,
                        }}
                      >
                        {score.score}/{score.total}
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* Plan badge */}
          <div
            style={{
              padding: "22px",
              borderRadius: 20,
              textAlign: "center",
              background: isPremium
                ? "linear-gradient(135deg, rgba(59,130,246,0.06), rgba(74,222,128,0.04))"
                : "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(245,197,24,0.06))",
              border: isPremium
                ? "1px solid rgba(59,130,246,0.2)"
                : "1px solid rgba(37,99,235,0.18)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Glow top stripe */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: isPremium
                  ? "linear-gradient(90deg, transparent, #3b82f6, transparent)"
                  : "linear-gradient(90deg, transparent, #2563eb, transparent)",
              }}
            />

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 14px",
                borderRadius: 99,
                fontSize: "0.7rem",
                fontWeight: 800,
                marginBottom: 12,
                background: isPremium ? "rgba(59,130,246,0.15)" : "rgba(245,197,24,0.12)",
                color: isPremium ? "#3b82f6" : "#f5c518",
                border: isPremium ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(245,197,24,0.3)",
                letterSpacing: "0.05em",
              }}
            >
              {isPremium ? "⭐ Pro Plan" : "Free Plan"}
            </div>

            <p style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: isPremium ? 0 : 16, lineHeight: 1.5 }}>
              {isPremium
                ? "You have access to all features including AI-powered learning."
                : `Free plan includes ${FREE_LIMIT} chapters. Upgrade for full AI access.`}
            </p>

            {!isPremium && (
              <button
                className="btn-yellow"
                style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: "0.82rem" }}
                onClick={() => alert("Upgrade flow — connect to your billing provider")}
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
