/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_URL;

const nextConfig = {
  reactStrictMode: true,
  // In local dev, proxy /api/* to the FastAPI server via BACKEND_URL.
  // On Vercel (BACKEND_URL not set), the Python function at api/index.py
  // handles /api/* natively — no rewrite needed.
  async rewrites() {
    if (!BACKEND_URL) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
