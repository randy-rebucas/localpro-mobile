import type { Supply, SupplyOrder } from '@localpro/types';

export class SuppliesService {
  static async getSupplies(filters?: any): Promise<Supply[]> {
    // TODO: Implement API call
    return [];
  }

  static async createOrder(order: Partial<SupplyOrder>): Promise<SupplyOrder> {
    // TODO: Implement API call
    throw new Error('Not implemented');
  }

  static async getOrders(userId: string): Promise<SupplyOrder[]> {
    // TODO: Implement API call
    return [];
  }
}

