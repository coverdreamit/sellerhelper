/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Docker 빌드 최적화
  // Spring Boot API 프록시
  // - 인증(login/register/logout) → Portal (8081)
  // - 그 외 API → Commerce (5080)
  async rewrites() {
    const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:8081';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5080';
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
