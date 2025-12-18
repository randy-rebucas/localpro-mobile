import { useState, useEffect } from 'react';
import type { Service, Booking } from '@localpro/types';
import { MarketplaceService } from './services';

export const useServices = (filters?: any) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    MarketplaceService.getServices(filters).then((data) => {
      setServices(data);
      setLoading(false);
    });
  }, [filters]);

  return { services, loading };
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

