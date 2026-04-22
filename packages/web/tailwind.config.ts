import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "375px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        bg: "#080c14",
        surface: "#0f1623",
        surface2: "#161e2e",
        cyan: "#22d3ee",
        yellow: "#fde047",
        green: "#4ade80",
        red: "#f87171",
        muted: "#64748b",
        text: "#e2e8f0",
        // Additional theme colors matching existing SPA
        navy: "#0A0A0A",
        "red-mid": "#DC2626",
        "red-dark": "#7F1D1D",
        amber: "#F59E0B",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Syne", "sans-serif"],
      },
      borderColor: {
        DEFAULT: "rgba(255,255,255,0.07)",
      },
      backdropBlur: {
        xs: "4px",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-600px 0" },
          "100%": { backgroundPosition: "600px 0" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float1: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg) scale(1)" },
          "30%": { transform: "translateY(-38px) rotate(10deg) scale(1.07)" },
          "70%": { transform: "translateY(18px) rotate(-7deg) scale(0.96)" },
        },
        float2: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg) scale(1)" },
          "40%": { transform: "translateY(30px) rotate(-14deg) scale(0.94)" },
          "75%": { transform: "translateY(-24px) rotate(8deg) scale(1.05)" },
        },
        float3: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg) scale(1)" },
          "25%": { transform: "translateY(-28px) rotate(18deg) scale(1.08)" },
          "60%": { transform: "translateY(16px) rotate(-10deg) scale(0.96)" },
        },
        blobFloat1: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(30px,-40px) scale(1.05)" },
        },
        blobFloat2: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(-20px,30px) scale(0.95)" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite linear",
        fadeIn: "fadeIn 0.3s ease",
        float1: "float1 14s ease-in-out infinite",
        float2: "float2 17s ease-in-out infinite",
        float3: "float3 20s ease-in-out infinite",
        blobFloat1: "blobFloat1 18s ease-in-out infinite",
        blobFloat2: "blobFloat2 22s ease-in-out infinite",
        spin: "spin 0.8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
