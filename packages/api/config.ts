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
  // Marketplace endpoints
  marketplace: {
    // Public endpoints (no auth required)
    services: {
      // List services with filters
      list: '/api/marketplace/services',
      // Get service categories
      categories: '/api/marketplace/services/categories',
      // Location-based search
      nearby: '/api/marketplace/services/nearby',
      // Get single service by ID
      getById: (id: string) => `/api/marketplace/services/${id}`,
      // Get service reviews
      reviews: (id: string) => `/api/marketplace/services/${id}/reviews`,
    },
    providers: {
      // List providers with filters
      list: '/api/marketplace/providers',
      // Get provider by ID
      getById: (id: string) => `/api/marketplace/providers/${id}`,
      // Get provider's services
      services: (id: string) => `/api/marketplace/providers/${id}/services`,
      // Get provider reviews
      reviews: (id: string) => `/api/marketplace/providers/${id}/reviews`,
    },
    // Authenticated endpoints (auth required)
    myServices: {
      // Get user's services (provider)
      list: '/api/marketplace/my-services',
    },
    myBookings: {
      // Get user's bookings
      list: '/api/marketplace/my-bookings',
    },
    serviceManagement: {
      // Create service
      create: '/api/marketplace/services',
      // Update service
      update: (id: string) => `/api/marketplace/services/${id}`,
      // Delete service
      delete: (id: string) => `/api/marketplace/services/${id}`,
      // Upload service images
      uploadImages: (id: string) => `/api/marketplace/services/${id}/images`,
    },
    bookings: {
      // Create booking
      create: '/api/marketplace/bookings',
      // Get booking by ID
      getById: (id: string) => `/api/marketplace/bookings/${id}`,
      // Update booking status
      updateStatus: (id: string) => `/api/marketplace/bookings/${id}/status`,
      // Upload booking photos
      uploadPhotos: (id: string) => `/api/marketplace/bookings/${id}/photos`,
      // Submit booking review
      submitReview: (id: string) => `/api/marketplace/bookings/${id}/review`,
    },
    payments: {
      // PayPal endpoints
      // Create PayPal order
      createPayPalOrder: '/api/marketplace/bookings/paypal/create',
      // Approve PayPal order
      approvePayPalOrder: '/api/marketplace/bookings/paypal/approve',
      // Get PayPal order details
      getPayPalOrder: (orderId: string) => `/api/marketplace/bookings/paypal/order/${orderId}`,
      // PayMongo endpoints (supports cards, banks, GCash, Maya)
      // Base path: /api/paymongo
      // Create payment intent (creates authorization/hold for escrow)
      createPayMongoIntent: '/api/paymongo/create-intent',
      // Get payment intent details
      getPayMongoIntent: (intentId: string) => `/api/paymongo/intent/${intentId}`,
      // Confirm payment (attaches payment method and creates escrow)
      confirmPayMongoPayment: '/api/paymongo/confirm-payment',
      // Get charge details
      getPayMongoCharge: (chargeId: string) => `/api/paymongo/charge/${chargeId}`,
      // Create refund
      createPayMongoRefund: '/api/paymongo/refund',
      // Get refund details
      getPayMongoRefund: (refundId: string) => `/api/paymongo/refund/${refundId}`,
      // Admin endpoints
      // List payment intents (admin only)
      listPayMongoIntents: '/api/paymongo/intents',
      // List charges (admin only)
      listPayMongoCharges: '/api/paymongo/charges',
    },
  },
  // AI Marketplace endpoints
  ai: {
    marketplace: {
      // Generate service description
      descriptionGenerator: '/api/ai/marketplace/description-generator',
      // Natural language search/recommendations
      recommendations: '/api/ai/marketplace/recommendations',
      // Price estimation
      priceEstimator: '/api/ai/marketplace/price-estimator',
      // Pricing optimization
      pricingOptimizer: '/api/ai/marketplace/pricing-optimizer',
      // Review sentiment analysis
      reviewSentiment: '/api/ai/marketplace/review-sentiment',
    },
  },
} as const;

