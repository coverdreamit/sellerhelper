/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Spring Boot API 프록시 (개발 시)
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://localhost:8080/api/:path*' },
    ];
  },
};

module.exports = nextConfig;
