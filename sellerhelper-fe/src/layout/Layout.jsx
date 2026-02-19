'use client';

import { useEffect } from 'react';
import Sidebar from './Sidebar';
import { initAppData } from '@/stores';
import './Layout.css';

export default function Layout({ children }) {
  useEffect(() => {
    initAppData();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = window.location.host;
    }
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">{children}</main>
    </div>
  );
}
