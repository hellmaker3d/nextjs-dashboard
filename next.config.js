/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cacheComponents: false, // ✅ si quieres usar "use cache" en componentes
  },
};

module.exports = nextConfig;
