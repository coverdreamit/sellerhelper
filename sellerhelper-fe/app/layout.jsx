import './globals.css';
import Layout from '@/layout/Layout';

export const metadata = {
  title: '셀러 보조 사이트',
  description: '판매 현황과 처리 현황을 한눈에 확인하세요.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
