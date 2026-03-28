"use client";

import { useState } from "react";
import type { LearningPathResponse, AssessmentResponse, Recommendation } from "@/lib/types";
import { getAdaptiveLearningPath, submitAssessment } from "@/lib/api";

interface Phase2PanelProps {
  userId: string;
  tier: string;
  availableChapters?: { id: string; title: string }[];
}

function PriorityBadge({ priority }: { priority: Recommendation["priority"] }) {
  const styles: Record<string, React.CSSProperties> = {
    urgent: { background: "rgba(248,113,113,0.15)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" },
    recommended: { background: "rgba(59,130,246,0.12)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)" },
    optional: { background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" },
  };
  return (
    <span
      className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
      style={styles[priority]}
    >
      {priority}
    </span>
  );
}

export default function Phase2Panel({ userId, tier, availableChapters = [] }: Phase2PanelProps) {
  const isPro = tier === "pro" || tier === "team";

  // Adaptive learning path state
  const [pathLoading, setPathLoading] = useState(false);
  const [pathData, setPathData] = useState<LearningPathResponse | null>(null);
  const [pathError, setPathError] = useState<string | null>(null);

  // Assessment state
  const [selectedChapter, setSelectedChapter] = useState<string>(
    availableChapters[0]?.id || ""
  );
  const [assessmentQuestion, setAssessmentQuestion] = useState("");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [assessLoading, setAssessLoading] = useState(false);
  const [assessData, setAssessData] = useState<AssessmentResponse | null>(null);
  const [assessError, setAssessError] = useState<string | null>(null);

  async function handleFetchPath() {
    setPathLoading(true);
    setPathError(null);
    setPathData(null);
    try {
      const data = await getAdaptiveLearningPath(userId, tier);
      setPathData(data);
    } catch (err) {
      setPathError("Failed to generate learning path. Ensure the backend is running and your API key is configured.");
      console.error(err);
    } finally {
      setPathLoading(false);
    }
  }

  async function handleSubmitAssessment() {
    if (!assessmentQuestion.trim() || !studentAnswer.trim()) {
      setAssessError("Please provide both a question and an answer.");
      return;
    }
    setAssessLoading(true);
    setAssessError(null);
    setAssessData(null);
    try {
      const data = await submitAssessment(
        selectedChapter,
        userId,
        tier,
        assessmentQuestion,
        studentAnswer
      );
      setAssessData(data);
    } catch (err) {
      setAssessError("Assessment failed. Ensure the backend is running and your AI API key is configured.");
      console.error(err);
    } finally {
      setAssessLoading(false);
    }
  }

  if (!isPro) {
    return (
      <div
        className="card-static p-6 flex flex-col items-center text-center gap-4"
        style={{
          background: "rgba(245,197,24,0.04)",
          border: "1px solid rgba(245,197,24,0.15)",
          borderRadius: 20,
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(245,197,24,0.12)", border: "1px solid rgba(245,197,24,0.25)" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f5c518" strokeWidth="2">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
          </svg>
        </div>
        <div>
          <h3 style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9", fontWeight: 700, marginBottom: 6 }}>
            AI Features — Pro Tier
          </h3>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            Upgrade to Pro to unlock AI-powered adaptive learning paths and LLM-graded assessments.
          </p>
        </div>
        <button
          className="btn-yellow text-sm"
          style={{ padding: "10px 20px" }}
          onClick={() => alert("Upgrade flow — connect to your billing provider")}
        >
          Upgrade to Pro
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(245,197,24,0.12)", border: "1px solid rgba(245,197,24,0.25)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5c518" strokeWidth="2">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
          </svg>
        </div>
        <div>
          <h3 style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9", fontWeight: 700 }}>
            AI-Powered Learning
          </h3>
          <p className="text-xs" style={{ color: "var(--muted)" }}>Phase 2 · Pro features</p>
        </div>
        <span className="badge badge-pro ml-auto">Pro</span>
      </div>

      {/* ── Adaptive Learning Path ── */}
      <div
        className="card-static p-5"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(59,130,246,0.15)",
          borderRadius: 16,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9", fontWeight: 600, fontSize: "0.95rem" }}>
              Adaptive Learning Path
            </h4>
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
              AI analyzes your progress and recommends what to study next
            </p>
          </div>
          <button
            className="btn-outline text-xs"
            style={{ padding: "8px 14px", whiteSpace: "nowrap" }}
            onClick={handleFetchPath}
            disabled={pathLoading}
          >
            {pathLoading ? (
              <span className="flex items-center gap-1.5">
                <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Generate Path
              </span>
            )}
          </button>
        </div>

        {pathError && (
          <div className="p-3 rounded-xl text-xs" style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}>
            {pathError}
          </div>
        )}

        {pathData && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* Summary */}
            <div
              className="p-4 rounded-xl"
              style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)" }}
            >
              <p className="text-sm" style={{ color: "#cbd5e1" }}>{pathData.summary}</p>
            </div>

            {/* Recommendations */}
            {pathData.recommendations.length > 0 && (
              <div className="flex flex-col gap-3">
                {pathData.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl flex flex-col gap-2"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
                        {rec.chapter_title}
                      </span>
                      <PriorityBadge priority={rec.priority} />
                    </div>
                    <p className="text-xs" style={{ color: "#64748b" }}>{rec.reason}</p>
                    <p className="text-xs font-medium" style={{ color: "#3b82f6" }}>{rec.action}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Next action + completion */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl" style={{ background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.15)" }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#4ade80" }}>Next Action</p>
                <p className="text-sm" style={{ color: "#cbd5e1" }}>{pathData.next_action}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "rgba(245,197,24,0.07)", border: "1px solid rgba(245,197,24,0.15)" }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#f5c518" }}>Est. Completion</p>
                <p className="text-sm" style={{ color: "#cbd5e1" }}>{pathData.estimated_completion}</p>
              </div>
            </div>

            {/* Token usage */}
            <p className="text-xs" style={{ color: "#475569" }}>
              Tokens used: {pathData.input_tokens} in / {pathData.output_tokens} out ·{" "}
              ${pathData.estimated_cost_usd.toFixed(4)} estimated cost
            </p>
          </div>
        )}
      </div>

      {/* ── LLM Assessment ── */}
      <div
        className="card-static p-5"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(245,197,24,0.15)",
          borderRadius: 16,
        }}
      >
        <div className="mb-4">
          <h4 style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9", fontWeight: 600, fontSize: "0.95rem" }}>
            AI Assessment
          </h4>
          <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
            Write a response and get AI-graded feedback with strengths, gaps, and hints
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* Chapter selector */}
          {availableChapters.length > 0 && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--muted)" }}>
                Chapter Context
              </label>
              <select
                className="input-glass text-sm"
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                style={{ appearance: "none" }}
              >
                {availableChapters.map((ch) => (
                  <option key={ch.id} value={ch.id} style={{ background: "#0f1623" }}>
                    {ch.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Question input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--muted)" }}>
              Question / Prompt
            </label>
            <input
              type="text"
              className="input-glass text-sm"
              placeholder="e.g. Explain the role of a tool-use loop in an AI agent"
              value={assessmentQuestion}
              onChange={(e) => setAssessmentQuestion(e.target.value)}
            />
          </div>

          {/* Answer textarea */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--muted)" }}>
              Your Answer
            </label>
            <textarea
              className="input-glass text-sm"
              style={{ minHeight: 100, resize: "vertical" }}
              placeholder="Write your answer here..."
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
            />
          </div>

          {assessError && (
            <p className="text-xs p-2 rounded-lg" style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
              {assessError}
            </p>
          )}

          <button
            className="btn-yellow text-sm self-start"
            style={{ padding: "10px 18px" }}
            onClick={handleSubmitAssessment}
            disabled={assessLoading}
          >
            {assessLoading ? (
              <span className="flex items-center gap-1.5">
                <span style={{ display: "inline-block", width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000", animation: "spin 0.8s linear infinite" }} />
                Grading...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Submit for Grading
              </span>
            )}
          </button>
        </div>

        {/* Assessment results */}
        {assessData && (
          <div className="mt-5 flex flex-col gap-4 animate-fadeIn">
            {/* Score + grade */}
            <div className="flex items-center gap-4 p-4 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-center">
                <div style={{ fontFamily: "Syne, sans-serif", fontSize: "2.5rem", fontWeight: 800, color: assessData.score >= 70 ? "#4ade80" : "#f87171", lineHeight: 1 }}>
                  {assessData.score}
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>/ 100</div>
              </div>
              <div className="flex-1">
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#f1f5f9", fontSize: "1.1rem" }}>
                  Grade: {assessData.grade}
                </div>
                <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>{assessData.feedback}</p>
              </div>
            </div>

            {/* Strengths & Gaps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assessData.strengths.length > 0 && (
                <div className="p-3 rounded-xl" style={{ background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.15)" }}>
                  <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#4ade80" }}>Strengths</p>
                  <ul className="space-y-1">
                    {assessData.strengths.map((s, i) => (
                      <li key={i} className="text-xs flex gap-1.5" style={{ color: "#cbd5e1" }}>
                        <span style={{ color: "#4ade80", flexShrink: 0 }}>✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {assessData.gaps.length > 0 && (
                <div className="p-3 rounded-xl" style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.15)" }}>
                  <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#f87171" }}>Areas to Improve</p>
                  <ul className="space-y-1">
                    {assessData.gaps.map((g, i) => (
                      <li key={i} className="text-xs flex gap-1.5" style={{ color: "#cbd5e1" }}>
                        <span style={{ color: "#f87171", flexShrink: 0 }}>→</span> {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Hint */}
            {assessData.hint && (
              <div className="p-3 rounded-xl" style={{ background: "rgba(245,197,24,0.07)", border: "1px solid rgba(245,197,24,0.15)" }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#f5c518" }}>Hint</p>
                <p className="text-sm" style={{ color: "#cbd5e1" }}>{assessData.hint}</p>
              </div>
            )}

            <p className="text-xs" style={{ color: "#475569" }}>
              Tokens: {assessData.input_tokens} in / {assessData.output_tokens} out ·{" "}
              ${assessData.estimated_cost_usd.toFixed(4)} estimated cost
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
