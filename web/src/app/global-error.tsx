"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#080C14", color: "#e2e8f0", fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0, textAlign: "center", padding: "24px" }}>
        <div>
          <p style={{ fontSize: "18px", fontWeight: 700, color: "#f87171", marginBottom: "8px" }}>
            Something went wrong
          </p>
          <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px" }}>
            {error.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={reset}
            style={{ padding: "10px 24px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", color: "#e2e8f0", cursor: "pointer", fontSize: "14px" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
