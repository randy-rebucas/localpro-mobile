export interface Rental {
  id: string;
  title: string;
  description: string;
  category: string;
  ownerId: string;
  ownerName: string;
  location: string;
  price: number;
  period: 'daily' | 'weekly' | 'monthly';
  images: string[];
  available: boolean;
  createdAt: Date;
}

export interface RentalBooking {
  id: string;
  rentalId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

