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
  // Health check endpoints
  root: '/', // Root endpoint health check
  // Health check endpoint
  health: '/health',
  // Base endpoints
  base: {
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
  },
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
    getNotifications: '/api/communication/notifications',
    // Get unread notification count
    getUnreadCount: '/api/communication/notifications/count',
    // Mark a notification as read
    markAsRead: (id: string) => `/api/communication/notifications/${id}/read`,
    // Mark all notifications as read
    markAllAsRead: '/api/communication/notifications/read-all',
    // Delete a notification
    deleteNotification: (id: string) => `/api/communication/notifications/${id}`,
    // Delete all notifications (optional: ?readOnly=true)
    deleteAll: '/api/communication/notifications',
    // Get notification settings/preferences
    getSettings: '/api/communication/notifications/settings',
    // Update notification settings/preferences
    updateSettings: '/api/communication/notifications/settings',
    // Check if notification type is enabled
    checkType: (type: string) => `/api/communication/notifications/check/${type}`,
    // Send test notification to current user
    sendTest: '/api/communication/notifications/test',
  },
} as const;

