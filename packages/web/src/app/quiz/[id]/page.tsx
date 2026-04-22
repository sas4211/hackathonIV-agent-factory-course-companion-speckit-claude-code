"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDemoUser } from "@/lib/useAppUser";
import { getQuiz, submitQuiz, updateProgress } from "@/lib/api";
import type { QuizQuestion as QuizQuestionType, QuizResult } from "@/lib/types";
import QuizQuestion from "@/components/QuizQuestion";

type QuizState = "loading" | "idle" | "in-progress" | "reviewing" | "results" | "error";

export default function QuizPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  // Support both /quiz/[id] and /quiz?chapter=id
  const chapterId = (params.id as string) || searchParams.get("chapter") || "";
  const { user } = useDemoUser();

  const [quizState, setQuizState] = useState<QuizState>("loading");
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    if (!chapterId) {
      setError("No chapter ID provided.");
      setQuizState("error");
      return;
    }
    async function load() {
      try {
        const qs = await getQuiz(chapterId);
        setQuestions(qs);
        setQuizState("idle");
      } catch (err) {
        console.error(err);
        setError("Could not load quiz. Make sure the API is running and this chapter has a quiz.");
        setQuizState("error");
      }
    }
    load();
  }, [chapterId]);

  function handleStartQuiz() {
    setCurrentIndex(0);
    setAnswers({});
    setResult(null);
    setQuizState("in-progress");
  }

  function handleSelectAnswer(questionId: string, index: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: index }));
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitQuiz(chapterId, answers);
      setResult(res);

      // Save progress
      await updateProgress(user.id, {
        quiz_id: chapterId,
        quiz_score: res.score,
        quiz_total: res.total,
      });

      setQuizState("results");
    } catch (err) {
      console.error(err);
      setError("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReview() {
    setCurrentIndex(0);
    setQuizState("reviewing");
  }

  function handleRetake() {
    setAnswers({});
    setResult(null);
    setCurrentIndex(0);
    setQuizState("in-progress");
  }

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  const currentQuestion = questions[currentIndex];

  if (quizState === "loading") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="skeleton h-8 w-48 rounded mb-4" />
        <div className="skeleton h-64 rounded-2xl mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (quizState === "error") {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}>
          Quiz Unavailable
        </h2>
        <p className="text-sm mb-6" style={{ color: "#64748b" }}>{error}</p>
        <Link href="/chapters" className="btn-outline">← Back to Chapters</Link>
      </div>
    );
  }

  if (quizState === "idle") {
    return (
      <div className="max-w-2xl mx-auto animate-fadeIn">
        <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: "#64748b" }}>
          <Link href="/chapters" style={{ color: "#64748b", textDecoration: "none" }} className="hover:text-white">
            Chapters
          </Link>
          <span>/</span>
          <Link href={`/chapters/${chapterId}`} style={{ color: "#64748b", textDecoration: "none" }} className="hover:text-white">
            {chapterId}
          </Link>
          <span>/</span>
          <span style={{ color: "#e2e8f0" }}>Quiz</span>
        </nav>

        <div
          className="p-8 rounded-2xl text-center flex flex-col items-center gap-6"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(245,197,24,0.1))",
              border: "1px solid rgba(37,99,235,0.3)",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f5c518" strokeWidth="1.5">
              <path d="M9 9a3 3 0 115.12-2.12M9 15h.01M12 19c-4 0-7-3.13-7-7 0-3.87 3.13-7 7-7s7 3.13 7 7c0 3.87-3.13 7-7 7z" />
            </svg>
          </div>

          <div>
            <p className="section-tag mb-3">Chapter Quiz</p>
            <h1
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}
            >
              {chapterId} Quiz
            </h1>
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              {questions.length} questions · 70% to pass · Results shown after submission
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
            {[
              { label: "Questions", value: questions.length },
              { label: "Pass Score", value: "70%" },
              { label: "Format", value: "MCQ" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-3 rounded-xl text-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p
                  className="text-lg font-bold"
                  style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}
                >
                  {stat.value}
                </p>
                <p className="text-xs" style={{ color: "#64748b" }}>{stat.label}</p>
              </div>
            ))}
          </div>

          <button className="btn-primary" style={{ padding: "12px 32px" }} onClick={handleStartQuiz}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="5,3 19,12 5,21" fill="currentColor" />
            </svg>
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (quizState === "results" && result) {
    const pct = Math.round((result.score / result.total) * 100);
    return (
      <div className="max-w-2xl mx-auto animate-fadeIn">
        {/* Result header */}
        <div
          className="p-8 rounded-2xl text-center mb-6"
          style={{
            background: result.passed
              ? "linear-gradient(135deg, rgba(74,222,128,0.06), rgba(59,130,246,0.04))"
              : "linear-gradient(135deg, rgba(248,113,113,0.06), rgba(37,99,235,0.04))",
            border: result.passed
              ? "1px solid rgba(74,222,128,0.2)"
              : "1px solid rgba(248,113,113,0.2)",
          }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              background: result.passed ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)",
              border: result.passed ? "2px solid rgba(74,222,128,0.4)" : "2px solid rgba(248,113,113,0.4)",
            }}
          >
            {result.passed ? (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            )}
          </div>

          <h2
            className="text-3xl font-bold mb-1"
            style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}
          >
            {result.passed ? "Quiz Passed!" : "Not Quite Yet"}
          </h2>
          <p className="text-sm mb-5" style={{ color: "#94a3b8" }}>
            {result.passed
              ? "Great work! You've demonstrated solid understanding."
              : "You need 70% to pass. Review the feedback and try again."}
          </p>

          <div className="flex items-center justify-center gap-8">
            <div>
              <div
                className="text-5xl font-bold"
                style={{ fontFamily: "Syne, sans-serif", color: result.passed ? "#4ade80" : "#f87171" }}
              >
                {pct}%
              </div>
              <div className="text-sm" style={{ color: "#64748b" }}>Your Score</div>
            </div>
            <div className="text-3xl" style={{ color: "#64748b" }}>|</div>
            <div>
              <div className="text-5xl font-bold" style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}>
                {result.score}/{result.total}
              </div>
              <div className="text-sm" style={{ color: "#64748b" }}>Correct</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <button className="btn-outline" onClick={handleReview}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            Review Answers
          </button>
          <button className="btn-primary" onClick={handleRetake}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retake Quiz
          </button>
          <Link href={`/chapters/${chapterId}`} className="btn-outline">
            Back to Chapter
          </Link>
          <Link href="/progress" className="btn-outline">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            View Progress
          </Link>
        </div>

        {/* Feedback summary */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {questions.map((q, i) => {
            const fb = result.feedback[q.id];
            if (!fb) return null;
            return (
              <div
                key={q.id}
                className="p-4 flex items-start gap-3"
                style={{
                  borderBottom: i < questions.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  background: fb.correct ? "rgba(74,222,128,0.03)" : "rgba(248,113,113,0.03)",
                }}
              >
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{
                    background: fb.correct ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)",
                  }}
                >
                  {fb.correct ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="3">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-1" style={{ color: "#e2e8f0" }}>
                    {i + 1}. {q.question}
                  </p>
                  <p className="text-xs" style={{ color: "#64748b" }}>
                    {fb.explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if ((quizState === "in-progress" || quizState === "reviewing") && currentQuestion) {
    const isReview = quizState === "reviewing";
    return (
      <div className="max-w-2xl mx-auto animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            className="text-sm flex items-center gap-1.5"
            style={{ color: "#64748b", background: "none", border: "none", cursor: "pointer" }}
            onClick={() => setQuizState(result ? "results" : "idle")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {isReview ? "Back to Results" : "Exit Quiz"}
          </button>
          {!isReview && (
            <span className="text-sm" style={{ color: "#64748b" }}>
              {answeredCount}/{questions.length} answered
            </span>
          )}
        </div>

        <div
          className="p-6 rounded-2xl mb-6"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <QuizQuestion
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            selectedAnswer={answers[currentQuestion.id] ?? null}
            onSelect={(idx) => handleSelectAnswer(currentQuestion.id, idx)}
            feedback={isReview ? result?.feedback[currentQuestion.id] : undefined}
            submitted={isReview}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            className="btn-outline text-sm"
            style={{ padding: "9px 18px", opacity: currentIndex === 0 ? 0.4 : 1 }}
            disabled={currentIndex === 0}
            onClick={handlePrev}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="flex gap-1.5">
            {questions.map((q, i) => {
              const answered = answers[q.id] !== undefined;
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={q.id}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    background: isCurrent
                      ? "#2563eb"
                      : answered
                      ? "#3b82f6"
                      : "rgba(255,255,255,0.15)",
                    transform: isCurrent ? "scale(1.4)" : "scale(1)",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  onClick={() => setCurrentIndex(i)}
                />
              );
            })}
          </div>

          {currentIndex < questions.length - 1 ? (
            <button className="btn-primary text-sm" style={{ padding: "9px 18px" }} onClick={handleNext}>
              Next
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          ) : !isReview ? (
            <button
              className="btn-yellow text-sm"
              style={{ padding: "9px 18px", opacity: !allAnswered || submitting ? 0.6 : 1 }}
              disabled={!allAnswered || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <span className="flex items-center gap-1.5">
                  <span style={{ display: "inline-block", width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000", animation: "spin 0.8s linear infinite" }} />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  Submit Quiz
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </button>
          ) : (
            <button className="btn-outline text-sm" style={{ padding: "9px 18px", opacity: 0.4 }} disabled>
              End
            </button>
          )}
        </div>

        {error && (
          <p className="mt-4 text-sm text-center" style={{ color: "#f87171" }}>{error}</p>
        )}

        {!isReview && !allAnswered && currentIndex === questions.length - 1 && (
          <p className="mt-3 text-xs text-center" style={{ color: "#64748b" }}>
            Answer all {questions.length} questions to submit
          </p>
        )}
      </div>
    );
  }

  return null;
}
