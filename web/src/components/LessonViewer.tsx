"use client";

import { useState } from "react";
import type { Lesson, Chapter } from "@/lib/types";
import { updateProgress } from "@/lib/api";
import Link from "next/link";

interface LessonViewerProps {
  lesson: Lesson;
  chapter: Chapter;
  userId: string;
  isCompleted: boolean;
  onComplete: (lessonId: string) => void;
}

export default function LessonViewer({
  lesson,
  chapter,
  userId,
  isCompleted,
  onComplete,
}: LessonViewerProps) {
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMarkComplete() {
    if (isCompleted || completing) return;
    setCompleting(true);
    setError(null);
    try {
      await updateProgress(userId, {
        lesson_id: lesson.id,
        chapter_id: chapter.id,
      });
      onComplete(lesson.id);
    } catch (err) {
      setError("Failed to save progress. Please try again.");
      console.error(err);
    } finally {
      setCompleting(false);
    }
  }

  // Simple markdown-like renderer for lesson body
  function renderBody(body: string) {
    if (!body) return null;

    // Split by double newlines for paragraphs
    const lines = body.split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;
    let key = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith("### ")) {
        elements.push(
          <h3
            key={key++}
            style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9", fontSize: "1.1rem", fontWeight: 700, marginTop: "1.5em", marginBottom: "0.5em" }}
          >
            {line.slice(4)}
          </h3>
        );
        i++;
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2
            key={key++}
            style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9", fontSize: "1.3rem", fontWeight: 700, marginTop: "1.5em", marginBottom: "0.5em" }}
          >
            {line.slice(3)}
          </h2>
        );
        i++;
      } else if (line.startsWith("# ")) {
        elements.push(
          <h1
            key={key++}
            style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9", fontSize: "1.6rem", fontWeight: 800, marginTop: "1.5em", marginBottom: "0.6em" }}
          >
            {line.slice(2)}
          </h1>
        );
        i++;
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        const items: string[] = [];
        while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
          items.push(lines[i].slice(2));
          i++;
        }
        elements.push(
          <ul
            key={key++}
            style={{ paddingLeft: "1.5em", marginBottom: "1em", color: "#cbd5e1" }}
          >
            {items.map((item, j) => (
              <li key={j} style={{ marginBottom: "0.4em", lineHeight: 1.7 }}>
                {inlineFormat(item)}
              </li>
            ))}
          </ul>
        );
      } else if (/^\d+\. /.test(line)) {
        const items: string[] = [];
        while (i < lines.length && /^\d+\. /.test(lines[i])) {
          items.push(lines[i].replace(/^\d+\. /, ""));
          i++;
        }
        elements.push(
          <ol
            key={key++}
            style={{ paddingLeft: "1.5em", marginBottom: "1em", color: "#cbd5e1", listStyleType: "decimal" }}
          >
            {items.map((item, j) => (
              <li key={j} style={{ marginBottom: "0.4em", lineHeight: 1.7 }}>
                {inlineFormat(item)}
              </li>
            ))}
          </ol>
        );
      } else if (line.startsWith("```")) {
        const langLine = line.slice(3);
        i++;
        const codeLines: string[] = [];
        while (i < lines.length && !lines[i].startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```
        elements.push(
          <pre
            key={key++}
            style={{
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: 16,
              overflowX: "auto",
              marginBottom: "1em",
            }}
          >
            <code style={{ color: "#e2e8f0", fontSize: "0.88em", fontFamily: "Fira Code, Courier New, monospace" }}>
              {codeLines.join("\n")}
            </code>
          </pre>
        );
      } else if (line.startsWith("> ")) {
        elements.push(
          <blockquote
            key={key++}
            style={{
              borderLeft: "3px solid #3b82f6",
              paddingLeft: 16,
              color: "#94a3b8",
              margin: "1em 0",
              fontStyle: "italic",
            }}
          >
            {line.slice(2)}
          </blockquote>
        );
        i++;
      } else if (line.trim() === "") {
        i++;
      } else {
        elements.push(
          <p key={key++} style={{ marginBottom: "1em", lineHeight: 1.75, color: "#cbd5e1" }}>
            {inlineFormat(line)}
          </p>
        );
        i++;
      }
    }

    return elements;
  }

  function inlineFormat(text: string): React.ReactNode {
    // Handle bold, italic, code inline
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            style={{
              background: "rgba(255,255,255,0.08)",
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: "0.88em",
              color: "#3b82f6",
              fontFamily: "Fira Code, Courier New, monospace",
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} style={{ color: "#f1f5f9", fontWeight: 600 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  }

  return (
    <div className="animate-fadeIn">
      {/* Lesson header */}
      <div className="mb-8 pb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--muted)" }}
          >
            Lesson {lesson.order}
          </span>
          {isCompleted && (
            <span className="badge badge-free flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Completed
            </span>
          )}
        </div>
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}
        >
          {lesson.title}
        </h2>
      </div>

      {/* Lesson body */}
      <div className="lesson-body mb-10">
        {renderBody(lesson.body)}
      </div>

      {/* Action bar */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-6"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        {error && (
          <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
        )}

        {!isCompleted ? (
          <button
            className="btn-primary"
            onClick={handleMarkComplete}
            disabled={completing}
            style={{ opacity: completing ? 0.7 : 1 }}
          >
            {completing ? (
              <>
                <span
                  className="inline-block w-4 h-4 rounded-full"
                  style={{ border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }}
                />
                Saving...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Mark as Complete
              </>
            )}
          </button>
        ) : (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: "rgba(74,222,128,0.1)",
              border: "1px solid rgba(74,222,128,0.25)",
              color: "#4ade80",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Lesson Complete
          </div>
        )}

        {/* Quiz link */}
        <Link
          href={`/quiz/${chapter.id}`}
          className="btn-outline text-sm"
          style={{ padding: "9px 18px" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 9a3 3 0 015.12-2.12M9 15h.01M12 19c-4 0-7-3.13-7-7 0-3.87 3.13-7 7-7s7 3.13 7 7c0 3.87-3.13 7-7 7z" />
          </svg>
          Take Quiz
        </Link>
      </div>
    </div>
  );
}
