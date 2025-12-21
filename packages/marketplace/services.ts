import { apiClient } from '@localpro/api';
import { API_ENDPOINTS } from '@localpro/api/config';
import type { Booking, Review, Service, ServiceCategory } from '@localpro/types';

/**
 * API Response types for marketplace services
 */
interface ApiCategoryResponse {
  key: string;
  name: string;
  description?: string;
  icon?: string;
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

interface ApiServiceResponse {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  provider: {
    _id: string;
    firstName: string;
    lastName: string;
    profile?: any;
  };
  pricing: {
    type: 'fixed' | 'hourly';
    basePrice: number;
    currency: string;
  };
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
  rating?: {
    average: number;
    count: number;
  };
  images?: string[];
  isActive?: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
  [key: string]: any;
}

interface ApiServicesResponse {
  success: boolean;
  message?: string;
  data: ApiServiceResponse[] | {
    services: ApiServiceResponse[];
    pagination?: {
      current: number;
      pages: number;
      total: number;
      limit: number;
      count: number;
    };
    stats?: any;
  };
  pagination?: {
    current: number;
    pages: number;
    total: number;
    limit: number;
    count: number;
  };
}

/**
 * Transform API category response to ServiceCategory type
 */
function mapApiCategoryToCategory(apiCategory: ApiCategoryResponse): ServiceCategory {
  return {
    id: apiCategory.key, // Map 'key' to 'id'
    name: apiCategory.name,
    icon: apiCategory.icon,
    description: apiCategory.description,
    subcategories: apiCategory.subcategories,
    displayOrder: apiCategory.displayOrder,
    metadata: apiCategory.metadata,
    statistics: apiCategory.statistics,
  };
}

/**
 * Transform API service response to Service type
 */
function mapApiServiceToService(apiService: ApiServiceResponse & {
  distance?: { value: number; unit: string; text: string };
  duration?: { value: number; unit: string; text: string };
  isWithinRange?: boolean;
}): Service {
  return {
    id: apiService._id,
    title: apiService.title,
    description: apiService.description,
    category: apiService.category,
    subcategory: apiService.subcategory,
    price: apiService.pricing?.basePrice || 0,
    pricing: apiService.pricing ? {
      type: apiService.pricing.type,
      basePrice: apiService.pricing.basePrice,
      currency: apiService.pricing.currency,
    } : undefined,
    providerId: apiService.provider?._id || '',
    providerName: apiService.provider
      ? `${apiService.provider.firstName || ''} ${apiService.provider.lastName || ''}`.trim()
      : 'Unknown Provider',
    images: apiService.images || [],
    rating: apiService.rating?.average,
    reviewCount: apiService.rating?.count,
    status: apiService.isActive ? 'published' : 'draft',
    createdAt: apiService.createdAt instanceof Date 
      ? apiService.createdAt 
      : new Date(apiService.createdAt),
    // Service details
    availability: apiService.availability,
    estimatedDuration: apiService.estimatedDuration,
    warranty: apiService.warranty,
    insurance: apiService.insurance,
    emergencyService: apiService.emergencyService,
    serviceType: apiService.serviceType,
    teamSize: apiService.teamSize,
    equipmentProvided: apiService.equipmentProvided,
    materialsIncluded: apiService.materialsIncluded,
    servicePackages: apiService.servicePackages,
    addOns: apiService.addOns,
    serviceArea: apiService.serviceArea,
    features: apiService.features,
    requirements: apiService.requirements,
    // Preserve location-based fields from nearby endpoint
    distance: apiService.distance,
    duration: apiService.duration,
    isWithinRange: apiService.isWithinRange,
  };
}

export class MarketplaceService {
  /**
   * Get services with filters and pagination
   * Public endpoint - no auth required
   * @returns Array of services mapped to Service type
   */
  static async getServices(filters?: {
    search?: string;
    category?: string | string[];
    subcategory?: string | string[];
    location?: string;
    coordinates?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number; // Minimum rating (maps to 'rating' param in API)
    minRating?: number; // Alias for rating (for backward compatibility)
    sortBy?: string; // Field to sort by (e.g., 'createdAt', 'rating.average', 'pricing.basePrice')
    sortOrder?: 'asc' | 'desc'; // Sort direction
    sort?: 'newest' | 'price-asc' | 'price-desc' | 'rating'; // Legacy sort option
    page?: number;
    limit?: number;
    latitude?: number;
    longitude?: number;
    radius?: number;
    groupByCategory?: boolean;
  }): Promise<Service[]> {
    try {
      // If location coordinates are provided, use the nearby endpoint
      if (filters?.latitude !== undefined && filters?.longitude !== undefined) {
        return this.getNearbyServices(
          filters.latitude,
          filters.longitude,
          filters.radius || 50000, // Default 50km in meters
          {
            category: filters.category,
            subcategory: filters.subcategory,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            rating: filters.rating || filters.minRating,
            page: filters.page,
            limit: filters.limit,
          }
        );
      }

      const params = new URLSearchParams();
      
      // Search query
      if (filters?.search) params.append('search', filters.search);
      
      // Category filter
      if (filters?.category) {
        if (Array.isArray(filters.category)) {
          filters.category.forEach(cat => params.append('category', cat));
        } else {
          params.append('category', filters.category);
        }
      }
      
      // Subcategory filter
      if (filters?.subcategory) {
        if (Array.isArray(filters.subcategory)) {
          filters.subcategory.forEach(subcat => params.append('subcategory', subcat));
        } else {
          params.append('subcategory', filters.subcategory);
        }
      }
      
      // Location text filter
      if (filters?.location) params.append('location', filters.location);
      
      // Coordinates filter
      if (filters?.coordinates) params.append('coordinates', filters.coordinates);
      
      // Price filters
      if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      
      // Rating filter (use rating or minRating)
      const ratingValue = filters?.rating ?? filters?.minRating;
      if (ratingValue !== undefined) params.append('rating', ratingValue.toString());
      
      // Sorting
      if (filters?.sortBy) {
        params.append('sortBy', filters.sortBy);
        if (filters?.sortOrder) {
          params.append('sortOrder', filters.sortOrder);
        }
      } else if (filters?.sort) {
        // Legacy sort mapping
        const sortMapping: Record<string, { sortBy: string; sortOrder: 'asc' | 'desc' }> = {
          'newest': { sortBy: 'createdAt', sortOrder: 'desc' },
          'price-asc': { sortBy: 'pricing.basePrice', sortOrder: 'asc' },
          'price-desc': { sortBy: 'pricing.basePrice', sortOrder: 'desc' },
          'rating': { sortBy: 'rating.average', sortOrder: 'desc' },
        };
        const mappedSort = sortMapping[filters.sort];
        if (mappedSort) {
          params.append('sortBy', mappedSort.sortBy);
          params.append('sortOrder', mappedSort.sortOrder);
        }
      }
      
      // Pagination
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      // Group by category
      if (filters?.groupByCategory) params.append('groupByCategory', 'true');
      
      const queryString = params.toString();
      const url = `${API_ENDPOINTS.marketplace.services.list}${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get<ApiServicesResponse | Service[] | { services: Service[]; data?: Service[] }>(url);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        // Direct array response
        return response.map((item: any) => 
          item._id ? mapApiServiceToService(item) : item
        );
      }
      
      // Handle { success, data, pagination } format
      if ((response as any).success && (response as any).data) {
        const apiResponse = response as ApiServicesResponse;
        if (Array.isArray(apiResponse.data)) {
          return apiResponse.data.map(mapApiServiceToService);
        }
      }
      
      // Handle { services: [...] } format
      if ((response as any).services && Array.isArray((response as any).services)) {
        return (response as any).services.map((item: any) => 
          item._id ? mapApiServiceToService(item) : item
        );
      }
      
      // Handle { data: [...] } format
      if ((response as any).data && Array.isArray((response as any).data)) {
        return (response as any).data.map((item: any) => 
          item._id ? mapApiServiceToService(item) : item
        );
      }
      
      return [];
    } catch (error: any) {
      if (error.status === 404) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get a single service by ID
   * Public endpoint - no auth required
   */
  static async getService(id: string): Promise<Service | null> {
    try {
      if (!id) {
        console.error('getService: ID is missing');
        return null;
      }

      const url = API_ENDPOINTS.marketplace.services.getById(id);
      const response = await apiClient.get<ApiServiceResponse | { success: boolean; data: ApiServiceResponse } | Service>(
        url
      );
      
      // Handle { success: true, data: {...} } format (from user's API response)
      if ((response as any).success && (response as any).data) {
        const apiResponse = response as { success: boolean; data: ApiServiceResponse };
        if (apiResponse.data._id) {
          return mapApiServiceToService(apiResponse.data);
        }
      }
      
      // Handle { data: {...} } format (without success field)
      if ((response as any).data && (response as any).data._id) {
        return mapApiServiceToService((response as any).data);
      }
      
      // Handle direct API format with _id
      if ((response as any)._id) {
        return mapApiServiceToService(response as ApiServiceResponse);
      }
      
      // Already in Service format
      return response as Service;
    } catch (error: any) {
      console.error('Error fetching service:', error);
      if (error.status === 404 || error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get service categories
   * Public endpoint - no auth required
   * @returns Array of service categories
   */
  static async getCategories(): Promise<ServiceCategory[]> {
    try {
      const response = await apiClient.get<
        ApiCategoryResponse[] | 
        { success: boolean; message?: string; data: ApiCategoryResponse[]; summary?: any } | 
        { categories: ApiCategoryResponse[] } |
        { data: ApiCategoryResponse[] }
      >(API_ENDPOINTS.marketplace.services.categories);
      
      let categories: ApiCategoryResponse[] = [];
      
      // Handle direct array response
      if (Array.isArray(response)) {
        categories = response;
      }
      // Handle { success: true, data: [...], summary: {...} } format (actual API format)
      else if ((response as any).success && (response as any).data && Array.isArray((response as any).data)) {
        categories = (response as { success: boolean; data: ApiCategoryResponse[] }).data;
      }
      // Handle { categories: [...] } format
      else if ((response as any).categories && Array.isArray((response as any).categories)) {
        categories = (response as { categories: ApiCategoryResponse[] }).categories;
      }
      // Handle { data: [...] } format
      else if ((response as any).data && Array.isArray((response as any).data)) {
        categories = (response as { data: ApiCategoryResponse[] }).data;
      }
      
      // Map API categories to ServiceCategory format (key -> id)
      return categories.map(mapApiCategoryToCategory);
    } catch (error: any) {
      if (error.status === 404) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get nearby services based on location
   * Public endpoint - no auth required
   * Uses the /api/marketplace/services/nearby endpoint
   * @param latitude - Latitude coordinate (required)
   * @param longitude - Longitude coordinate (required)
   * @param radius - Search radius in meters (default: 50000 = 50km)
   * @param filters - Optional filters (category, subcategory, price, rating, pagination)
   * @returns Array of services with distance information
   */
  static async getNearbyServices(
    latitude: number,
    longitude: number,
    radius: number = 50000, // Default 50km in meters
    filters?: {
      category?: string | string[];
      subcategory?: string | string[];
      minPrice?: number;
      maxPrice?: number;
      rating?: number;
      page?: number;
      limit?: number;
    }
  ): Promise<Service[]> {
    try {
      const params = new URLSearchParams();
      params.append('lat', latitude.toString());
      params.append('lng', longitude.toString());
      params.append('radius', radius.toString());
      
      // Add optional filters
      if (filters?.category) {
        if (Array.isArray(filters.category)) {
          filters.category.forEach(cat => params.append('category', cat));
        } else {
          params.append('category', filters.category);
        }
      }
      
      if (filters?.subcategory) {
        if (Array.isArray(filters.subcategory)) {
          filters.subcategory.forEach(subcat => params.append('subcategory', subcat));
        } else {
          params.append('subcategory', filters.subcategory);
        }
      }
      
      if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      if (filters?.rating !== undefined) params.append('rating', filters.rating.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const response = await apiClient.get<
        ApiServicesResponse | 
        Service[] | 
        { services: Service[]; data?: Service[] } |
        { success: boolean; data: ApiServiceResponse[] }
      >(`${API_ENDPOINTS.marketplace.services.nearby}?${params.toString()}`);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response.map((item: any) => 
          item._id ? mapApiServiceToService(item) : item
        );
      }
      
      // Handle { success: true, data: [...] } format
      if ((response as any).success && (response as any).data) {
        const apiResponse = response as ApiServicesResponse;
        if (Array.isArray(apiResponse.data)) {
          return apiResponse.data.map(mapApiServiceToService);
        }
      }
      
      // Handle { services: [...] } format
      if ((response as any).services && Array.isArray((response as any).services)) {
        return (response as any).services.map((item: any) => 
          item._id ? mapApiServiceToService(item) : item
        );
      }
      
      // Handle { data: [...] } format
      if ((response as any).data && Array.isArray((response as any).data)) {
        return (response as any).data.map((item: any) => 
          item._id ? mapApiServiceToService(item) : item
        );
      }
      
      return [];
    } catch (error: any) {
      if (error.status === 404) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Create a new booking
   * Authenticated endpoint
   */
  static async createBooking(booking: Partial<Booking> & {
    serviceId: string;
    providerId: string;
    scheduledDate: Date | string;
    address: {
      street: string;
      city: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    notes?: string;
  }): Promise<Booking> {
    try {
      // Ensure scheduledDate is properly formatted
      const bookingData = {
        ...booking,
        scheduledDate: booking.scheduledDate instanceof Date 
          ? booking.scheduledDate.toISOString() 
          : booking.scheduledDate,
      };
      
      const response = await apiClient.post<Booking>(API_ENDPOINTS.marketplace.bookings.create, bookingData);
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get user's bookings
   * Authenticated endpoint
   */
  static async getBookings(userId?: string): Promise<Booking[]> {
    try {
      const params = userId ? new URLSearchParams({ userId }) : '';
      const url = `${API_ENDPOINTS.marketplace.myBookings.list}${params ? `?${params.toString()}` : ''}`;
      
      const response = await apiClient.get<Booking[] | { bookings: Booking[] }>(url);
      
      // Handle both array response and object response
      if (Array.isArray(response)) {
        return response;
      }
      return (response as any).bookings || [];
    } catch (error: any) {
      if (error.status === 404) {
        return [];
      }
      throw error;
    }
  }

  static async getServiceReviews(serviceId: string, page: number = 1, limit: number = 10): Promise<{ reviews: Review[]; hasMore: boolean }> {
    try {
      const response = await apiClient.get<{ reviews: Review[]; hasMore: boolean }>(
        `${API_ENDPOINTS.marketplace.services.reviews(serviceId)}?page=${page}&limit=${limit}`
      );
      return response;
    } catch (error: any) {
      // If endpoint doesn't exist yet, return empty array
      if (error.status === 404) {
        return { reviews: [], hasMore: false };
      }
      throw error;
    }
  }

  static async createService(serviceData: Partial<Service & { duration?: number; serviceArea?: { cities: string[]; radius: number }; status?: 'draft' | 'published' }>): Promise<Service> {
    const response = await apiClient.post<Service>(API_ENDPOINTS.marketplace.serviceManagement.create, serviceData);
    return response;
  }

  static async updateService(id: string, serviceData: Partial<Service & { duration?: number; serviceArea?: { cities: string[]; radius: number }; status?: 'draft' | 'published' }>): Promise<Service> {
    const response = await apiClient.put<Service>(API_ENDPOINTS.marketplace.serviceManagement.update(id), serviceData);
    return response;
  }

  static async deleteService(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.marketplace.serviceManagement.delete(id));
  }

  static async uploadServiceImages(serviceId: string, images: string[]): Promise<string[]> {
    const formData = new FormData();
    
    images.forEach((imageUri, index) => {
      const uriWithoutQuery = imageUri.split('?')[0];
      const uriParts = uriWithoutQuery.split('.');
      const fileType = uriParts[uriParts.length - 1] || 'jpg';
      const mimeType = `image/${fileType === 'jpg' ? 'jpeg' : fileType}`;
      
      formData.append('images', {
        uri: imageUri,
        type: mimeType,
        name: `image_${index}.${fileType}`,
      } as any);
    });

    const response = await apiClient.post<{ images: string[] }>(
      API_ENDPOINTS.marketplace.serviceManagement.uploadImages(serviceId),
      formData
    );
    return response.images;
  }

  static async generateDescription(prompt: string): Promise<string> {
    try {
      const response = await apiClient.post<{ description: string }>(
        API_ENDPOINTS.ai.marketplace.descriptionGenerator,
        { prompt }
      );
      return response.description;
    } catch (error: any) {
      // If AI endpoint doesn't exist, return empty string
      if (error.status === 404) {
        return '';
      }
      throw error;
    }
  }

  // Booking methods
  static async getBooking(id: string): Promise<Booking | null> {
    try {
      const response = await apiClient.get<Booking>(API_ENDPOINTS.marketplace.bookings.getById(id));
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  static async updateBookingStatus(id: string, status: Booking['status']): Promise<Booking> {
    const response = await apiClient.put<Booking>(API_ENDPOINTS.marketplace.bookings.updateStatus(id), { status });
    return response;
  }

  static async uploadBookingPhotos(bookingId: string, photos: string[]): Promise<string[]> {
    const formData = new FormData();
    
    photos.forEach((photoUri, index) => {
      const uriWithoutQuery = photoUri.split('?')[0];
      const uriParts = uriWithoutQuery.split('.');
      const fileType = uriParts[uriParts.length - 1] || 'jpg';
      const mimeType = `image/${fileType === 'jpg' ? 'jpeg' : fileType}`;
      
      formData.append('photos', {
        uri: photoUri,
        type: mimeType,
        name: `photo_${index}.${fileType}`,
      } as any);
    });

    const response = await apiClient.post<{ photos: string[] }>(
      API_ENDPOINTS.marketplace.bookings.uploadPhotos(bookingId),
      formData
    );
    return response.photos;
  }

  static async submitBookingReview(bookingId: string, review: { rating: number; comment?: string }): Promise<Review> {
    const response = await apiClient.post<Review>(API_ENDPOINTS.marketplace.bookings.submitReview(bookingId), review);
    return response;
  }

  static async cancelBooking(id: string): Promise<Booking> {
    const response = await apiClient.put<Booking>(API_ENDPOINTS.marketplace.bookings.updateStatus(id), { status: 'cancelled' });
    return response;
  }

  // Provider methods
  static async getProviders(filters?: { search?: string; category?: string; page?: number }): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.page) params.append('page', filters.page.toString());
      
      const queryString = params.toString();
      const url = `${API_ENDPOINTS.marketplace.providers.list}${queryString ? `?${queryString}` : ''}`;
      const response = await apiClient.get<any[]>(url);
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        return [];
      }
      throw error;
    }
  }

  static async getProvider(id: string): Promise<any> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.marketplace.providers.getById(id));
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  static async getProviderServices(providerId: string): Promise<Service[]> {
    try {
      const response = await apiClient.get<ApiServicesResponse | Service[] | { data: Service[] }>(
        API_ENDPOINTS.marketplace.providers.services(providerId)
      );
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response.map((item: any) => 
          item._id ? mapApiServiceToService(item) : item
        );
      }
      
      // Handle { success, data, pagination } format
      if ((response as any).success && (response as any).data) {
        const apiResponse = response as ApiServicesResponse;
        if (Array.isArray(apiResponse.data)) {
          return apiResponse.data.map(mapApiServiceToService);
        }
      }
      
      // Handle { data: [...] } format
      if ((response as any).data && Array.isArray((response as any).data)) {
        return (response as any).data.map((item: any) => 
          item._id ? mapApiServiceToService(item) : item
        );
      }
      
      return [];
    } catch (error: any) {
      if (error.status === 404) {
        return [];
      }
      throw error;
    }
  }

  static async getMyServices(): Promise<Service[]> {
    try {
      const response = await apiClient.get<ApiServicesResponse | Service[] | { data: Service[] }>(
        API_ENDPOINTS.marketplace.myServices.list
      );
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response.map((item: any) => 
          item._id ? mapApiServiceToService(item) : item
        );
      }
      
      // Handle { success, data, pagination } format
      if ((response as any).success !== undefined) {
        const apiResponse = response as ApiServicesResponse;
        
        // Handle nested structure: { success: true, data: { services: [...], pagination: {...}, stats: {...} } }
        if (apiResponse.data && typeof apiResponse.data === 'object' && !Array.isArray(apiResponse.data)) {
          const nestedData = apiResponse.data as { services?: ApiServiceResponse[]; pagination?: any; stats?: any };
          if (nestedData.services && Array.isArray(nestedData.services)) {
            return nestedData.services.map(mapApiServiceToService);
          }
          // If nested data exists but services is empty or missing, return empty array
          return [];
        }
        
        // Handle direct array: { success: true, data: [...] }
        if (apiResponse.data && Array.isArray(apiResponse.data)) {
          return apiResponse.data.map(mapApiServiceToService);
        }
        
        // If success is true but data is missing or not an array, return empty
        if (apiResponse.success && !apiResponse.data) {
          return [];
        }
      }
      
      // Handle { data: { services: [...] } } format (without success field)
      if ((response as any).data !== undefined) {
        const data = (response as any).data;
        
        // Handle nested: { data: { services: [...] } }
        if (data && typeof data === 'object' && !Array.isArray(data) && data.services) {
          if (Array.isArray(data.services)) {
            return data.services.map((item: any) => 
              item._id ? mapApiServiceToService(item) : item
            );
          }
        }
        
        // Handle direct array: { data: [...] }
        if (Array.isArray(data)) {
          return data.map((item: any) => 
            item._id ? mapApiServiceToService(item) : item
          );
        }
      }
      
      // If response structure is unexpected, return empty array
      // (This should rarely happen as we handle most common formats above)
      return [];
    } catch (error: any) {
      console.error('Error fetching my services:', error);
      if (error.status === 404) {
        return [];
      }
      throw error;
    }
  }

  static async getProviderReviews(providerId: string, page: number = 1, limit: number = 10): Promise<{ reviews: Review[]; hasMore: boolean }> {
    try {
      const response = await apiClient.get<{ reviews: Review[]; hasMore: boolean }>(
        `${API_ENDPOINTS.marketplace.providers.reviews(providerId)}?page=${page}&limit=${limit}`
      );
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        return { reviews: [], hasMore: false };
      }
      throw error;
    }
  }

  // PayPal Integration
  static async createPayPalOrder(bookingId: string, amount: number): Promise<{ orderId: string; approvalUrl: string }> {
    const response = await apiClient.post<{ orderId: string; approvalUrl: string }>(
      API_ENDPOINTS.marketplace.payments.createPayPalOrder,
      { bookingId, amount }
    );
    return response;
  }

  static async approvePayPalOrder(orderId: string): Promise<Booking> {
    const response = await apiClient.post<Booking>(
      API_ENDPOINTS.marketplace.payments.approvePayPalOrder,
      { orderId }
    );
    return response;
  }

  static async getPayPalOrderDetails(orderId: string): Promise<any> {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.marketplace.payments.getPayPalOrder(orderId)
    );
    return response;
  }

  // AI Features
  static async naturalLanguageSearch(query: string): Promise<Service[]> {
    try {
      const response = await apiClient.post<{ services: Service[] }>(
        API_ENDPOINTS.ai.marketplace.recommendations,
        { query }
      );
      return response.services;
    } catch (error: any) {
      if (error.status === 404) {
        return [];
      }
      throw error;
    }
  }

  static async estimatePrice(serviceData: { title: string; category: string; description?: string }): Promise<{ estimatedPrice: number; priceRange: { min: number; max: number } }> {
    const response = await apiClient.post<{ estimatedPrice: number; priceRange: { min: number; max: number } }>(
      API_ENDPOINTS.ai.marketplace.priceEstimator,
      serviceData
    );
    return response;
  }

  static async optimizePricing(serviceId: string): Promise<{ suggestedPrice: number; reasoning: string; marketAnalysis: any }> {
    const response = await apiClient.post<{ suggestedPrice: number; reasoning: string; marketAnalysis: any }>(
      API_ENDPOINTS.ai.marketplace.pricingOptimizer,
      { serviceId }
    );
    return response;
  }

  static async analyzeReviewSentiment(reviewId: string): Promise<{ sentiment: 'positive' | 'neutral' | 'negative'; score: number; keywords: string[] }> {
    try {
      const response = await apiClient.post<{ sentiment: 'positive' | 'neutral' | 'negative'; score: number; keywords: string[] }>(
        API_ENDPOINTS.ai.marketplace.reviewSentiment,
        { reviewId }
      );
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        return { sentiment: 'neutral', score: 0, keywords: [] };
      }
      throw error;
    }
  }
}

