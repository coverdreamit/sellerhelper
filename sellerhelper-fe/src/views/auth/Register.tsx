'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register as registerApi } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const KOREAN_NAMES = ['김철수', '이영희', '박민수', '최지현', '정수진', '한동훈', '윤서연', '임준혁', '강미영', '조성민'];
const COMPANY_NAMES = ['(주)테스트회사', '개인사업자', '스마트스토어', '셀러헬퍼샵', '테스트몰'];

function randomStr(len: number, chars = 'abcdefghijklmnopqrstuvwxyz0123456789') {
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function randomPhone() {
  return `010-${String(Math.floor(1000 + Math.random() * 9000))}-${String(Math.floor(1000 + Math.random() * 9000))}`;
}

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    loginId: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    companyName: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fillRandomData = () => {
    const loginId = `user${randomStr(6)}`;
    const basePw = 'Test1234!';
    setForm({
      name: KOREAN_NAMES[Math.floor(Math.random() * KOREAN_NAMES.length)]!,
      loginId,
      email: `${loginId}@example.com`,
      password: basePw,
      passwordConfirm: basePw,
      phone: randomPhone(),
      companyName: COMPANY_NAMES[Math.floor(Math.random() * COMPANY_NAMES.length)]!,
    });
    setAgreeTerms(true);
    setAgreePrivacy(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setError('약관에 동의해 주세요.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await registerApi({
        name: form.name,
        loginId: form.loginId,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        companyName: form.companyName || undefined,
      });
      alert('회원가입이 완료되었습니다. 관리자 승인 후 이용 가능합니다. 승인 여부 검토 중입니다.');
      router.replace('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-6">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div
        className={cn(
          'absolute rounded-full blur-[80px] opacity-40 animate-pulse',
          'w-[400px] h-[400px] bg-gradient-to-br from-blue-500 to-blue-700 -top-[10%] -right-[5%]'
        )}
      />
      <div
        className={cn(
          'absolute rounded-full blur-[80px] opacity-40 animate-pulse [animation-delay:-7s]',
          'w-[300px] h-[300px] bg-gradient-to-br from-indigo-500 to-indigo-600 bottom-[10%] -left-[5%]'
        )}
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:48px_48px]"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-[520px] md:max-w-[560px]">
        <Card className="border-0 bg-white/95 backdrop-blur-xl shadow-2xl shadow-black/40">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-2xl shadow-lg shadow-blue-500/35">
              S
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">회원가입</CardTitle>
            <CardDescription className="text-sm text-slate-500 leading-relaxed">
              셀러헬퍼 서비스 이용을 위해
              <br />
              회원 정보를 입력해 주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {error && (
                <div
                  className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg"
                  role="alert"
                >
                  {error}
                </div>
              )}
              <div className="mb-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={fillRandomData}
                  aria-label="개발용 랜덤 데이터 채우기"
                >
                  랜덤 데이터 생성
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-name">
                  이름 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reg-name"
                  name="name"
                  type="text"
                  placeholder="실명을 입력하세요"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-loginId">
                  로그인 ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reg-loginId"
                  name="loginId"
                  type="text"
                  placeholder="영문, 숫자 4자 이상"
                  value={form.loginId}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">
                  이메일 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reg-email"
                  name="email"
                  type="email"
                  placeholder="example@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">
                  비밀번호 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reg-password"
                  name="password"
                  type="password"
                  placeholder="8자 이상, 영문·숫자 조합"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-passwordConfirm">
                  비밀번호 확인 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reg-passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={form.passwordConfirm}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-phone">연락처</Label>
                <Input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  placeholder="010-0000-0000"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-company">회사명</Label>
                <Input
                  id="reg-company"
                  name="companyName"
                  type="text"
                  placeholder="회사 또는 사업자명"
                  value={form.companyName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  <span>
                    <a href="#terms" className="text-primary hover:underline">
                      이용약관
                    </a>{' '}
                    동의 (필수)
                  </span>
                </label>
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  <span>
                    <a href="#privacy" className="text-primary hover:underline">
                      개인정보처리방침
                    </a>{' '}
                    동의 (필수)
                  </span>
                </label>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? '가입 중...' : '회원가입'}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                이미 계정이 있으신가요?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  로그인
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
        <p className="mt-6 text-xs text-white/50 text-center">
          © 셀러헬퍼. 판매자 업무 효율화를 위한 통합 관리 시스템.
        </p>
      </div>
    </div>
  );
}
