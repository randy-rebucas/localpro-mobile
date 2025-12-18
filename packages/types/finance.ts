export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  walletId: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  category: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'bank' | 'wallet';
  last4?: string;
  isDefault: boolean;
}

