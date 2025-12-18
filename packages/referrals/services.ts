import type { Referral, ReferralProgram } from '@localpro/types';

export class ReferralsService {
  static async getReferralCode(userId: string): Promise<string> {
    // TODO: Implement API call
    return '';
  }

  static async getReferrals(userId: string): Promise<Referral[]> {
    // TODO: Implement API call
    return [];
  }

  static async getPrograms(): Promise<ReferralProgram[]> {
    // TODO: Implement API call
    return [];
  }
}

