import type { Booking, Service, ServiceCategory } from '@localpro/types';
import React, { useEffect, useRef, useState } from 'react';
import { MarketplaceService } from './services';

export const useServices = (filters?: any) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const previousFiltersRef = useRef<string>('');
  const isInitialMount = useRef(true);
  const filtersRef = useRef<any>(filters);

  // Update filters ref when filters change
  filtersRef.current = filters;

  useEffect(() => {
    let isMounted = true;
    let shouldFetch = false;
    
    // Serialize filters for comparison (only when needed, not in dependency)
    const filtersKey = JSON.stringify(filtersRef.current || {});
    
    // On initial mount, always fetch
    if (isInitialMount.current) {
      isInitialMount.current = false;
      shouldFetch = true;
      previousFiltersRef.current = filtersKey;
    } else {
      // On subsequent renders, only fetch if filters actually changed
      if (filtersKey !== previousFiltersRef.current) {
        shouldFetch = true;
        previousFiltersRef.current = filtersKey;
      }
    }
    
    if (!shouldFetch) {
      return;
    }
    
    // Set loading state - but don't clear existing services
    // This prevents the empty state flash when filters change
    setLoading(true);
    setError(null);
    
    MarketplaceService.getServices(filtersRef.current)
      .then((data) => {
        // Only update state if component is still mounted
        if (isMounted) {
          setServices(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setLoading(false);
          // Don't clear services on error - keep previous data
          console.error('Error fetching services:', err);
        }
      });

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [filters]); // Depend on filters object reference (memoized in parent)

  return { services, loading, error };
};

export const useService = (id: string) => {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    MarketplaceService.getService(id)
      .then((data) => {
        setService(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [id]);

  return { service, loading, error };
};

export const useBookings = (userId: string) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    MarketplaceService.getBookings(userId).then((data) => {
      setBookings(data);
      setLoading(false);
    });
  }, [userId]);

  return { bookings, loading };
};

export const useProviders = (filters?: any) => {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    MarketplaceService.getProviders(filters).then((data) => {
      setProviders(data);
      setLoading(false);
    });
  }, [filters]);

  return { providers, loading };
};

export const useMyServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    MarketplaceService.getMyServices()
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching my services:', error);
        setServices([]);
        setLoading(false);
      });
  }, []);

  return { services, loading };
};

export const useCategories = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    setLoading(true);
    setError(null);
    
    MarketplaceService.getCategories()
      .then((data) => {
        if (isMounted) {
          setCategories(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setLoading(false);
          console.error('Error fetching categories:', err);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { categories, loading, error };
};

export const useNearbyServices = (
  latitude: number | undefined,
  longitude: number | undefined,
  radius: number = 50000,
  filters?: {
    category?: string | string[];
    subcategory?: string | string[];
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    page?: number;
    limit?: number;
  }
) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Don't fetch if coordinates are not available
    if (latitude === undefined || longitude === undefined) {
      if (isMounted) {
        setServices([]);
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);

    MarketplaceService.getNearbyServices(latitude, longitude, radius, filters)
      .then((data) => {
        if (isMounted) {
          setServices(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setLoading(false);
          console.error('Error fetching nearby services:', err);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [latitude, longitude, radius, JSON.stringify(filters)]);

  return { services, loading, error };
};

