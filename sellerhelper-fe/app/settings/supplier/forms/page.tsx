import SupplierFormManage from '@/views/settings/supplier/SupplierFormManage';

export default function Page({ searchParams }) {
  const vendorId = searchParams?.vendorId ?? null;
  return <SupplierFormManage vendorId={vendorId} />;
}
