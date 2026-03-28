"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-lg font-bold mb-2" style={{ color: "#f87171" }}>
        Something went wrong
      </p>
      <p className="text-sm mb-6" style={{ color: "#64748b" }}>
        {error.message || "An unexpected error occurred."}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button className="btn-outline" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="btn-outline">
          ← Dashboard
        </Link>
        <Link href="/chapters" className="btn-outline">
          Browse Chapters
        </Link>
      </div>
    </div>
  );
}
