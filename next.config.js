// next.config.js
const withTM = require('next-transpile-modules')([
  'aws-amplify',
]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Usamos Webpack + SWC (no turbopack)
  experimental: {
    forceSwcTransforms: true,
  },
};

module.exports = withTM(nextConfig);
