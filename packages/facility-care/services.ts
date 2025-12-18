import type { Facility, FacilityService, FacilityBooking } from '@localpro/types';

export class FacilityCareService {
  static async getFacilities(filters?: any): Promise<Facility[]> {
    // TODO: Implement API call
    return [];
  }

  static async getFacility(id: string): Promise<Facility | null> {
    // TODO: Implement API call
    return null;
  }

  static async getFacilityServices(facilityId: string): Promise<FacilityService[]> {
    // TODO: Implement API call
    return [];
  }

  static async createBooking(booking: Partial<FacilityBooking>): Promise<FacilityBooking> {
    // TODO: Implement API call
    throw new Error('Not implemented');
  }
}

