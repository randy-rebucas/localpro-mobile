import type { Booking, Service } from '@localpro/types';
import { useEffect, useState } from 'react';
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

