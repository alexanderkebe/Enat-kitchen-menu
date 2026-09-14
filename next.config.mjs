/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep live development files separate from production builds.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

export default nextConfig;
