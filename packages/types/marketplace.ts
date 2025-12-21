export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  pricing?: {
    type: 'fixed' | 'hourly';
    basePrice: number;
    currency: string;
  };
  providerId: string;
  providerName: string;
  images: string[];
  rating?: number;
  reviewCount?: number;
  status?: 'draft' | 'published';
  createdAt: Date;
  // Service details
  availability?: {
    timezone: string;
    schedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
      _id?: string;
    }>;
  };
  estimatedDuration?: {
    min: number;
    max: number;
  };
  warranty?: {
    hasWarranty: boolean;
    duration: number;
    description: string;
  };
  insurance?: {
    covered: boolean;
    coverageAmount: number;
  };
  emergencyService?: {
    available: boolean;
    surcharge: number;
    responseTime: string;
  };
  serviceType?: 'one_time' | 'recurring' | 'subscription';
  teamSize?: number;
  equipmentProvided?: boolean;
  materialsIncluded?: boolean;
  servicePackages?: any[];
  addOns?: any[];
  serviceArea?: any[];
  features?: string[];
  requirements?: string[];
  // Location-based fields (from nearby endpoint)
  distance?: {
    value: number;
    unit: string;
    text: string;
  };
  duration?: {
    value: number;
    unit: string;
    text: string;
  };
  isWithinRange?: boolean;
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
  id: string; // Maps from API's 'key' field
  name: string;
  icon?: string;
  description?: string;
  subcategories?: string[];
  displayOrder?: number;
  metadata?: {
    tags?: string[];
  };
  statistics?: {
    totalServices?: number;
    pricing?: {
      average?: number;
      min?: number;
      max?: number;
    } | null;
    rating?: {
      average?: number;
      totalRatings?: number;
    } | null;
    popularSubcategories?: Array<{
      subcategory: string;
      count: number;
    }>;
  };
}

