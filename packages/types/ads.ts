export interface Ad {
  id: string;
  title: string;
  description: string;
  advertiserId: string;
  advertiserName: string;
  category: string;
  images: string[];
  targetAudience?: string[];
  budget: number;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  impressions: number;
  clicks: number;
  createdAt: Date;
}

export interface AdCampaign {
  id: string;
  name: string;
  ads: string[];
  budget: number;
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
}

