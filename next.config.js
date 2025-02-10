const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // 🚀 Ignora errores de ESLint en `next build`
  },
  output: "standalone",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
  },
};

module.exports = nextConfig;
