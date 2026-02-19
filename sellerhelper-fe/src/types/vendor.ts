/** 발주업체 (사용자 소유) */
export interface Vendor {
  vendorId: number;
  userId?: number;
  vendorName: string;
  managerName?: string;
  phone?: string;
  email?: string;
  orderMethod: 'EMAIL' | 'EXCEL' | 'API' | 'ETC';
  shippingType: 'DIRECT' | 'CONSIGNMENT' | 'MIXED';
  isActive: boolean;
  memo?: string;
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
