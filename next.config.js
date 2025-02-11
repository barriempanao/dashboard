// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Cuando Cognito redirija a /api/auth/finalCallback,
        // reescribimos a la ruta de callback de NextAuth para el proveedor "cognito".
        source: '/api/auth/finalCallback',
        destination: '/api/auth/callback/cognito'
      }
    ]
  }
}

module.exports = nextConfig;
