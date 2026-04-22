"use client";

import { useEffect, useState } from "react";

export default function FloatingIcons() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    function handle(e: MouseEvent) {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      setMouse({ x, y });
    }
    window.addEventListener("mousemove", handle, { passive: true });
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  function px(depth: number): React.CSSProperties {
    if (!mounted) return {};
    return {
      transform: `translate(${mouse.x * depth}px, ${mouse.y * depth}px)`,
      transition: "transform 0.18s ease-out",
    };
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* ── Atmospheric blobs ── */}
      <div style={{ position: "absolute", width: 800, height: 800, borderRadius: "50%", background: "#1d4ed8", top: -250, left: -180, filter: "blur(130px)", opacity: 0.16, animation: "blobFloat1 18s ease-in-out infinite" }} />
      <div style={{ position: "absolute", width: 650, height: 650, borderRadius: "50%", background: "#2563eb", top: "20%", right: -160, filter: "blur(120px)", opacity: 0.12, animation: "blobFloat2 22s ease-in-out infinite" }} />
      <div style={{ position: "absolute", width: 550, height: 550, borderRadius: "50%", background: "#f5c518", bottom: "0%", left: "15%", filter: "blur(110px)", opacity: 0.09, animation: "blobFloat3 28s ease-in-out infinite" }} />
      <div style={{ position: "absolute", width: 480, height: 480, borderRadius: "50%", background: "#3b82f6", top: "55%", left: "45%", filter: "blur(120px)", opacity: 0.07, animation: "blobFloat1 34s ease-in-out infinite reverse" }} />

      {/* ── PENCIL — top-right, depth 30 ── */}
      <div className="floating-icon-wrapper" style={{ position: "absolute", top: "10%", right: "7%", ...px(30) }}>
        <svg
          className="float-icon-1"
          style={{
            width: 120,
            height: 120,
            opacity: 0.50,
            filter: "drop-shadow(0 0 32px #f5c518) drop-shadow(0 0 14px #f5c518aa)",
            color: "#f5c518",
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      </div>

      {/* ── OPEN BOOK — top-left, depth 20 ── */}
      <div className="floating-icon-wrapper" style={{ position: "absolute", top: "7%", left: "4%", ...px(20) }}>
        <svg
          className="float-icon-3"
          style={{
            width: 105,
            height: 105,
            opacity: 0.44,
            filter: "drop-shadow(0 0 28px #3b82f6) drop-shadow(0 0 12px #3b82f688)",
            color: "#3b82f6",
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      </div>

      {/* ── SPARKLE STAR — mid-right, depth 45 ── */}
      <div className="floating-icon-wrapper" style={{ position: "absolute", top: "38%", right: "4%", ...px(45) }}>
        <svg
          className="float-icon-4"
          style={{
            width: 90,
            height: 90,
            opacity: 0.55,
            filter: "drop-shadow(0 0 26px #f5c518) drop-shadow(0 0 10px #f5c518aa)",
            color: "#f5c518",
          }}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036a2.25 2.25 0 001.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258a2.25 2.25 0 00-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.25 2.25 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.25 2.25 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5z" clipRule="evenodd" />
        </svg>
      </div>

      {/* ── GRADUATION CAP — bottom-left, depth 25 ── */}
      <div className="floating-icon-wrapper" style={{ position: "absolute", bottom: "18%", left: "3%", ...px(25) }}>
        <svg
          className="float-icon-2"
          style={{
            width: 108,
            height: 108,
            opacity: 0.46,
            filter: "drop-shadow(0 0 28px #4ade80) drop-shadow(0 0 12px #4ade8088)",
            color: "#4ade80",
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
        >
          <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
      </div>

      {/* ── CPU CHIP — bottom-right, depth 35 ── */}
      <div className="floating-icon-wrapper" style={{ position: "absolute", bottom: "12%", right: "9%", ...px(35) }}>
        <svg
          className="float-icon-1"
          style={{
            width: 96,
            height: 96,
            opacity: 0.44,
            filter: "drop-shadow(0 0 26px #3b82f6) drop-shadow(0 0 10px #3b82f6aa)",
            color: "#3b82f6",
            animationDelay: "-7s",
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
        >
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="8" y="8" width="8" height="8" rx="1" />
          <path d="M9 2v2M12 2v2M15 2v2M9 20v2M12 20v2M15 20v2M2 9h2M2 12h2M2 15h2M20 9h2M20 12h2M20 15h2" />
        </svg>
      </div>

      {/* ── LIGHTNING BOLT — mid-left, depth 18 ── */}
      <div className="floating-icon-wrapper" style={{ position: "absolute", top: "58%", left: "6%", ...px(18) }}>
        <svg
          className="float-icon-3"
          style={{
            width: 78,
            height: 78,
            opacity: 0.50,
            filter: "drop-shadow(0 0 22px #f5c518) drop-shadow(0 0 9px #f5c518bb)",
            color: "#f5c518",
            animationDelay: "-11s",
          }}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.818a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.845-.143z" clipRule="evenodd" />
        </svg>
      </div>

      {/* ── SMALL SPARKLE — top-center, depth 55 ── */}
      <div className="floating-icon-wrapper" style={{ position: "absolute", top: "4%", left: "42%", ...px(55) }}>
        <svg
          className="float-icon-4"
          style={{
            width: 54,
            height: 54,
            opacity: 0.60,
            filter: "drop-shadow(0 0 18px #d1d5db) drop-shadow(0 0 7px #d1d5db)",
            color: "#d1d5db",
            animationDelay: "-3s",
          }}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" clipRule="evenodd" />
        </svg>
      </div>

      {/* ── FINGERPRINT / CODE — upper-mid-right, depth 22 ── */}
      <div className="floating-icon-wrapper" style={{ position: "absolute", top: "22%", right: "18%", ...px(22) }}>
        <svg
          className="float-icon-2"
          style={{
            width: 68,
            height: 68,
            opacity: 0.38,
            filter: "drop-shadow(0 0 20px #3b82f6) drop-shadow(0 0 8px #3b82f688)",
            color: "#3b82f6",
            animationDelay: "-15s",
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      </div>

      {/* ── ATOM — lower-mid-center, depth 40 ── */}
      <div className="floating-icon-wrapper" style={{ position: "absolute", bottom: "38%", right: "22%", ...px(40) }}>
        <svg
          className="float-icon-1"
          style={{
            width: 72,
            height: 72,
            opacity: 0.36,
            filter: "drop-shadow(0 0 20px #3b82f6) drop-shadow(0 0 8px #3b82f688)",
            color: "#3b82f6",
            animationDelay: "-9s",
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <circle cx="12" cy="12" r="2" />
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" strokeDasharray="4 2" />
          <ellipse cx="12" cy="12" rx="10" ry="4" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
        </svg>
      </div>
    </div>
  );
}
