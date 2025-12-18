import type { Partner, Partnership } from '@localpro/types';

export class PartnersService {
  static async getPartners(filters?: any): Promise<Partner[]> {
    // TODO: Implement API call
    return [];
  }

  static async getPartner(id: string): Promise<Partner | null> {
    // TODO: Implement API call
    return null;
  }

  static async getPartnerships(userId?: string): Promise<Partnership[]> {
    // TODO: Implement API call
    return [];
  }
}

