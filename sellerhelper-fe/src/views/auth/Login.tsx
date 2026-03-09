'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  login,
  getSavedLoginId,
  saveLoginIdCookie,
  clearLoginIdCookie,
} from '@/services/auth.service';
import { useAuthStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function Login() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedId = getSavedLoginId();
    if (savedId) {
      setLoginId(savedId);
      setRemember(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login({ loginId, password, rememberMe: remember });
      if (remember) {
        saveLoginIdCookie(loginId);
      } else {
        clearLoginIdCookie();
      }
      setUser(res);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('login-page-root', 'min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-6')}>
      {/* 배경 */}
      <div className={cn('login-page-bg', 'absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900')} />
      <div className={cn('login-page-blur-1', 'absolute rounded-full blur-[80px] opacity-40 animate-pulse w-[400px] h-[400px] -top-[10%] -right-[5%]')} />
      <div className={cn('login-page-blur-2', 'absolute rounded-full blur-[80px] opacity-40 animate-pulse w-[300px] h-[300px] bottom-[10%] -left-[5%]')} />
      <div className={cn('login-page-grid', 'absolute inset-0')} aria-hidden />

      <div className={cn('login-page-card-wrap', 'relative z-10 w-full max-w-[420px]')}>
        <Card className={cn('login-page-card', 'border-0 bg-white/95 backdrop-blur-xl shadow-2xl shadow-black/40')}>
          <CardHeader className={cn('card-header-area', 'text-center space-y-4 pb-2')}>
            <div className={cn('card-logo', 'mx-auto w-14 h-14 flex items-center justify-center rounded-xl text-white font-bold text-2xl shadow-lg')}>
              S
            </div>
            <CardTitle className={cn('card-title', 'text-2xl font-bold text-slate-900')}>셀러헬퍼</CardTitle>
            <CardDescription className={cn('card-desc', 'text-sm text-slate-500 leading-relaxed')}>
              스마트스토어·쿠팡·11번가 등 판매 현황을 한눈에,
              <br />
              주문·배송·정산을 효율적으로 관리하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className={cn('card-body', 'p-6 pt-0')}>
            <form className={cn('login-form', 'flex flex-col gap-5')} onSubmit={handleSubmit}>
              {error && (
                <div
                  className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg"
                  role="alert"
                >
                  {error}
                </div>
              )}
              <div className={cn('login-field', 'space-y-2')}>
                <Label htmlFor="login-id">아이디</Label>
                <Input
                  id="login-id"
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div className={cn('login-field', 'space-y-2')}>
                <Label htmlFor="login-password">비밀번호</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className={cn('login-actions', 'flex justify-between items-center')}>
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  <span>아이디 저장</span>
                </label>
                <Link
                  href="/login/forgot"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  비밀번호 찾기
                </Link>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? '로그인 중...' : '로그인'}
              </Button>
              <p className={cn('login-footer-p', 'text-sm text-muted-foreground text-center')}>
                계정이 없으신가요?{' '}
                <Link href="/login/register" className="font-semibold text-primary hover:underline">
                  회원가입
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <p className={cn('login-page-copy', 'mt-6 text-xs text-white/50 text-center')}>
          © 셀러헬퍼. 판매자 업무 효율화를 위한 통합 관리 시스템.
        </p>
      </div>
    </div>
  );
}
