"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDemoUser } from "@/lib/useAppUser";
import { getProgress, listChapters } from "@/lib/api";
import type { UserProgress, ChapterSummary } from "@/lib/types";
import ProgressRing from "@/components/ProgressRing";
import StatCard from "@/components/StatCard";

export default function ProgressPage() {
  const { user } = useDemoUser();

  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [prog, chs] = await Promise.all([
          getProgress(user.id),
          listChapters(),
        ]);
        setProgress(prog);
        setChapters(chs);
      } catch (err) {
        console.error(err);
        setError("Could not load progress data. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.id]);

  const totalLessons = chapters.reduce((s, c) => s + c.lesson_count, 0);
  const completedLessons = progress?.completed_lessons.length ?? 0;
  const completedChapters = progress?.completed_chapters.length ?? 0;
  const totalChapters = chapters.length;
  const quizScores = progress?.quiz_scores ?? {};
  const quizEntries = Object.entries(quizScores);
  const passedQuizzes = quizEntries.filter(([, s]) => s.passed).length;
  const avgScore =
    quizEntries.length > 0
      ? Math.round(
          quizEntries.reduce((sum, [, s]) => sum + (s.score / s.total) * 100, 0) /
            quizEntries.length
        )
      : 0;
  const overallProgress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs mb-5" style={{ color: "#64748b" }}>
        <Link href="/" style={{ color: "#64748b", textDecoration: "none" }} className="hover:text-white">
          Dashboard
        </Link>
        <span>/</span>
        <span style={{ color: "#e2e8f0" }}>Progress</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <p className="section-tag mb-3">My Progress</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}
            >
              Learning Progress
            </h1>
            <p className="text-sm" style={{ color: "#64748b" }}>
              Track your journey through the course — lessons, chapters, and quiz performance.
            </p>
          </div>
          <Link
            href="/chapters"
            className="btn-outline flex-shrink-0"
            style={{ fontSize: "0.82rem", padding: "8px 16px" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Browse Chapters
          </Link>
        </div>
      </div>

      {error && (
        <div
          className="mb-6 p-4 rounded-xl"
          style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}
        >
          <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {/* ── Stat cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>}
              label="Lessons Complete"
              value={`${completedLessons} / ${totalLessons}`}
              subvalue={`${overallProgress}% overall`}
              accentColor="#3b82f6"
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
              label="Chapters Done"
              value={`${completedChapters} / ${totalChapters}`}
              subvalue={totalChapters > 0 ? `${Math.round((completedChapters / totalChapters) * 100)}%` : "0%"}
              accentColor="#4ade80"
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 9a3 3 0 115.12-2.12M9 15h.01M12 19c-4 0-7-3.13-7-7 0-3.87 3.13-7 7-7s7 3.13 7 7c0 3.87-3.13 7-7 7z" /></svg>}
              label="Quizzes Passed"
              value={`${passedQuizzes} / ${quizEntries.length}`}
              subvalue={quizEntries.length > 0 ? `${Math.round((passedQuizzes / quizEntries.length) * 100)}% pass rate` : "No quizzes yet"}
              accentColor="#f5c518"
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
              label="Avg Quiz Score"
              value={quizEntries.length > 0 ? `${avgScore}%` : "—"}
              subvalue={avgScore >= 70 ? "Passing average" : quizEntries.length > 0 ? "Below passing (70%)" : "Take some quizzes!"}
              accentColor="#f87171"
            />
          </div>

          {/* ── Visual progress ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Big progress ring */}
            <div
              className="card-static p-6 flex flex-col items-center gap-4 justify-center lg:col-span-1"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
              }}
            >
              <ProgressRing
                value={overallProgress}
                size={140}
                strokeWidth={10}
                color={overallProgress === 100 ? "#4ade80" : "#3b82f6"}
                trackColor="rgba(255,255,255,0.06)"
                label={`${overallProgress}%`}
                sublabel="overall"
              />
              <div className="text-center">
                <p className="font-bold text-sm" style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}>
                  Course Progress
                </p>
                <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                  {completedLessons} of {totalLessons} lessons
                </p>
              </div>
            </div>

            {/* Chapter progress bars */}
            <div
              className="card-static p-6 lg:col-span-2"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
              }}
            >
              <h3
                className="text-base font-bold mb-5"
                style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}
              >
                Chapter Breakdown
              </h3>
              {chapters.length === 0 ? (
                <p className="text-sm" style={{ color: "#64748b" }}>No chapters found.</p>
              ) : (
                <div className="space-y-4">
                  {chapters.map((chapter) => {
                    const chDone = progress?.completed_chapters.includes(chapter.id);
                    const lessonsInCh = progress?.completed_lessons.filter(
                      (id) => id.startsWith(chapter.id)
                    ).length ?? 0;
                    const chProgress =
                      chapter.lesson_count > 0
                        ? Math.round((lessonsInCh / chapter.lesson_count) * 100)
                        : 0;

                    return (
                      <div key={chapter.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <Link
                            href={`/chapters/${chapter.id}`}
                            className="text-sm font-medium hover:text-white transition-colors truncate max-w-xs"
                            style={{ color: "#e2e8f0", textDecoration: "none" }}
                          >
                            {chapter.title}
                          </Link>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            {chDone && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                            )}
                            <span className="text-xs" style={{ color: "#64748b" }}>
                              {lessonsInCh}/{chapter.lesson_count}
                            </span>
                          </div>
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${chProgress}%`,
                              background:
                                chDone
                                  ? "linear-gradient(90deg, #4ade80, #3b82f6)"
                                  : "linear-gradient(90deg, #3b82f6, #f5c518)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Quiz history ── */}
          <div
            className="card-static p-6"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3
                className="text-base font-bold"
                style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}
              >
                Quiz History
              </h3>
              {quizEntries.length > 0 && (
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "#64748b" }}>
                  {quizEntries.length} quiz{quizEntries.length !== 1 ? "zes" : ""}
                </span>
              )}
            </div>

            {quizEntries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm mb-4" style={{ color: "#64748b" }}>
                  You haven&apos;t taken any quizzes yet.
                </p>
                <Link href="/chapters" className="btn-outline text-sm" style={{ padding: "9px 18px" }}>
                  Browse Chapters
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest" style={{ color: "#374151", background: "rgba(255,255,255,0.03)" }}>
                        Quiz
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest" style={{ color: "#374151", background: "rgba(255,255,255,0.03)" }}>
                        Score
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest" style={{ color: "#374151", background: "rgba(255,255,255,0.03)" }}>
                        Percentage
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest" style={{ color: "#374151", background: "rgba(255,255,255,0.03)" }}>
                        Status
                      </th>
                      <th className="py-3 px-4" style={{ background: "rgba(255,255,255,0.03)" }} />
                    </tr>
                  </thead>
                  <tbody>
                    {quizEntries.map(([quizId, score]) => {
                      const pct = Math.round((score.score / score.total) * 100);
                      return (
                        <tr key={quizId} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                          <td className="py-3 px-4 text-sm" style={{ color: "#e2e8f0" }}>
                            {quizId}
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold" style={{ color: "#e2e8f0" }}>
                            {score.score} / {score.total}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="progress-track flex-1 max-w-[80px]">
                                <div
                                  className="progress-fill"
                                  style={{
                                    width: `${pct}%`,
                                    background: score.passed
                                      ? "linear-gradient(90deg, #4ade80, #3b82f6)"
                                      : "linear-gradient(90deg, #f87171, #f5c518)",
                                  }}
                                />
                              </div>
                              <span className="text-sm font-semibold" style={{ color: score.passed ? "#4ade80" : "#f87171" }}>
                                {pct}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="badge"
                              style={{
                                background: score.passed ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)",
                                color: score.passed ? "#4ade80" : "#f87171",
                                border: score.passed ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(248,113,113,0.3)",
                              }}
                            >
                              {score.passed ? "Passed" : "Failed"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              href={`/quiz/${quizId}`}
                              className="text-xs font-semibold"
                              style={{ color: "#3b82f6", textDecoration: "none" }}
                            >
                              Retake →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
