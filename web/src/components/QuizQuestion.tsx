"use client";

import type { QuizQuestion as QuizQuestionType, QuizFeedbackEntry } from "@/lib/types";

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onSelect: (index: number) => void;
  feedback?: QuizFeedbackEntry;
  submitted: boolean;
}

export default function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelect,
  feedback,
  submitted,
}: QuizQuestionProps) {
  function getOptionStyle(index: number): React.CSSProperties {
    const base: React.CSSProperties = {
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12,
      padding: "14px 18px",
      cursor: submitted ? "default" : "pointer",
      transition: "all 0.15s ease",
      textAlign: "left",
      width: "100%",
      color: "#e2e8f0",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.92rem",
      display: "flex",
      alignItems: "center",
      gap: 12,
    };

    if (!submitted) {
      if (selectedAnswer === index) {
        return {
          ...base,
          background: "rgba(59,130,246,0.12)",
          border: "1px solid rgba(59,130,246,0.4)",
          color: "#3b82f6",
        };
      }
      return base;
    }

    // After submission
    if (!feedback) return base;

    if (index === feedback.correct_index) {
      return {
        ...base,
        background: "rgba(74,222,128,0.12)",
        border: "1px solid rgba(74,222,128,0.4)",
        color: "#4ade80",
        cursor: "default",
      };
    }

    if (index === feedback.chosen_index && !feedback.correct) {
      return {
        ...base,
        background: "rgba(248,113,113,0.12)",
        border: "1px solid rgba(248,113,113,0.4)",
        color: "#f87171",
        cursor: "default",
      };
    }

    return { ...base, opacity: 0.5, cursor: "default" };
  }

  function getOptionIcon(index: number) {
    if (!submitted || !feedback) {
      if (selectedAnswer === index) {
        return (
          <span
            className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
            style={{ background: "#3b82f6", minWidth: 20 }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <circle cx="12" cy="12" r="4" fill="white" />
            </svg>
          </span>
        );
      }
      return (
        <span
          className="w-5 h-5 rounded-full flex-shrink-0"
          style={{ border: "2px solid rgba(255,255,255,0.2)", minWidth: 20 }}
        />
      );
    }

    if (index === feedback.correct_index) {
      return (
        <span
          className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
          style={{ background: "#4ade80", minWidth: 20 }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
      );
    }

    if (index === feedback.chosen_index && !feedback.correct) {
      return (
        <span
          className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
          style={{ background: "#f87171", minWidth: 20 }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </span>
      );
    }

    return (
      <span
        className="w-5 h-5 rounded-full flex-shrink-0"
        style={{ border: "2px solid rgba(255,255,255,0.1)", minWidth: 20 }}
      />
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Question header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="px-3 py-1 rounded-lg text-sm font-bold"
          style={{
            background: "rgba(59,130,246,0.1)",
            border: "1px solid rgba(59,130,246,0.25)",
            color: "#3b82f6",
            fontFamily: "Syne, sans-serif",
          }}
        >
          {questionNumber} / {totalQuestions}
        </div>
        <div className="flex-1 progress-track">
          <div
            className="progress-fill"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question text */}
      <h3
        className="text-lg font-bold mb-6 leading-relaxed"
        style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}
      >
        {question.question}
      </h3>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            style={getOptionStyle(index)}
            onClick={() => !submitted && onSelect(index)}
          >
            {getOptionIcon(index)}
            <span>{option}</span>
          </button>
        ))}
      </div>

      {/* Explanation (shown after submission) */}
      {submitted && feedback?.explanation && (
        <div
          className="mt-5 p-4 rounded-xl"
          style={{
            background: feedback.correct
              ? "rgba(74,222,128,0.07)"
              : "rgba(248,113,113,0.07)",
            border: feedback.correct
              ? "1px solid rgba(74,222,128,0.2)"
              : "1px solid rgba(248,113,113,0.2)",
          }}
        >
          <p className="text-xs font-bold uppercase tracking-wider mb-2"
            style={{ color: feedback.correct ? "#4ade80" : "#f87171" }}>
            {feedback.correct ? "Correct!" : "Incorrect"}
          </p>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            {feedback.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
