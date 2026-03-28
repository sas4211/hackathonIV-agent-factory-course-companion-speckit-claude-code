"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDemoUser } from "@/lib/useAppUser";
import { getChapter, getProgress, checkAccess } from "@/lib/api";
import type { Chapter, Lesson, UserProgress } from "@/lib/types";
import LessonViewer from "@/components/LessonViewer";
import UpgradePrompt from "@/components/UpgradePrompt";

export default function ChapterDetailPage() {
  const params = useParams();
  const chapterId = params.id as string;
  const { user } = useDemoUser();
  const isPremium = user.tier !== "free";

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chapterId) return;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [ch, prog, access] = await Promise.all([
          getChapter(chapterId),
          getProgress(user.id),
          checkAccess(user.id, chapterId, isPremium),
        ]);
        setChapter(ch);
        setProgress(prog);
        setHasAccess(access.has_access);
        if (access.has_access && ch.lessons.length > 0) {
          // Auto-select first incomplete lesson, or first lesson
          const firstIncomplete = ch.lessons.find(
            (l) => !prog.completed_lessons.includes(l.id)
          );
          setActiveLesson(firstIncomplete ?? ch.lessons[0]);
        }
      } catch (err) {
        console.error(err);
        setError("Could not load chapter. Make sure the API is running.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [chapterId, user.id, isPremium]);

  function handleLessonComplete(lessonId: string) {
    if (!progress) return;
    setProgress({
      ...progress,
      completed_lessons: [...progress.completed_lessons, lessonId],
    });
  }

  function handleProgressUpdate(updated: UserProgress) {
    setProgress(updated);
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="skeleton h-8 w-48 rounded mb-4" />
        <div className="skeleton h-6 w-96 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="skeleton h-96 rounded-2xl" />
          <div className="md:col-span-3 skeleton h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-lg font-bold mb-2" style={{ color: "#f87171" }}>Error loading chapter</p>
        <p className="text-sm mb-6" style={{ color: "#64748b" }}>{error}</p>
        <Link href="/chapters" className="btn-outline">← Back to Chapters</Link>
      </div>
    );
  }

  if (!hasAccess || !chapter) {
    return (
      <div className="max-w-lg mx-auto py-12">
        <Link href="/chapters" className="text-sm flex items-center gap-1.5 mb-8" style={{ color: "#64748b" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back to Chapters
        </Link>
        <UpgradePrompt
          title="Premium Chapter"
          message="This chapter is part of the premium curriculum. Upgrade to access all chapters and features."
          inline
        />
      </div>
    );
  }

  const completedLessons = progress?.completed_lessons ?? [];
  const chapterCompleted = progress?.completed_chapters.includes(chapter.id);

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: "#64748b" }}>
        <Link href="/chapters" style={{ color: "#64748b", textDecoration: "none" }}
          className="hover:text-white transition-colors">
          Chapters
        </Link>
        <span>/</span>
        <span style={{ color: "#e2e8f0" }}>{chapter.title}</span>
      </nav>

      {/* Chapter header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="section-tag">Chapter {chapter.order}</span>
          {chapter.is_free ? (
            <span className="badge badge-free">Free</span>
          ) : (
            <span className="badge badge-premium">Premium</span>
          )}
          {chapterCompleted && (
            <span className="badge badge-free flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Completed
            </span>
          )}
        </div>
        <h1
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}
        >
          {chapter.title}
        </h1>
        {chapter.summary && (
          <p className="text-sm" style={{ color: "#94a3b8" }}>{chapter.summary}</p>
        )}
      </div>

      {/* Main layout: lesson list + viewer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Lesson sidebar */}
        <div
          className="md:col-span-1 md:sticky md:top-20"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20,
            padding: "16px 0",
            height: "fit-content",
          }}
        >
          <p
            className="px-4 pb-3 text-xs font-bold uppercase tracking-widest"
            style={{
              color: "#374151",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              marginBottom: 4,
            }}
          >
            {chapter.lesson_count} Lessons
          </p>
          {chapter.lessons.map((lesson) => {
            const done = completedLessons.includes(lesson.id);
            const active = activeLesson?.id === lesson.id;
            return (
              <button
                key={lesson.id}
                className="w-full text-left px-4 py-3 flex items-center gap-3 transition-all"
                style={{
                  background: active ? "rgba(37,99,235,0.1)" : "transparent",
                  borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                  cursor: "pointer",
                  border: "none",
                  borderLeftWidth: 3,
                  borderLeftStyle: "solid",
                  borderLeftColor: active ? "#2563eb" : "transparent",
                }}
                onClick={() => setActiveLesson(lesson)}
              >
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{
                    background: done
                      ? "rgba(74,222,128,0.2)"
                      : active
                      ? "rgba(37,99,235,0.2)"
                      : "rgba(255,255,255,0.06)",
                    border: done
                      ? "1px solid rgba(74,222,128,0.4)"
                      : active
                      ? "1px solid rgba(37,99,235,0.4)"
                      : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {done ? (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <span
                      className="text-xs"
                      style={{ color: active ? "#f87171" : "#64748b", fontSize: "0.6rem", fontWeight: 700 }}
                    >
                      {lesson.order}
                    </span>
                  )}
                </div>
                <span
                  className="text-xs leading-snug"
                  style={{
                    color: active ? "#e2e8f0" : done ? "#94a3b8" : "#9ca3af",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {lesson.title}
                </span>
              </button>
            );
          })}

          {/* Navigation links */}
          <div
            className="px-4 pt-4 mt-2 flex flex-col gap-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            {chapter.prev_chapter_id && (
              <Link
                href={`/chapters/${chapter.prev_chapter_id}`}
                className="text-xs flex items-center gap-1.5 transition-colors hover:text-white"
                style={{ color: "#64748b", textDecoration: "none" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Prev Chapter
              </Link>
            )}
            {chapter.next_chapter_id && (
              <Link
                href={`/chapters/${chapter.next_chapter_id}`}
                className="text-xs flex items-center gap-1.5 transition-colors hover:text-white"
                style={{ color: "#64748b", textDecoration: "none" }}
              >
                Next Chapter
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            )}
            <Link
              href={`/quiz/${chapter.id}`}
              className="text-xs flex items-center gap-1.5 mt-1 font-semibold transition-colors"
              style={{ color: "#3b82f6", textDecoration: "none" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 9a3 3 0 115.12-2.12M9 15h.01M12 19c-4 0-7-3.13-7-7 0-3.87 3.13-7 7-7s7 3.13 7 7c0 3.87-3.13 7-7 7z" />
              </svg>
              Take Chapter Quiz
            </Link>
          </div>
        </div>

        {/* Lesson content */}
        <div
          className="md:col-span-3 p-4 sm:p-6 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            minHeight: 400,
          }}
        >
          {activeLesson ? (
            <LessonViewer
              lesson={activeLesson}
              chapter={chapter}
              userId={user.id}
              isCompleted={completedLessons.includes(activeLesson.id)}
              onComplete={handleLessonComplete}
            />
          ) : (
            <div className="flex items-center justify-center h-48">
              <p style={{ color: "#64748b" }}>Select a lesson to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
