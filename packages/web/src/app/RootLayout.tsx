"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import FloatingIcons from "@/components/FloatingIcons";
import type { AppUser } from "@/lib/types";

// Clerk is optional — import with try/catch for demo mode
let ClerkProvider: any = null;
let SignedIn: any = null;
let SignedOut: any = null;
let UserButton: any = null;
let SignInButton: any = null;
let SignUpButton: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const clerk = require("@clerk/nextjs");

  // Safely get Clerk components with fallbacks
  if (clerk) {
    ClerkProvider = clerk.ClerkProvider || clerk.default?.ClerkProvider;
    SignedIn = clerk.SignedIn || clerk.default?.SignedIn;
    SignedOut = clerk.SignedOut || clerk.default?.SignedOut;
    UserButton = clerk.UserButton || clerk.default?.UserButton;
    SignInButton = clerk.SignInButton || clerk.default?.SignInButton;
    SignUpButton = clerk.SignUpButton || clerk.default?.SignUpButton;
  }
} catch (error) {
  console.warn('Clerk not available, running in demo mode:', error.message);
  ClerkProvider = null;
}

const DEMO_USER: AppUser = {
  id: "demo_user",
  email: "demo@coursecompanion.dev",
  firstName: "Demo",
  lastName: "Student",
  tier: "free",
  isAdmin: false,
};

const DEMO_ADMIN_USER: AppUser = {
  id: "demo_admin",
  email: "admin@coursecompanion.dev",
  firstName: "Admin",
  lastName: "User",
  tier: "pro",
  isAdmin: true,
};

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/chapters", label: "Chapters" },
  { href: "/progress", label: "Progress" },
];

function tierBadgeStyle(tier: string) {
  if (tier === "pro" || tier === "team")
    return { bg: "rgba(59,130,246,0.15)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)" };
  if (tier === "premium")
    return { bg: "rgba(74,222,128,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.25)" };
  return { bg: "rgba(245,197,24,0.12)", color: "#f5c518", border: "1px solid rgba(245,197,24,0.25)" };
}

function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [demoUserState, setDemoUserState] = useState<AppUser>(DEMO_USER);
  const pathname = usePathname();

  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const tierStyle = tierBadgeStyle(demoUserState.tier);

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <FloatingIcons />

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-[100] flex items-center"
        style={{
          height: 64,
          background: "rgba(8,12,20,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 1px 0 rgba(59,130,246,0.08), 0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        {/* Gold-to-blue top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "linear-gradient(90deg, #1e3a8a 0%, #2563eb 30%, #3b82f6 50%, #f5c518 75%, #d4af37 100%)",
            opacity: 0.9,
          }}
        />

        {/* Left section — matches sidebar width on desktop */}
        <div className="flex items-center gap-2 px-3 sm:px-4 lg:w-[260px] lg:flex-shrink-0">
          {/* Hamburger — hidden on desktop where sidebar is always visible */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation"
            className="lg:hidden relative flex items-center justify-center rounded-xl transition-all duration-200"
            style={{
              width: 38,
              height: 38,
              background: sidebarOpen ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.04)",
              border: sidebarOpen ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.08)",
              color: sidebarOpen ? "#3b82f6" : "#9ca3af",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              {sidebarOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </>
              )}
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
            {/* Logo icon */}
            <div
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{
                width: 34,
                height: 34,
                background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
                boxShadow: "0 0 16px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              {/* Graduation cap icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5c518" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
              </svg>
            </div>

            {/* Logo text */}
            <div className="hidden xs:flex flex-col" style={{ lineHeight: 1 }}>
              <span
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  letterSpacing: "-0.02em",
                  color: "#f1f5f9",
                }}
              >
                Course{" "}
                <span
                  style={{
                    background: "linear-gradient(90deg, #3b82f6, #f5c518)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Companion
                </span>
              </span>
              <span style={{ fontSize: "0.6rem", color: "#4b5563", fontWeight: 500, letterSpacing: "0.05em" }}>
                AI Learning Platform
              </span>
            </div>
            {/* Mobile: short name */}
            <span
              className="xs:hidden"
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: "0.9rem",
                color: "#f1f5f9",
              }}
            >
              CC
            </span>
          </Link>
        </div>

        {/* Center: quick nav (desktop only) */}
        <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  color: active ? "#f1f5f9" : "#6b7280",
                  background: active ? "rgba(59,130,246,0.12)" : "transparent",
                  textDecoration: "none",
                  letterSpacing: "-0.01em",
                }}
              >
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: -1,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 20,
                      height: 2,
                      borderRadius: 99,
                      background: "linear-gradient(90deg, #3b82f6, #f5c518)",
                    }}
                  />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right section */}
        <div className="flex items-center gap-2 px-3 sm:px-4">

          {/* Demo mode controls */}
          {!hasClerkKey && (
            <div className="flex items-center gap-1 mr-1">
              {/* Demo mode label */}
              <span
                className="hidden md:inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mr-1"
                style={{ background: "rgba(245,197,24,0.08)", color: "#6b7280", border: "1px solid rgba(245,197,24,0.15)", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}
              >
                Demo
              </span>
              {[
                { label: "Free", user: DEMO_USER, active: !demoUserState.isAdmin && demoUserState.tier === "free", color: "#f5c518", bg: "rgba(245,197,24,0.15)" },
                { label: "Pro", user: { ...DEMO_USER, tier: "pro" as const, id: "demo_pro" }, active: demoUserState.tier === "pro" && !demoUserState.isAdmin, color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
                { label: "Admin", user: DEMO_ADMIN_USER, active: demoUserState.isAdmin, color: "#f87171", bg: "rgba(248,113,113,0.15)" },
              ].map(({ label, user, active, color, bg }) => (
                <button
                  key={label}
                  title={`Switch to ${label} tier`}
                  onClick={() => setDemoUserState(user)}
                  className="text-xs px-2 py-1 rounded-lg transition-all duration-150"
                  style={{
                    background: active ? bg : "rgba(255,255,255,0.04)",
                    border: `1px solid ${active ? color + "44" : "rgba(255,255,255,0.08)"}`,
                    color: active ? color : "#6b7280",
                    cursor: "pointer",
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Divider */}
          {!hasClerkKey && (
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)" }} className="hidden sm:block" />
          )}

          {/* Clerk auth controls */}
          {hasClerkKey && SignedIn && SignedOut && UserButton && SignInButton ? (
            <>
              <SignedIn>
                <div className="flex items-center gap-2.5">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
              <SignedOut>
                <div className="flex items-center gap-2">
                  {/* Sign In — outlined */}
                  <SignInButton mode="modal">
                    <button
                      className="flex items-center gap-1.5 text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl transition-all duration-200"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        color: "#d1d5db",
                        border: "1px solid rgba(255,255,255,0.12)",
                        cursor: "pointer",
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                      </svg>
                      <span className="hidden sm:inline">Sign In</span>
                    </button>
                  </SignInButton>

                  {/* Sign Up — filled */}
                  {SignUpButton && (
                    <SignUpButton mode="modal">
                      <button
                        className="flex items-center gap-1.5 text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl transition-all duration-200"
                        style={{
                          background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                          color: "#fff",
                          border: "1px solid rgba(59,130,246,0.35)",
                          cursor: "pointer",
                          boxShadow: "0 2px 12px rgba(37,99,235,0.35)",
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 7a4 4 0 110 8 4 4 0 010-8zM20 8v6M23 11h-6" />
                        </svg>
                        <span className="hidden xs:inline">Get Started</span>
                        <span className="xs:hidden">Join</span>
                      </button>
                    </SignUpButton>
                  )}
                </div>
              </SignedOut>
            </>
          ) : (
            /* Demo user avatar pill */
            <div
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: 28,
                  height: 28,
                  background: `linear-gradient(135deg, ${tierStyle.color}33, ${tierStyle.color}1a)`,
                  border: `1px solid ${tierStyle.color}44`,
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  color: tierStyle.color,
                  fontFamily: "Syne, sans-serif",
                }}
              >
                {demoUserState.firstName?.[0] || "D"}
              </div>
              <div className="hidden sm:flex flex-col" style={{ lineHeight: 1.2 }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#e2e8f0" }}>
                  {demoUserState.firstName || "Demo"}
                </span>
                <span style={{ fontSize: "0.62rem", fontWeight: 700, color: tierStyle.color, letterSpacing: "0.04em" }}>
                  {demoUserState.tier.toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        demoUser={hasClerkKey ? null : demoUserState}
      />

      {/* Main content */}
      <main
        className="relative"
        style={{
          zIndex: 10,
          minHeight: "calc(100vh - 64px)",
          paddingBottom: 60,
        }}
      >
        {/* Spacer for fixed sidebar on lg+ */}
        <div className="hidden lg:block" style={{ position: "absolute", top: 0, left: 0, width: 260, height: "100%" }} aria-hidden />

        <div className="lg:ml-[260px] px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 lg:pt-8">
          <div data-demo-user={JSON.stringify(hasClerkKey ? null : demoUserState)}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (publishableKey && ClerkProvider) {
    return (
      <ClerkProvider publishableKey={publishableKey}>
        <AppShell>{children}</AppShell>
      </ClerkProvider>
    );
  }

  return <AppShell>{children}</AppShell>;
}
