// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Cuando Cognito redirija a /api/auth/finalCallback,
        // reescribe la URL a la ruta de callback de NextAuth.
        source: '/api/auth/finalCallback',
        destination: '/api/auth/callback/cognito',
      },
    ];
  },
};

module.exports = nextConfig;
