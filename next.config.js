/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true, // 🚀 Deshabilita ESLint en el build de producción
  },
  env: {
    COGNITO_DOMAIN: process.env.COGNITO_DOMAIN,
    COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
    COGNITO_REDIRECT_URI: process.env.COGNITO_REDIRECT_URI,
  },
};

module.exports = nextConfig;
