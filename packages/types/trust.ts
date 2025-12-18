export interface Verification {
  id: string;
  userId: string;
  type: 'identity' | 'business' | 'professional' | 'background';
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  documents: string[];
  verifiedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'user' | 'service' | 'facility';
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface TrustScore {
  userId: string;
  score: number;
  factors: {
    verified: boolean;
    reviews: number;
    completedJobs: number;
    responseRate: number;
  };
}

