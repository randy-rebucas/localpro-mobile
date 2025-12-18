export interface Referral {
  id: string;
  referrerId: string;
  referredId?: string;
  code: string;
  status: 'pending' | 'completed' | 'expired';
  reward?: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface ReferralProgram {
  id: string;
  name: string;
  description: string;
  rewardAmount: number;
  rewardType: 'credit' | 'cash' | 'discount';
  isActive: boolean;
}

