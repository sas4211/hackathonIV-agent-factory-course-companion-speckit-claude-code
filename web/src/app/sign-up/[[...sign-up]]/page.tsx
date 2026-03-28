import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "radial-gradient(ellipse at 40% 0%, rgba(245,197,24,0.1) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(37,99,235,0.1) 0%, transparent 55%)" }}
    >
      {/* Background grid */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo */}
          <div
            className="inline-flex items-center justify-center rounded-2xl mb-5"
            style={{
              width: 56,
              height: 56,
              background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
              boxShadow: "0 0 30px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f5c518" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
            </svg>
          </div>

          <h1
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "1.75rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: 6,
            }}
          >
            <span style={{ color: "#f1f5f9" }}>Start learning </span>
            <span
              style={{
                background: "linear-gradient(90deg, #3b82f6, #f5c518)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              today
            </span>
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
            Create your free account — no credit card required
          </p>

          {/* Feature highlights */}
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            {[
              { icon: "📚", text: "3 free chapters" },
              { icon: "🎯", text: "Chapter quizzes" },
              { icon: "✨", text: "AI learning path" },
            ].map((f) => (
              <span
                key={f.text}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.05)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <span>{f.icon}</span>
                {f.text}
              </span>
            ))}
          </div>
        </div>

        {/* Clerk SignUp component */}
        <div className="flex justify-center">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            afterSignUpUrl="/"
            appearance={{
              baseTheme: undefined,
              variables: {
                colorPrimary: "#2563eb",
                colorBackground: "#0f1623",
                colorInputBackground: "#161e2e",
                colorInputText: "#e2e8f0",
                colorText: "#e2e8f0",
                colorTextSecondary: "#6b7280",
                colorNeutral: "#374151",
                borderRadius: "12px",
                fontFamily: "DM Sans, sans-serif",
              },
              elements: {
                rootBox: "w-full",
                card: {
                  background: "rgba(15,22,35,0.95)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "20px",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,197,24,0.06)",
                  backdropFilter: "blur(20px)",
                },
                headerTitle: {
                  display: "none",
                },
                headerSubtitle: {
                  display: "none",
                },
                socialButtonsBlockButton: {
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#e2e8f0",
                  borderRadius: "10px",
                },
                formFieldInput: {
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#e2e8f0",
                  borderRadius: "10px",
                },
                formButtonPrimary: {
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  borderRadius: "10px",
                  fontWeight: "600",
                  boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                },
                footerAction: {
                  color: "#6b7280",
                },
                footerActionLink: {
                  color: "#3b82f6",
                },
              },
            }}
          />
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <a
            href="/"
            style={{ color: "#4b5563", fontSize: "0.82rem", textDecoration: "none" }}
            className="hover:text-white transition-colors"
          >
            ← Back to Course Companion
          </a>
        </div>
      </div>
    </div>
  );
}
