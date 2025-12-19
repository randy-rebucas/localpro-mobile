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
   * GET /api/communication/notifications
   * Response: { success: true, count: number, total: number, page: number, pages: number, data: Notification[] }
   */
  static async getNotifications(params?: GetNotificationsParams): Promise<PaginatedResponse<Notification>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.read !== undefined) queryParams.append('read', params.read.toString());
    if (params?.type) queryParams.append('type', params.type);

    const queryString = queryParams.toString();
    const endpoint = `${API_ENDPOINTS.notifications.getNotifications}${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await apiClient.get<{
        success: boolean;
        count: number;
        total: number;
        page: number;
        pages: number;
        data: Notification[];
      }>(endpoint);

      console.log('Notifications API response:', response);

      // Transform API response to PaginatedResponse format
      const limit = params?.limit || 20;
      const currentPage = response?.page ?? 1;
      const totalPages = response?.pages ?? 0;
      const data = Array.isArray(response?.data) ? response.data : [];
      
      return {
        data,
        pagination: {
          page: currentPage,
          limit: limit,
          total: response?.total ?? 0,
          totalPages: totalPages,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1,
        },
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Return empty response on error
      const limit = params?.limit || 20;
      return {
        data: [],
        pagination: {
          page: params?.page || 1,
          limit: limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }

  /**
   * Get unread notification count
   * GET /api/communication/notifications/count?isRead=false
   * Response: { success: true, data: { count: number } }
   */
  static async getUnreadCount(): Promise<{ count: number }> {
    const endpoint = `${API_ENDPOINTS.notifications.getUnreadCount}?isRead=false`;
    const response = await apiClient.get<{ success: boolean; data: { count: number } }>(endpoint);
    // Extract count from wrapped response
    return { count: response.data?.count ?? 0 };
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

