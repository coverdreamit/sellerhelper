import { redirect } from 'next/navigation';

export default function Page({ searchParams }) {
  const vendorId = searchParams?.vendorId;
  const qs = vendorId ? `?vendorId=${vendorId}` : '';
  redirect(`/settings/supplier/forms${qs}`);
}
