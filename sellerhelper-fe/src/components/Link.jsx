'use client';

import NextLink from 'next/link';

/**
 * Next.js Link 호환 래퍼. 기존 react-router의 to prop을 href로 전달합니다.
 */
export default function Link({ to, href, ...props }) {
  return <NextLink href={href ?? to ?? '#'} {...props} />;
}
