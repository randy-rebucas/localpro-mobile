import { apiClient } from '@localpro/api';
import type { Booking, Review, Service, ServiceCategory } from '@localpro/types';

export class MarketplaceService {
  static async getServices(filters?: any): Promise<Service[]> {
    // TODO: Implement API call
    return [];
  }

  static async getService(id: string): Promise<Service | null> {
    // TODO: Implement API call
    return null;
  }

  static async createBooking(booking: Partial<Booking>): Promise<Booking> {
    // TODO: Implement API call
    throw new Error('Not implemented');
  }

  static async getBookings(userId: string): Promise<Booking[]> {
    // TODO: Implement API call
    return [];
  }

  static async getCategories(): Promise<ServiceCategory[]> {
    // TODO: Implement API call
    return [];
  }

  static async getServiceReviews(serviceId: string, page: number = 1, limit: number = 10): Promise<{ reviews: Review[]; hasMore: boolean }> {
    try {
      const response = await apiClient.get<{ reviews: Review[]; hasMore: boolean }>(
        `/api/marketplace/services/${serviceId}/reviews?page=${page}&limit=${limit}`
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
    const response = await apiClient.post<Service>('/api/marketplace/services', serviceData);
    return response;
  }

  static async updateService(id: string, serviceData: Partial<Service & { duration?: number; serviceArea?: { cities: string[]; radius: number }; status?: 'draft' | 'published' }>): Promise<Service> {
    const response = await apiClient.put<Service>(`/api/marketplace/services/${id}`, serviceData);
    return response;
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
      `/api/marketplace/services/${serviceId}/images`,
      formData
    );
    return response.images;
  }

  static async generateDescription(prompt: string): Promise<string> {
    try {
      const response = await apiClient.post<{ description: string }>(
        '/api/ai/marketplace/description-generator',
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
      const response = await apiClient.get<Booking>(`/api/marketplace/bookings/${id}`);
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  static async updateBookingStatus(id: string, status: Booking['status']): Promise<Booking> {
    const response = await apiClient.put<Booking>(`/api/marketplace/bookings/${id}/status`, { status });
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
      `/api/marketplace/bookings/${bookingId}/photos`,
      formData
    );
    return response.photos;
  }

  static async submitBookingReview(bookingId: string, review: { rating: number; comment?: string }): Promise<Review> {
    const response = await apiClient.post<Review>(`/api/marketplace/bookings/${bookingId}/review`, review);
    return response;
  }

  static async cancelBooking(id: string): Promise<Booking> {
    const response = await apiClient.put<Booking>(`/api/marketplace/bookings/${id}/status`, { status: 'cancelled' });
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
      const url = `/api/marketplace/providers${queryString ? `?${queryString}` : ''}`;
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
      const response = await apiClient.get<any>(`/api/marketplace/providers/${id}`);
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
      const response = await apiClient.get<Service[]>(`/api/marketplace/providers/${providerId}/services`);
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        return [];
      }
      throw error;
    }
  }

  static async getProviderReviews(providerId: string, page: number = 1, limit: number = 10): Promise<{ reviews: Review[]; hasMore: boolean }> {
    try {
      const response = await apiClient.get<{ reviews: Review[]; hasMore: boolean }>(
        `/api/marketplace/providers/${providerId}/reviews?page=${page}&limit=${limit}`
      );
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        return { reviews: [], hasMore: false };
      }
      throw error;
    }
  }
}

