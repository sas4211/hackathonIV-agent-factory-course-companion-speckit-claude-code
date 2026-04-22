"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDemoUser } from "@/lib/useAppUser";
import { listChapters, getProgress } from "@/lib/api";
import type { ChapterSummary, UserProgress } from "@/lib/types";
import StatCard from "@/components/StatCard";

// Clerk is optional — same graceful fallback pattern used throughout the app
let useClerkUser: (() => { user: { publicMetadata?: Record<string, unknown> } | null | undefined; isLoaded: boolean }) | null = null;
let ClerkSignInButton: React.ComponentType<{ mode?: string; children: React.ReactNode }> | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const clerk = require("@clerk/nextjs");
  useClerkUser = clerk.useUser;
  ClerkSignInButton = clerk.SignInButton;
} catch {
  useClerkUser = null;
}

// Simulated student roster for analytics display
const DEMO_STUDENT_IDS = [
  "demo_user",
  "student_001",
  "student_002",
  "student_003",
  "student_004",
];

interface StudentAnalytics {
  userId: string;
  progress: UserProgress | null;
  error: boolean;
}

export default function AdminPage() {
  const { user: demoUser, loading: userLoading } = useDemoUser();

  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [students, setStudents] = useState<StudentAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "analytics">("content");

  // Clerk admin check — conditional hook call (stable at runtime, same pattern as Sidebar)
  let clerkUser: { publicMetadata?: Record<string, unknown> } | null | undefined = null;
  let clerkLoaded = false;
  let hasClerk = false;

  if (useClerkUser) {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const result = useClerkUser();
      clerkUser = result.user;
      clerkLoaded = result.isLoaded;
      hasClerk = true;
    } catch {
      hasClerk = false;
    }
  }

  // Admin check: Clerk role takes priority; fall back to demo user flag
  const isClerkMode = hasClerk && clerkLoaded;
  const isSignedInWithClerk = isClerkMode && clerkUser !== null && clerkUser !== undefined;
  const isAdmin = isClerkMode
    ? (clerkUser?.publicMetadata?.role === "admin")
    : demoUser.isAdmin;

  const user = demoUser; // keep for display (name, tier, etc.)

  useEffect(() => {
    if (userLoading) return;
    if (hasClerk && !clerkLoaded) return; // wait for Clerk to resolve
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const chs = await listChapters();
        setChapters(chs);

        // Load multiple students' progress
        const studentData = await Promise.all(
          DEMO_STUDENT_IDS.map(async (id): Promise<StudentAnalytics> => {
            try {
              const p = await getProgress(id);
              return { userId: id, progress: p, error: false };
            } catch {
              return { userId: id, progress: null, error: true };
            }
          })
        );
        setStudents(studentData);
      } catch (err) {
        console.error(err);
        setError("Could not load admin data. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAdmin, userLoading, hasClerk, clerkLoaded]);

  if (userLoading || (hasClerk && !clerkLoaded) || loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="skeleton h-8 w-48 rounded mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  if (!isAdmin) {
    // Clerk mode: signed in but missing the admin role
    if (isClerkMode && isSignedInWithClerk) {
      return (
        <div className="max-w-xl mx-auto py-20 text-center">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}>
            Admin Access Required
          </h2>
          <p className="text-sm mb-3" style={{ color: "#64748b" }}>
            Your account doesn&apos;t have the admin role. To grant access, set{" "}
            <code style={{ background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: 4, color: "#f5c518", fontSize: "0.8rem" }}>
              publicMetadata.role = &quot;admin&quot;
            </code>{" "}
            on your user in the Clerk Dashboard.
          </p>
          <p className="text-xs mb-8" style={{ color: "#475569" }}>
            Clerk Dashboard → Users → select user → Metadata → Public Metadata
          </p>
          <Link href="/" className="btn-outline">← Back to Dashboard</Link>
        </div>
      );
    }

    // Demo mode or Clerk not configured
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}>
          Not Authorized
        </h2>
        <p className="text-sm mb-8" style={{ color: "#64748b" }}>
          {isClerkMode
            ? "Sign in with an admin account to access this page."
            : "Switch to the Admin demo user using the buttons in the top nav bar."}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {isClerkMode && ClerkSignInButton ? (
            <ClerkSignInButton mode="redirect">
              <button className="btn-primary" style={{ padding: "10px 24px" }}>
                Sign in as Admin
              </button>
            </ClerkSignInButton>
          ) : null}
          <Link href="/" className="btn-outline">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Analytics computations
  const totalStudents = students.length;
  const activeStudents = students.filter(
    (s) => s.progress && s.progress.completed_lessons.length > 0
  ).length;
  const totalLessons = chapters.reduce((s, c) => s + c.lesson_count, 0);
  const avgLessonsComplete =
    totalStudents > 0
      ? Math.round(
          students.reduce(
            (sum, s) => sum + (s.progress?.completed_lessons.length ?? 0),
            0
          ) / totalStudents
        )
      : 0;
  const totalQuizAttempts = students.reduce(
    (sum, s) => sum + Object.keys(s.progress?.quiz_scores ?? {}).length,
    0
  );

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs mb-5" style={{ color: "#64748b" }}>
        <Link href="/" style={{ color: "#64748b", textDecoration: "none" }} className="hover:text-white">
          Dashboard
        </Link>
        <span>/</span>
        <span style={{ color: "#e2e8f0" }}>Admin</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <p className="section-tag">Admin Panel</p>
          <span
            className="badge text-xs px-2 py-0.5 rounded-full"
            style={{ background: "rgba(248,113,113,0.15)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }}
          >
            ADMIN
          </span>
        </div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}
        >
          Admin Dashboard
        </h1>
        <p className="text-sm" style={{ color: "#64748b" }}>
          Manage course content and monitor student analytics.
        </p>
      </div>

      {error && (
        <div
          className="mb-6 p-4 rounded-xl"
          style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}
        >
          <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>}
          label="Total Students"
          value={totalStudents}
          subvalue={`${activeStudents} active`}
          accentColor="#3b82f6"
        />
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>}
          label="Total Chapters"
          value={chapters.length}
          subvalue={`${chapters.filter((c) => c.is_free).length} free, ${chapters.filter((c) => !c.is_free).length} premium`}
          accentColor="#4ade80"
        />
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          label="Avg Lessons/Student"
          value={`${avgLessonsComplete} / ${totalLessons}`}
          subvalue={totalLessons > 0 ? `${Math.round((avgLessonsComplete / totalLessons) * 100)}% avg` : ""}
          accentColor="#f5c518"
        />
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 9a3 3 0 115.12-2.12M9 15h.01M12 19c-4 0-7-3.13-7-7 0-3.87 3.13-7 7-7s7 3.13 7 7c0 3.87-3.13 7-7 7z" /></svg>}
          label="Total Quiz Attempts"
          value={totalQuizAttempts}
          subvalue={`across ${totalStudents} students`}
          accentColor="#f87171"
        />
      </div>

      {/* Tab nav */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-6 w-full sm:w-fit"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {(["content", "analytics"] as const).map((tab) => (
          <button
            key={tab}
            className="flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize"
            style={{
              background: activeTab === tab ? "rgba(37,99,235,0.2)" : "transparent",
              color: activeTab === tab ? "#f1f5f9" : "#64748b",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content tab */}
      {activeTab === "content" && (
        <div
          className="card-static p-6 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3
              className="text-base font-bold"
              style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}
            >
              Course Content
            </h3>
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "#64748b" }}>
              {chapters.length} chapters
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {["#", "Chapter", "Access", "Lessons", ""].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest"
                      style={{ color: "#374151", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chapters.map((chapter, i) => (
                  <tr key={chapter.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="py-3 px-4 text-sm" style={{ color: "#64748b" }}>
                      {String(chapter.order).padStart(2, "0")}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#e2e8f0" }}>
                          {chapter.title}
                        </p>
                        {chapter.summary && (
                          <p className="text-xs mt-0.5 truncate max-w-xs" style={{ color: "#64748b" }}>
                            {chapter.summary}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {chapter.is_free ? (
                        <span className="badge badge-free">Free</span>
                      ) : (
                        <span className="badge badge-premium">Premium</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ color: "#94a3b8" }}>
                      {chapter.lesson_count}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/chapters/${chapter.id}`}
                        className="text-xs font-semibold"
                        style={{ color: "#3b82f6", textDecoration: "none" }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics tab */}
      {activeTab === "analytics" && (
        <div
          className="card-static p-6 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3
              className="text-base font-bold"
              style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}
            >
              Student Analytics
            </h3>
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "#64748b" }}>
              {totalStudents} students
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {["Student ID", "Lessons", "Chapters", "Quizzes", "Avg Score", "Status"].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest"
                      style={{ color: "#374151", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  if (student.error || !student.progress) {
                    return (
                      <tr key={student.userId} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td className="py-3 px-4 text-sm" style={{ color: "#e2e8f0" }}>{student.userId}</td>
                        <td colSpan={5} className="py-3 px-4 text-xs" style={{ color: "#64748b" }}>No data</td>
                      </tr>
                    );
                  }

                  const p = student.progress;
                  const quizEntries = Object.values(p.quiz_scores);
                  const avgPct =
                    quizEntries.length > 0
                      ? Math.round(
                          quizEntries.reduce(
                            (s, q) => s + (q.score / q.total) * 100,
                            0
                          ) / quizEntries.length
                        )
                      : null;
                  const isActive = p.completed_lessons.length > 0;

                  return (
                    <tr key={student.userId} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td className="py-3 px-4 text-sm font-medium" style={{ color: "#e2e8f0" }}>
                        {student.userId}
                      </td>
                      <td className="py-3 px-4 text-sm" style={{ color: "#94a3b8" }}>
                        {p.completed_lessons.length} / {totalLessons}
                      </td>
                      <td className="py-3 px-4 text-sm" style={{ color: "#94a3b8" }}>
                        {p.completed_chapters.length} / {chapters.length}
                      </td>
                      <td className="py-3 px-4 text-sm" style={{ color: "#94a3b8" }}>
                        {quizEntries.length}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {avgPct !== null ? (
                          <span style={{ color: avgPct >= 70 ? "#4ade80" : "#f87171", fontWeight: 600 }}>
                            {avgPct}%
                          </span>
                        ) : (
                          <span style={{ color: "#64748b" }}>—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="badge text-xs"
                          style={{
                            background: isActive ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.06)",
                            color: isActive ? "#4ade80" : "#64748b",
                            border: isActive ? "1px solid rgba(74,222,128,0.25)" : "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          {isActive ? "Active" : "New"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Chapter engagement heatmap-style list */}
          <div className="mt-8">
            <h4
              className="text-sm font-bold mb-4"
              style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}
            >
              Chapter Engagement
            </h4>
            <div className="space-y-3">
              {chapters.map((chapter) => {
                const completions = students.filter(
                  (s) => s.progress?.completed_chapters.includes(chapter.id)
                ).length;
                const rate = totalStudents > 0 ? (completions / totalStudents) * 100 : 0;

                return (
                  <div key={chapter.id} className="flex items-center gap-3">
                    <span className="text-xs w-36 truncate flex-shrink-0" style={{ color: "#94a3b8" }}>
                      {chapter.title}
                    </span>
                    <div className="flex-1 progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${rate}%`,
                          background: rate > 60
                            ? "linear-gradient(90deg, #4ade80, #3b82f6)"
                            : rate > 30
                            ? "linear-gradient(90deg, #3b82f6, #f5c518)"
                            : "linear-gradient(90deg, #f87171, #f5c518)",
                        }}
                      />
                    </div>
                    <span className="text-xs w-16 text-right flex-shrink-0" style={{ color: "#64748b" }}>
                      {completions}/{totalStudents}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
