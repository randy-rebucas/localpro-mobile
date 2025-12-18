import type { Agency, AgencyMember } from '@localpro/types';

export class AgenciesService {
  static async getAgencies(filters?: any): Promise<Agency[]> {
    // TODO: Implement API call
    return [];
  }

  static async getAgency(id: string): Promise<Agency | null> {
    // TODO: Implement API call
    return null;
  }

  static async joinAgency(agencyId: string, userId: string): Promise<AgencyMember> {
    // TODO: Implement API call
    throw new Error('Not implemented');
  }
}

