/** 발주업체 (사용자 소유) */
export interface VendorPolicy {
  autoOrder: {
    enabled: boolean;
    stockThreshold: number;
    defaultOrderQty: number;
    orderUnit: string;
  };
  leadTime: {
    days: number;
    includeWeekend: boolean;
  };
  orderLimit: {
    minOrderQty: number;
    minOrderAmount: number;
  };
  delivery: {
    shippingType: string;
    bundleAllowed: boolean;
  };
  schedule: {
    orderableDays: string[];
    cutoffTime: string;
  };
  useYn: 'Y' | 'N';
  memo?: string;
}

export interface Vendor {
  vendorId: number;
  userId?: number;
  vendorName: string;
  bizNo?: string;
  managerName?: string;
  address?: string;
  addressDetail?: string;
  phone?: string;
  email?: string;
  orderMethod: 'EMAIL' | 'EXCEL' | 'API' | 'ETC';
  shippingType: 'DIRECT' | 'CONSIGNMENT' | 'MIXED';
  isActive: boolean;
  memo?: string;
  policy?: VendorPolicy;
  createdAt?: string;
  updatedAt?: string;
}

export const OrderMethod = {
  EMAIL: 'EMAIL',
  EXCEL: 'EXCEL',
  API: 'API',
  ETC: 'ETC',
} as const;

export const ShippingType = {
  DIRECT: 'DIRECT',
  CONSIGNMENT: 'CONSIGNMENT',
  MIXED: 'MIXED',
} as const;
