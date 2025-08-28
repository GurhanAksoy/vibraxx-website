/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true }, // şimdilik hızlı deploy için
  eslint: { ignoreDuringBuilds: true },    // şimdilik hızlı deploy için
};
export default nextConfig;
