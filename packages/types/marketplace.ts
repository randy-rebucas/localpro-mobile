export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  providerId: string;
  providerName: string;
  images: string[];
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
}

export interface Booking {
  id: string;
  serviceId: string;
  service: Service;
  userId: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate: Date;
  createdAt: Date;
  totalAmount: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

