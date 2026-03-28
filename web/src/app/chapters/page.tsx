"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemoUser } from "@/lib/useAppUser";
import { listChapters, getProgress, searchContent } from "@/lib/api";
import type { ChapterSummary, UserProgress, SearchResult } from "@/lib/types";
import ChapterCard from "@/components/ChapterCard";
import UpgradePrompt from "@/components/UpgradePrompt";

const FREE_LIMIT = 3;

export default function ChaptersPage() {
  const { user } = useDemoUser();
  const router = useRouter();
  const isPremium = user.tier !== "free";

  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [chs, prog] = await Promise.all([
          listChapters(),
          getProgress(user.id),
        ]);
        setChapters(chs);
        setProgress(prog);
      } catch (err) {
        console.error(err);
        setError("Could not load chapters. Make sure the backend server is running (cd backend && uvicorn main:app --port 8000).");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.id]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchContent(searchQuery);
        setSearchResults(results.slice(0, 8));
        setShowSearchResults(true);
      } catch {
        // silently fail search
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  function isChapterLocked(chapter: ChapterSummary) {
    return !isPremium && !chapter.is_free && chapter.order > FREE_LIMIT;
  }

  const freeChapters = chapters.filter((c) => !isChapterLocked(c));
  const lockedChapters = chapters.filter((c) => isChapterLocked(c));

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs mb-5" style={{ color: "#64748b" }}>
        <Link href="/" style={{ color: "#64748b", textDecoration: "none" }} className="hover:text-white">
          Dashboard
        </Link>
        <span>/</span>
        <span style={{ color: "#e2e8f0" }}>Chapters</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <p className="section-tag mb-3">Content Library</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}
            >
              Course Chapters
            </h1>
            <p className="text-sm" style={{ color: "#64748b" }}>
              {loading
                ? "Loading..."
                : `${chapters.length} chapters · ${freeChapters.length} accessible`}
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <div className="relative">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#64748b"
                strokeWidth="2"
                className="absolute left-3 top-1/2 -translate-y-1/2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                className="input-glass pl-9 text-sm"
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
              />
              {searchLoading && (
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full"
                  style={{ border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#3b82f6", animation: "spin 0.8s linear infinite", display: "inline-block" }}
                />
              )}
            </div>

            {/* Search dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden"
                style={{
                  background: "#111",
                  border: "1px solid rgba(255,255,255,0.1)",
                  zIndex: 50,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                }}
              >
                {searchResults.map((result, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 cursor-pointer transition-colors hover:bg-white/5"
                    style={{ borderBottom: i < searchResults.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}
                    onClick={() => {
                      setShowSearchResults(false);
                      setSearchQuery("");
                      if (result.chapter_id) router.push(`/chapters/${result.chapter_id}`);
                    }}
                  >
                    <p className="text-xs font-semibold mb-0.5" style={{ color: "#3b82f6" }}>
                      {result.chapter_title}
                    </p>
                    <p className="text-sm font-medium mb-1" style={{ color: "#e2e8f0" }}>
                      {result.lesson_title}
                    </p>
                    <p className="text-xs" style={{ color: "#64748b" }}>
                      {result.snippet}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div
          className="mb-6 p-4 rounded-xl"
          style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}
        >
          <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
        </div>
      )}

      {/* Upgrade prompt */}
      {showUpgrade && (
        <div className="fixed inset-0 modal-backdrop" style={{ zIndex: 200 }}>
          <div className="modal-box">
            <UpgradePrompt onClose={() => setShowUpgrade(false)} />
          </div>
        </div>
      )}

      {/* Chapter grid — accessible */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-52 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {freeChapters.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <h2
                  className="text-sm font-bold uppercase tracking-widest"
                  style={{ color: "#64748b" }}
                >
                  Available
                </h2>
                <span className="badge badge-free">{freeChapters.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {freeChapters.map((chapter) => (
                  <ChapterCard
                    key={chapter.id}
                    chapter={chapter}
                    completedLessons={progress?.completed_lessons ?? []}
                    isLocked={false}
                  />
                ))}
              </div>
            </div>
          )}

          {lockedChapters.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2
                  className="text-sm font-bold uppercase tracking-widest"
                  style={{ color: "#64748b" }}
                >
                  Premium
                </h2>
                <span className="badge badge-locked">{lockedChapters.length}</span>
                <span className="ml-2 text-xs" style={{ color: "#64748b" }}>
                  Upgrade to unlock
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {lockedChapters.map((chapter) => (
                  <ChapterCard
                    key={chapter.id}
                    chapter={chapter}
                    completedLessons={[]}
                    isLocked={true}
                    onLockedClick={() => setShowUpgrade(true)}
                  />
                ))}
              </div>

              {/* Inline upgrade CTA */}
              <div className="mt-8">
                <UpgradePrompt inline />
              </div>
            </div>
          )}

          {chapters.length === 0 && !error && (
            <div
              className="p-12 rounded-2xl text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <p style={{ color: "#64748b" }}>No chapters found. Make sure the backend data is loaded.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
