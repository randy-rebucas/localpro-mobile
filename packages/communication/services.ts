import { API_ENDPOINTS, apiClient } from '@localpro/api';
import type { Chat, Message, Notification, NotificationSettings, PaginatedResponse } from '@localpro/types';

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: string;
}

export class CommunicationService {
  static async getChats(userId: string): Promise<Chat[]> {
    // TODO: Implement API call
    return [];
  }

  static async getMessages(chatId: string): Promise<Message[]> {
    // TODO: Implement API call
    return [];
  }

  static async sendMessage(message: Partial<Message>): Promise<Message> {
    // TODO: Implement API call
    throw new Error('Not implemented');
  }

  /**
   * Get user notifications (paginated)
   * GET /api/notifications
   */
  static async getNotifications(params?: GetNotificationsParams): Promise<PaginatedResponse<Notification>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.read !== undefined) queryParams.append('read', params.read.toString());
    if (params?.type) queryParams.append('type', params.type);

    const queryString = queryParams.toString();
    const endpoint = `${API_ENDPOINTS.notifications.getNotifications}${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<PaginatedResponse<Notification>>(endpoint);
  }

  /**
   * Get unread notification count
   * GET /api/notifications/unread-count
   */
  static async getUnreadCount(): Promise<{ count: number }> {
    return apiClient.get<{ count: number }>(API_ENDPOINTS.notifications.getUnreadCount);
  }

  /**
   * Mark a notification as read
   * PUT /api/notifications/:id/read
   */
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    await apiClient.put(API_ENDPOINTS.notifications.markAsRead(notificationId));
  }

  /**
   * Mark all notifications as read
   * PUT /api/notifications/read-all
   */
  static async markAllAsRead(): Promise<void> {
    await apiClient.put(API_ENDPOINTS.notifications.markAllAsRead);
  }

  /**
   * Delete a notification
   * DELETE /api/notifications/:id
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.notifications.deleteNotification(notificationId));
  }

  /**
   * Delete all notifications (optional: ?readOnly=true)
   * DELETE /api/notifications
   */
  static async deleteAllNotifications(readOnly?: boolean): Promise<void> {
    const endpoint = readOnly 
      ? `${API_ENDPOINTS.notifications.deleteAll}?readOnly=true` 
      : API_ENDPOINTS.notifications.deleteAll;
    await apiClient.delete(endpoint);
  }

  /**
   * Get notification settings/preferences
   * GET /api/notifications/settings
   */
  static async getNotificationSettings(): Promise<NotificationSettings> {
    return apiClient.get<NotificationSettings>(API_ENDPOINTS.notifications.getSettings);
  }

  /**
   * Update notification settings/preferences
   * PUT /api/notifications/settings
   */
  static async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    return apiClient.put<NotificationSettings>(API_ENDPOINTS.notifications.updateSettings, settings);
  }

  /**
   * Check if notification type is enabled
   * GET /api/notifications/check/:type
   */
  static async checkNotificationType(type: string): Promise<{ enabled: boolean }> {
    return apiClient.get<{ enabled: boolean }>(API_ENDPOINTS.notifications.checkType(type));
  }

  /**
   * Send test notification to current user
   * POST /api/notifications/test
   */
  static async sendTestNotification(): Promise<Notification> {
    return apiClient.post<Notification>(API_ENDPOINTS.notifications.sendTest);
  }
}

