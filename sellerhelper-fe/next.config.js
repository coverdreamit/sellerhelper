/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Docker 빌드 최적화
  // Spring Boot API 프록시
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    return [
      { source: '/api/:path*', destination: `${apiUrl}/api/:path*` },
    ];
  },
};

module.exports = nextConfig;
