export interface Facility {
  id: string;
  name: string;
  type: string;
  address: string;
  ownerId: string;
  images: string[];
  amenities: string[];
  rating?: number;
  createdAt: Date;
}

export interface FacilityService {
  id: string;
  facilityId: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  providerId: string;
}

export interface FacilityBooking {
  id: string;
  facilityId: string;
  serviceId: string;
  userId: string;
  scheduledDate: Date;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  totalAmount: number;
  createdAt: Date;
}

