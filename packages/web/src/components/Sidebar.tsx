"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppUser } from "@/lib/types";

// Clerk imports — graceful fallback
let useUser: (() => { user: unknown; isLoaded: boolean }) | null = null;
let SignInButton: React.ComponentType<{ mode?: string; children: React.ReactNode }> | null = null;
let SignUpButton: React.ComponentType<{ mode?: string; children: React.ReactNode }> | null = null;
let UserButton: React.ComponentType<{ afterSignOutUrl?: string }> | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const clerk = require("@clerk/nextjs");
  useUser = clerk.useUser;
  SignInButton = clerk.SignInButton;
  SignUpButton = clerk.SignUpButton;
  UserButton = clerk.UserButton;
} catch {
  useUser = null;
}

interface ClerkUserShape {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: { emailAddress: string }[];
  imageUrl: string;
  publicMetadata: Record<string, unknown>;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  demoUser?: AppUser | null;
}

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    description: "Overview & stats",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/chapters",
    label: "Chapters",
    description: "Browse course content",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    href: "/progress",
    label: "My Progress",
    description: "Track your learning",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const adminItems = [
  {
    href: "/admin",
    label: "Admin Panel",
    description: "Manage content & users",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

function tierInfo(tier: string) {
  if (tier === "pro" || tier === "team")
    return { label: "Pro", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)" };
  if (tier === "premium")
    return { label: "Premium", color: "#4ade80", bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.2)" };
  return { label: "Free", color: "#f5c518", bg: "rgba(245,197,24,0.1)", border: "rgba(245,197,24,0.2)" };
}

export default function Sidebar({ isOpen, onClose, demoUser }: SidebarProps) {
  const pathname = usePathname();

  // Clerk user — graceful fallback
  let clerkUser: ClerkUserShape | null = null;
  let clerkLoaded = false;
  let hasClerk = false;

  if (useUser) {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { user, isLoaded } = useUser();
      clerkUser = user as ClerkUserShape | null;
      clerkLoaded = isLoaded;
      hasClerk = true;
    } catch {
      hasClerk = false;
    }
  }

  const user = hasClerk && clerkLoaded && clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName || undefined,
        lastName: clerkUser.lastName || undefined,
        imageUrl: clerkUser.imageUrl,
        tier: ((clerkUser.publicMetadata?.plan as string) || "free") as "free" | "premium" | "pro" | "team",
        isAdmin: clerkUser.publicMetadata?.role === "admin",
      }
    : demoUser || null;

  const tier = user?.tier || "free";
  const isAdmin = user?.isAdmin || false;
  const tInfo = tierInfo(tier);
  const displayName = user?.firstName || user?.email?.split("@")[0] || "Student";
  const initials = (user?.firstName?.[0] || user?.email?.[0] || "S").toUpperCase();

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 lg:hidden transition-all duration-300"
        style={{
          zIndex: 89,
          background: isOpen ? "rgba(0,0,0,0.6)" : "transparent",
          backdropFilter: isOpen ? "blur(4px)" : "none",
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        style={{
          position: "fixed",
          top: 64,
          left: 0,
          bottom: 0,
          width: 260,
          zIndex: 90,
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          overflowY: "auto",
          overflowX: "hidden",
          // Glass + layered bg
          background: "linear-gradient(180deg, rgba(8,12,20,0.98) 0%, rgba(14,20,32,0.97) 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
        className={`${isOpen ? "translate-x-0" : "-translate-x-full"} lg:!translate-x-0`}
      >
        {/* Top accent line */}
        <div
          style={{
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.4), rgba(245,197,24,0.3), transparent)",
          }}
        />

        {/* Mobile close button */}
        <button
          className="lg:hidden absolute top-3 right-3 flex items-center justify-center rounded-xl transition-all"
          onClick={onClose}
          aria-label="Close sidebar"
          style={{
            width: 30,
            height: 30,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#6b7280",
            cursor: "pointer",
            zIndex: 1,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Nav section */}
        <div className="px-3 pt-5">
          <p
            style={{
              fontSize: "0.6rem",
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#374151",
              paddingLeft: 10,
              marginBottom: 6,
            }}
          >
            Navigation
          </p>

          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 relative"
                  style={{
                    textDecoration: "none",
                    background: active
                      ? "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(59,130,246,0.08))"
                      : "transparent",
                    color: active ? "#e2e8f0" : "#6b7280",
                    border: active ? "1px solid rgba(59,130,246,0.2)" : "1px solid transparent",
                  }}
                >
                  {/* Active left accent */}
                  {active && (
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "20%",
                        height: "60%",
                        width: 3,
                        borderRadius: "0 3px 3px 0",
                        background: "linear-gradient(180deg, #3b82f6, #f5c518)",
                      }}
                    />
                  )}

                  {/* Icon */}
                  <span
                    className="flex items-center justify-center rounded-lg flex-shrink-0 transition-all duration-150"
                    style={{
                      width: 32,
                      height: 32,
                      background: active ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
                      border: active ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.06)",
                      color: active ? "#3b82f6" : "#4b5563",
                    }}
                  >
                    {item.icon}
                  </span>

                  {/* Label + description */}
                  <div className="flex-1 min-w-0">
                    <p
                      style={{
                        fontSize: "0.83rem",
                        fontWeight: active ? 700 : 500,
                        fontFamily: "DM Sans, sans-serif",
                        lineHeight: 1.2,
                        color: active ? "#f1f5f9" : "#9ca3af",
                      }}
                    >
                      {item.label}
                    </p>
                    <p style={{ fontSize: "0.65rem", color: "#374151", lineHeight: 1 }}>
                      {item.description}
                    </p>
                  </div>

                  {/* Arrow on hover */}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "#3b82f6" }}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin section */}
        {isAdmin && (
          <div className="px-3 mt-4">
            <div
              style={{
                height: 1,
                background: "linear-gradient(90deg, transparent, rgba(248,113,113,0.2), transparent)",
                marginBottom: 8,
              }}
            />
            <p
              style={{
                fontSize: "0.6rem",
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#374151",
                paddingLeft: 10,
                marginBottom: 6,
              }}
            >
              Admin
            </p>
            <nav className="flex flex-col gap-0.5">
              {adminItems.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 relative"
                    style={{
                      textDecoration: "none",
                      background: active ? "rgba(248,113,113,0.08)" : "transparent",
                      border: active ? "1px solid rgba(248,113,113,0.2)" : "1px solid transparent",
                    }}
                  >
                    {active && (
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          top: "20%",
                          height: "60%",
                          width: 3,
                          borderRadius: "0 3px 3px 0",
                          background: "linear-gradient(180deg, #f87171, #f5c518)",
                        }}
                      />
                    )}
                    <span
                      className="flex items-center justify-center rounded-lg flex-shrink-0"
                      style={{
                        width: 32,
                        height: 32,
                        background: active ? "rgba(248,113,113,0.15)" : "rgba(255,255,255,0.04)",
                        border: active ? "1px solid rgba(248,113,113,0.3)" : "1px solid rgba(255,255,255,0.06)",
                        color: active ? "#f87171" : "#4b5563",
                      }}
                    >
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          style={{
                            fontSize: "0.83rem",
                            fontWeight: active ? 700 : 500,
                            fontFamily: "DM Sans, sans-serif",
                            lineHeight: 1.2,
                            color: active ? "#f1f5f9" : "#9ca3af",
                          }}
                        >
                          {item.label}
                        </p>
                        <span
                          style={{
                            fontSize: "0.55rem",
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            padding: "1px 6px",
                            borderRadius: 99,
                            background: "rgba(248,113,113,0.15)",
                            color: "#f87171",
                            border: "1px solid rgba(248,113,113,0.25)",
                            textTransform: "uppercase",
                          }}
                        >
                          Admin
                        </span>
                      </div>
                      <p style={{ fontSize: "0.65rem", color: "#374151", lineHeight: 1 }}>
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Course progress teaser */}
        <div className="px-3 pb-3">
          <div
            className="px-3 py-3 rounded-xl"
            style={{
              background: "rgba(59,130,246,0.06)",
              border: "1px solid rgba(59,130,246,0.12)",
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#3b82f6", letterSpacing: "0.04em" }}>
                AI Agent Development
              </span>
            </div>
            <p style={{ fontSize: "0.65rem", color: "#4b5563", lineHeight: 1.5 }}>
              15 chapters · quizzes · AI learning path
            </p>
          </div>
        </div>

        {/* User section */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "12px",
          }}
        >
          {hasClerk && clerkLoaded ? (
            clerkUser && UserButton ? (
              <div
                className="flex items-center gap-3 p-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <UserButton afterSignOutUrl="/" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#e2e8f0", fontFamily: "DM Sans, sans-serif" }}>
                    {clerkUser.firstName || clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0] || "Student"}
                  </p>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-bold"
                    style={{ color: tInfo.color }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: tInfo.color,
                        boxShadow: `0 0 6px ${tInfo.color}`,
                      }}
                    />
                    {tInfo.label} Plan
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {SignUpButton && (
                  <SignUpButton mode="modal">
                    <button
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                        color: "#fff",
                        border: "1px solid rgba(59,130,246,0.35)",
                        cursor: "pointer",
                        boxShadow: "0 2px 12px rgba(37,99,235,0.3)",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 7a4 4 0 110 8 4 4 0 010-8zM20 8v6M23 11h-6" />
                      </svg>
                      Get Started Free
                    </button>
                  </SignUpButton>
                )}
                {SignInButton && (
                  <SignInButton mode="modal">
                    <button
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        color: "#9ca3af",
                        border: "1px solid rgba(255,255,255,0.08)",
                        cursor: "pointer",
                      }}
                    >
                      Already have an account? Sign in
                    </button>
                  </SignInButton>
                )}
              </div>
            )
          ) : demoUser ? (
            <div
              className="flex items-center gap-3 p-2 rounded-xl group"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                transition: "all 0.2s ease",
              }}
            >
              {/* Avatar */}
              <div
                className="flex items-center justify-center rounded-xl flex-shrink-0"
                style={{
                  width: 36,
                  height: 36,
                  background: `linear-gradient(135deg, ${tInfo.color}22, ${tInfo.color}11)`,
                  border: `1.5px solid ${tInfo.color}44`,
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  color: tInfo.color,
                  fontFamily: "Syne, sans-serif",
                  boxShadow: `0 0 12px ${tInfo.color}20`,
                }}
              >
                {initials}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="truncate"
                  style={{ fontSize: "0.82rem", fontWeight: 600, color: "#e2e8f0", fontFamily: "DM Sans, sans-serif" }}
                >
                  {displayName}
                </p>
                <span
                  className="inline-flex items-center gap-1"
                  style={{ fontSize: "0.65rem", fontWeight: 700, color: tInfo.color }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: tInfo.color,
                      boxShadow: `0 0 5px ${tInfo.color}`,
                    }}
                  />
                  {tInfo.label} Plan
                </span>
              </div>

              {/* Tier badge */}
              <span
                className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: tInfo.bg,
                  color: tInfo.color,
                  border: `1px solid ${tInfo.border}`,
                  fontSize: "0.62rem",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {tInfo.label}
              </span>
            </div>
          ) : (
            /* Loading skeleton */
            <div className="flex items-center gap-3 p-2">
              <div className="skeleton w-9 h-9 rounded-xl flex-shrink-0" />
              <div className="flex-1">
                <div className="skeleton h-3 rounded w-24 mb-2" />
                <div className="skeleton h-2.5 rounded w-14" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
