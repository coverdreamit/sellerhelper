/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Docker 빌드 최적화
  // API 호출은 프록시 없이 NEXT_PUBLIC_API_URL로 직접 요청 (기본: http://localhost:5001)
};

export default nextConfig;
