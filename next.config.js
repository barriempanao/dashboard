/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  //swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true, // 🚀 Deshabilita ESLint en el build de producción
  },
  env: {
    COGNITO_DOMAIN: process.env.COGNITO_DOMAIN,
    COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
    COGNITO_REDIRECT_URI: process.env.COGNITO_REDIRECT_URI,
      DB_HOST: process.env.DB_HOST,
      DB_NAME: process.env.DB_NAME,
      DB_PASSWORD: process.env.DB_PASSWORD,
      DB_USER: process.env.DB_USER,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXT_PUBLIC_COGNITO_CLIENT_ID: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
      NEXT_PUBLIC_COGNITO_DOMAIN: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
      NEXT_PUBLIC_COGNITO_REDIRECT_URI: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI,
      NEXT_PUBLIC_COGNITO_REDIRECT_LOGOUT_URI: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_LOGOUT_URI,
      COOKIE_DOMAIN: process.env.COOKIE_DOMAIN
  },
};

module.exports = nextConfig;
