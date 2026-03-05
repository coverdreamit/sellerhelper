/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Docker 빌드 최적화
  // Spring Boot API 프록시 (단일 백엔드)
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5080';
    const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || apiUrl;
    return [
      { source: '/api/auth/login', destination: `${portalUrl}/api/auth/login` },
      { source: '/api/auth/register', destination: `${portalUrl}/api/auth/register` },
      { source: '/api/auth/logout', destination: `${portalUrl}/api/auth/logout` },
      { source: '/api/auth/me', destination: `${portalUrl}/api/auth/me` },
      { source: '/api/:path*', destination: `${apiUrl}/api/:path*` },
    ];
  },
};

export default nextConfig;
