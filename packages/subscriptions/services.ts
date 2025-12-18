import type { Subscription, SubscriptionPlan } from '@localpro/types';

export class SubscriptionsService {
  static async getPlans(): Promise<SubscriptionPlan[]> {
    // TODO: Implement API call
    return [];
  }

  static async getSubscription(userId: string): Promise<Subscription | null> {
    // TODO: Implement API call
    return null;
  }

  static async subscribe(userId: string, planId: string): Promise<Subscription> {
    // TODO: Implement API call
    throw new Error('Not implemented');
  }

  static async cancelSubscription(subscriptionId: string): Promise<void> {
    // TODO: Implement API call
    throw new Error('Not implemented');
  }
}

