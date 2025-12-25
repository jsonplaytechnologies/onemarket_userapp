/**
 * API Constants
 * Base URL and endpoint definitions for the One Market API
 */

// API Base URL - update this for different environments
export const API_BASE_URL = 'http://192.168.29.101:5000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  SEND_OTP: '/api/auth/send-otp',
  VERIFY_OTP: '/api/auth/verify-otp',
  SIGNUP: '/api/auth/signup',
  REFRESH_TOKEN: '/api/auth/refresh-token',
  ME: '/api/auth/me',
  LOGOUT: '/api/auth/logout',

  // User
  USER_PROFILE: '/api/users/me',
  USER_ADDRESSES: '/api/users/me/addresses',
  USER_ADDRESSES_RECENT: '/api/users/me/addresses/recent',
  CONVERSATIONS: '/api/users/me/conversations',

  // Notifications
  NOTIFICATIONS: '/api/notifications',
  NOTIFICATIONS_UNREAD_COUNT: '/api/notifications/unread-count',
  NOTIFICATIONS_READ_ALL: '/api/notifications/read-all',

  // Services
  SERVICE_CATEGORIES: '/api/services/categories',
  SEARCH_SERVICES: '/api/services/search',
  CATEGORY_SERVICES: (categoryId) => `/api/services/categories/${categoryId}/services`,
  SERVICE_QUESTIONS: (serviceId) => `/api/services/${serviceId}/questions`,

  // Pros (Service Providers)
  SEARCH_PROS: '/api/pros/search',
  PRO_PROFILE: (proId) => `/api/pros/${proId}`,
  PRO_SERVICES: (proId) => `/api/pros/${proId}/services`,
  PRO_REVIEWS: (proId) => `/api/reviews/pro/${proId}`,
  PRO_AVAILABLE_SLOTS: (proId) => `/api/pros/${proId}/available-slots`,
  PRO_IS_AVAILABLE_NOW: (proId) => `/api/pros/${proId}/is-available-now`,

  // Bookings
  BOOKINGS: '/api/bookings',
  BOOKINGS_V2: '/api/bookings/v2',
  BOOKING_DURATION_OPTIONS: '/api/bookings/duration-options',
  BOOKING_DETAILS: (bookingId) => `/api/bookings/${bookingId}`,
  BOOKING_HISTORY: (bookingId) => `/api/bookings/${bookingId}/history`,
  BOOKING_ANSWERS: (bookingId) => `/api/bookings/${bookingId}/answers`,
  BOOKING_PAY: (bookingId) => `/api/bookings/${bookingId}/pay`,
  BOOKING_PAYMENT_STATUS: (bookingId) => `/api/bookings/${bookingId}/payment-status`,
  BOOKING_CANCEL: (bookingId) => `/api/bookings/${bookingId}/cancel`,
  BOOKING_CONFIRM_START: (bookingId) => `/api/bookings/${bookingId}/confirm-start`,
  BOOKING_CONFIRM_COMPLETE: (bookingId) => `/api/bookings/${bookingId}/confirm-complete`,
  BOOKING_ACCEPT_SCOPE: (bookingId) => `/api/bookings/${bookingId}/accept-scope`,
  BOOKING_DECLINE_SCOPE: (bookingId) => `/api/bookings/${bookingId}/decline-scope`,
  BOOKING_MESSAGES: (bookingId) => `/api/bookings/${bookingId}/messages`,
  BOOKING_MESSAGES_IMAGE: (bookingId) => `/api/bookings/${bookingId}/messages/image`,
  BOOKING_MESSAGES_READ: (bookingId) => `/api/bookings/${bookingId}/messages/read`,

  // Reviews
  REVIEWS: '/api/reviews',

  // Zones
  ZONES: '/api/zones',
  ZONES_ALL: '/api/zones/all',

  // Businesses
  BUSINESSES: '/api/businesses',
  BUSINESS_CATEGORIES: '/api/businesses/categories',
  BUSINESS_DETAILS: (businessId) => `/api/businesses/${businessId}`,
};
