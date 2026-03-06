import type { ReactNode } from 'react';
import './globals.css';
import Layout from '@/layout/Layout';
import BackendHealthBanner from '@/components/BackendHealthBanner';

export const metadata = {
  // title: 'Seller Helper',
  // description: '판매 현황과 처리 현황을 한눈에 확인하세요.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <BackendHealthBanner />
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
