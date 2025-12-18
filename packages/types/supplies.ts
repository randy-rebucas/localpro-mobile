export interface Supply {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  supplierId: string;
  supplierName: string;
  images: string[];
  inStock: boolean;
  stockQuantity?: number;
  createdAt: Date;
}

export interface SupplyOrder {
  id: string;
  items: SupplyOrderItem[];
  userId: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
}

export interface SupplyOrderItem {
  supplyId: string;
  quantity: number;
  price: number;
}

