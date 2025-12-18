export interface Agency {
  id: string;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  verified: boolean;
  rating?: number;
  memberCount: number;
  createdAt: Date;
}

export interface AgencyMember {
  id: string;
  agencyId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

