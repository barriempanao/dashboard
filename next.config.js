/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true, // 🚀 Deshabilita ESLint en el build de producción
  },
};

module.exports = nextConfig;
