// API Configuration

export const API_CONFIG = {
  baseURL: 'https://localpro-super-app.onrender.com',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    // Public endpoints
    sendCode: '/api/auth/send-code',
    verifyCode: '/api/auth/verify-code',
    // Protected endpoints
    register: '/api/auth/register',
    getProfile: '/api/auth/profile',
    completeOnboarding: '/api/auth/complete-onboarding',
    getProfileCompletionStatus: '/api/auth/profile-completion-status',
    getProfileCompleteness: '/api/auth/profile-completeness',
    getCurrentUser: '/api/auth/me',
    updateProfile: '/api/auth/profile',
    uploadAvatar: '/api/auth/upload-avatar',
    uploadPortfolio: '/api/auth/upload-portfolio',
    logout: '/api/auth/logout',
    // Legacy endpoints (for backward compatibility)
    sendOTP: '/api/auth/send-code',
    verifyOTP: '/api/auth/verify-code',
  },
  // Notification endpoints
  notifications: {
    // Get user notifications (paginated)
    getNotifications: '/api/notifications',
    // Get unread notification count
    getUnreadCount: '/api/notifications/unread-count',
    // Mark a notification as read
    markAsRead: (id: string) => `/api/notifications/${id}/read`,
    // Mark all notifications as read
    markAllAsRead: '/api/notifications/read-all',
    // Delete a notification
    deleteNotification: (id: string) => `/api/notifications/${id}`,
    // Delete all notifications (optional: ?readOnly=true)
    deleteAll: '/api/notifications',
    // Get notification settings/preferences
    getSettings: '/api/notifications/settings',
    // Update notification settings/preferences
    updateSettings: '/api/notifications/settings',
    // Check if notification type is enabled
    checkType: (type: string) => `/api/notifications/check/${type}`,
    // Send test notification to current user
    sendTest: '/api/notifications/test',
  },
} as const;

