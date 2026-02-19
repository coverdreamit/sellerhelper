'use client';

import NextLink from 'next/link';

type LinkProps = Omit<React.ComponentProps<typeof NextLink>, 'href'> & {
  href?: string;
  to?: string;
};

/**
 * Next.js Link 호환 래퍼. 기존 react-router의 to prop을 href로 전달합니다.
 */
export default function Link({ to, href, ...props }: LinkProps) {
  return <NextLink href={href ?? to ?? '#'} {...props} />;
}
