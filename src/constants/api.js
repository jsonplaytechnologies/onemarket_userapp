export const API_BASE_URL = 'https://onemarketbackend-production.up.railway.app';

export const API_ENDPOINTS = {
  // Auth
  SEND_OTP: '/api/auth/send-otp',
  VERIFY_OTP: '/api/auth/verify-otp',
  SIGNUP: '/api/auth/signup',
  ME: '/api/auth/me',

  // Users
  USER_PROFILE: '/api/users/me',
  USER_ADDRESSES: '/api/users/me/addresses',

  // Services
  SERVICE_CATEGORIES: '/api/services/categories',
  CATEGORY_SERVICES: (categoryId) =>
    `/api/services/categories/${categoryId}/services`,
  SEARCH_SERVICES: '/api/services/search',

  // Pros
  SEARCH_PROS: '/api/pros/search',
  PRO_PROFILE: (proId) => `/api/pros/${proId}`,

  // Bookings
  BOOKINGS: '/api/bookings',
  BOOKING_DETAILS: (id) => `/api/bookings/${id}`,
  BOOKING_HISTORY: (id) => `/api/bookings/${id}/history`,
  BOOKING_CANCEL: (id) => `/api/bookings/${id}/cancel`,
  BOOKING_PAY: (id) => `/api/bookings/${id}/pay`,
  BOOKING_PAYMENT_STATUS: (id) => `/api/bookings/${id}/payment-status`,
  BOOKING_MESSAGES: (id) => `/api/bookings/${id}/messages`,
  BOOKING_MESSAGES_IMAGE: (id) => `/api/bookings/${id}/messages/image`,
  BOOKING_MESSAGES_READ: (id) => `/api/bookings/${id}/messages/read`,
  BOOKING_CONFIRM_START: (id) => `/api/bookings/${id}/confirm-start`,
  BOOKING_CONFIRM_COMPLETE: (id) => `/api/bookings/${id}/confirm-complete`,

  // Reviews
  REVIEWS: '/api/reviews',
  PRO_REVIEWS: (proId) => `/api/reviews/pro/${proId}`,

  // Notifications
  NOTIFICATIONS: '/api/notifications',
  NOTIFICATIONS_UNREAD_COUNT: '/api/notifications/unread-count',
  NOTIFICATION_READ: (id) => `/api/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: '/api/notifications/read-all',

  // Conversations/Chats
  CONVERSATIONS: '/api/users/me/conversations',

  // Zones
  ZONES: '/api/zones',
  ZONES_ALL: '/api/zones/all',
  ZONE_SUBZONES: (zoneId) => `/api/zones/${zoneId}/sub-zones`,

  // Businesses
  BUSINESS_CATEGORIES: '/api/businesses/categories',
  BUSINESSES: '/api/businesses',
  BUSINESS_DETAILS: (id) => `/api/businesses/${id}`,
};
