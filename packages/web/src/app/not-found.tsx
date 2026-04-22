import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p
        className="text-6xl font-bold mb-4"
        style={{ fontFamily: "Syne, sans-serif", color: "rgba(255,255,255,0.08)" }}
      >
        404
      </p>
      <p className="text-lg font-bold mb-2" style={{ color: "#f1f5f9" }}>
        Page not found
      </p>
      <p className="text-sm mb-6" style={{ color: "#64748b" }}>
        The page you're looking for doesn't exist.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/" className="btn-outline">
          ← Back to Dashboard
        </Link>
        <Link href="/chapters" className="btn-outline">
          Browse Chapters
        </Link>
      </div>
    </div>
  );
}
