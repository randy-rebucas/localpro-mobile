import type { Wallet, Transaction, PaymentMethod } from '@localpro/types';

export class FinanceService {
  static async getWallet(userId: string): Promise<Wallet | null> {
    // TODO: Implement API call
    return null;
  }

  static async getTransactions(userId: string, filters?: any): Promise<Transaction[]> {
    // TODO: Implement API call
    return [];
  }

  static async addFunds(userId: string, amount: number): Promise<Transaction> {
    // TODO: Implement API call
    throw new Error('Not implemented');
  }

  static async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    // TODO: Implement API call
    return [];
  }
}

