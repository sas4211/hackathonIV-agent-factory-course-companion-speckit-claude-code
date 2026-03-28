"use client";

interface UpgradePromptProps {
  title?: string;
  message?: string;
  onClose?: () => void;
  inline?: boolean;
}

export default function UpgradePrompt({
  title = "Premium Content",
  message = "Upgrade to a Pro plan to access all chapters, quizzes, and AI-powered learning features.",
  onClose,
  inline = false,
}: UpgradePromptProps) {
  const card = (
    <div
      className="flex flex-col items-center text-center gap-5 p-8"
      style={{
        background: inline ? "rgba(255,255,255,0.03)" : "transparent",
        border: inline ? "1px solid rgba(245,197,24,0.2)" : "none",
        borderRadius: inline ? 20 : 0,
      }}
    >
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, rgba(245,197,24,0.2), rgba(37,99,235,0.2))",
          border: "1px solid rgba(245,197,24,0.3)",
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f5c518"
          strokeWidth="2"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      </div>

      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}
        >
          {title}
        </h3>
        <p className="text-sm" style={{ color: "#94a3b8" }}>
          {message}
        </p>
      </div>

      {/* Plan comparison bullets */}
      <div className="w-full max-w-xs text-left space-y-2">
        {[
          "All course chapters",
          "Chapter quizzes & certificates",
          "AI-powered adaptive learning path",
          "LLM-graded assessments",
          "Priority support",
        ].map((feature) => (
          <div key={feature} className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4ade80"
              strokeWidth="2.5"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span className="text-sm" style={{ color: "#cbd5e1" }}>
              {feature}
            </span>
          </div>
        ))}
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          className="btn-yellow flex-1 justify-center text-sm"
          style={{ padding: "12px 20px" }}
          onClick={() => alert("Upgrade flow — connect to your billing provider")}
        >
          Upgrade to Pro
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
        </button>
        {onClose && (
          <button
            className="btn-outline flex-1 justify-center text-sm"
            style={{ padding: "11px 20px" }}
            onClick={onClose}
          >
            Maybe later
          </button>
        )}
      </div>

      <p className="text-xs" style={{ color: "#475569" }}>
        Free plan includes the first 3 chapters. No credit card required to start.
      </p>
    </div>
  );

  return card;
}
