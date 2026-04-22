import type { Metadata } from "next";
import "./globals.css";
import RootLayout from "./RootLayout";

export const metadata: Metadata = {
  title: "Course Companion — AI Agent Development LMS",
  description:
    "Your AI Agent Development learning platform. Master AI agents, LLM tooling, and autonomous systems.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  );
}
