import type { Chat, Message, Notification } from '@localpro/types';

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

  static async getNotifications(userId: string): Promise<Notification[]> {
    // TODO: Implement API call
    return [];
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    // TODO: Implement API call
    throw new Error('Not implemented');
  }
}

