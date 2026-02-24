import { redirect } from 'next/navigation';

/** /system/store → /system/platform 리다이렉트 (스토어 관리 → 플랫폼 관리 변경) */
export default function Page() {
  redirect('/system/platform');
}
