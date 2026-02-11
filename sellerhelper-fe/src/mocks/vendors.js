/**
 * 발주업체 mock (VENDOR)
 */
export const vendorsMock = {
  vendors: [
    {
      vendorId: 501,
      userId: 1001,
      vendorName: 'ABC Wholesale',
      managerName: 'Kim Manager',
      phone: '010-1234-5678',
      email: 'order@abcwholesale.com',
      orderMethod: 'EMAIL',
      shippingType: 'DIRECT',
      isActive: true,
      memo: 'Main supplier for electronics',
      createdAt: '2026-01-10T09:00:00',
    },
    {
      vendorId: 502,
      userId: 1001,
      vendorName: 'XYZ Factory',
      managerName: 'Lee Manager',
      phone: '010-9876-5432',
      email: 'sales@xyzfactory.com',
      orderMethod: 'EXCEL',
      shippingType: 'CONSIGNMENT',
      isActive: false,
      memo: 'Temporary stop',
      createdAt: '2026-01-20T11:00:00',
    },
  ],
};
