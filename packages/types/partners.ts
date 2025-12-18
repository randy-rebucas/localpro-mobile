export interface Partner {
  id: string;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  category: string;
  contactEmail: string;
  contactPhone: string;
  partnershipType: 'sponsor' | 'integration' | 'affiliate' | 'strategic';
  status: 'active' | 'inactive' | 'pending';
  benefits: string[];
  createdAt: Date;
}

export interface Partnership {
  id: string;
  partnerId: string;
  userId?: string;
  type: string;
  status: 'active' | 'inactive' | 'expired';
  startDate: Date;
  endDate?: Date;
  terms: Record<string, any>;
}

