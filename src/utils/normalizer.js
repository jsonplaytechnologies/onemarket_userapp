/**
 * Data Normalizer Utility
 *
 * Centralizes the conversion between backend snake_case and frontend camelCase.
 * Use these functions to normalize API responses before using them in components.
 *
 * This eliminates scattered field mappings like:
 *   booking?.first_name || booking?.firstName
 *
 * Instead, normalize once at the service layer:
 *   const normalizedBooking = normalizeBooking(apiResponse);
 *   // Now use: normalizedBooking.firstName (always camelCase)
 */

/**
 * Convert a snake_case string to camelCase
 * @param {string} str - Snake case string
 * @returns {string} Camel case string
 */
export const snakeToCamel = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Convert a camelCase string to snake_case
 * @param {string} str - Camel case string
 * @returns {string} Snake case string
 */
export const camelToSnake = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * Recursively convert all object keys from snake_case to camelCase
 * @param {any} obj - Object to convert
 * @returns {any} Converted object
 */
export const normalizeKeys = (obj) => {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(normalizeKeys);
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = snakeToCamel(key);
      acc[camelKey] = normalizeKeys(obj[key]);
      return acc;
    }, {});
  }

  return obj;
};

/**
 * Recursively convert all object keys from camelCase to snake_case
 * @param {any} obj - Object to convert
 * @returns {any} Converted object
 */
export const denormalizeKeys = (obj) => {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(denormalizeKeys);
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = camelToSnake(key);
      acc[snakeKey] = denormalizeKeys(obj[key]);
      return acc;
    }, {});
  }

  return obj;
};

/**
 * Normalize a booking object from API response
 * Handles both snake_case and camelCase inputs for backwards compatibility
 *
 * @param {Object} booking - Raw booking from API
 * @returns {Object} Normalized booking with consistent camelCase keys
 */
export const normalizeBooking = (booking) => {
  if (!booking) return null;

  // First, normalize all keys recursively
  const normalized = normalizeKeys(booking);

  // Ensure specific nested objects are properly normalized
  return {
    ...normalized,
    // Ensure ID is always present
    id: normalized.id || booking.id,
    // Booking identifiers
    bookingNumber: normalized.bookingNumber || booking.booking_number,
    bookingPath: normalized.bookingPath || booking.booking_path,
    // Status
    status: normalized.status || booking.status,
    currentLimboState: normalized.currentLimboState || booking.current_limbo_state,
    limboEnteredAt: normalized.limboEnteredAt || booking.limbo_entered_at,
    limboTimeoutAt: normalized.limboTimeoutAt || booking.limbo_timeout_at,
    // Timing
    isBookNow: normalized.isBookNow ?? booking.is_book_now,
    requestedDatetime: normalized.requestedDatetime || booking.requested_datetime,
    jobDurationMinutes: normalized.jobDurationMinutes || booking.job_duration_minutes,
    quotedDurationMinutes: normalized.quotedDurationMinutes || booking.quoted_duration_minutes,
    // Financial
    quotationAmount: normalized.quotationAmount || booking.quotation_amount,
    paidAmount: normalized.paidAmount || booking.paid_amount,
    commissionAmount: normalized.commissionAmount || booking.commission_amount,
    proEarnings: normalized.proEarnings || booking.pro_earnings,
    // Timestamps
    createdAt: normalized.createdAt || booking.created_at,
    updatedAt: normalized.updatedAt || booking.updated_at,
    paidAt: normalized.paidAt || booking.paid_at,
    completedAt: normalized.completedAt || booking.completed_at,
    quotationSentAt: normalized.quotationSentAt || booking.quotation_sent_at,
    waitingAcceptanceAt: normalized.waitingAcceptanceAt || booking.waiting_acceptance_at,
    scopeConfirmedAt: normalized.scopeConfirmedAt || booking.scope_confirmed_at,
    calendarLockedAt: normalized.calendarLockedAt || booking.calendar_locked_at,
    // References
    userId: normalized.userId || booking.user_id,
    proId: normalized.proId || booking.pro_id,
    serviceId: normalized.serviceId || booking.service_id,
    userAddressId: normalized.userAddressId || booking.user_address_id,
    paymentReference: normalized.paymentReference || booking.payment_reference,
    assignmentCount: normalized.assignmentCount || booking.assignment_count,
    // User note
    userNote: normalized.userNote || booking.user_note,
    // Normalize nested objects
    pro: normalizeProvider(normalized.pro || booking.pro),
    service: normalizeService(normalized.service || booking.service),
    address: normalizeAddress(normalized.address || booking.address),
  };
};

/**
 * Normalize a provider/pro object
 * @param {Object} provider - Raw provider from API
 * @returns {Object} Normalized provider
 */
export const normalizeProvider = (provider) => {
  if (!provider) return null;

  const normalized = normalizeKeys(provider);

  return {
    ...normalized,
    id: normalized.id || provider.id,
    userId: normalized.userId || provider.user_id,
    firstName: normalized.firstName || provider.first_name,
    lastName: normalized.lastName || provider.last_name,
    avatarUrl: normalized.avatarUrl || provider.avatar_url,
    phone: normalized.phone || provider.phone,
    // Rating and scores
    averageRating: normalized.averageRating || provider.average_rating,
    totalReviews: normalized.totalReviews || provider.total_reviews,
    totalJobs: normalized.totalJobs || provider.total_jobs,
    trustScore: normalized.trustScore || provider.trust_score,
    jobConfidence: normalized.jobConfidence || provider.job_confidence,
    // Status
    isVerified: normalized.isVerified ?? provider.is_verified,
    isActive: normalized.isActive ?? provider.is_active,
    approvalStatus: normalized.approvalStatus || provider.approval_status,
    // Bio
    bio: normalized.bio || provider.bio,
    yearsExperience: normalized.yearsExperience || provider.years_experience,
    // Timestamps
    createdAt: normalized.createdAt || provider.created_at,
    updatedAt: normalized.updatedAt || provider.updated_at,
  };
};

/**
 * Normalize a service object
 * @param {Object} service - Raw service from API
 * @returns {Object} Normalized service
 */
export const normalizeService = (service) => {
  if (!service) return null;

  const normalized = normalizeKeys(service);

  return {
    ...normalized,
    id: normalized.id || service.id,
    name: normalized.name || service.name,
    description: normalized.description || service.description,
    categoryId: normalized.categoryId || service.category_id,
    basePrice: normalized.basePrice || service.base_price,
    iconUrl: normalized.iconUrl || service.icon_url,
    imageUrl: normalized.imageUrl || service.image_url,
    isActive: normalized.isActive ?? service.is_active,
    // Category info (if nested)
    category: normalized.category ? normalizeCategory(normalized.category) : null,
  };
};

/**
 * Normalize a category object
 * @param {Object} category - Raw category from API
 * @returns {Object} Normalized category
 */
export const normalizeCategory = (category) => {
  if (!category) return null;

  const normalized = normalizeKeys(category);

  return {
    ...normalized,
    id: normalized.id || category.id,
    name: normalized.name || category.name,
    description: normalized.description || category.description,
    iconUrl: normalized.iconUrl || category.icon_url,
    imageUrl: normalized.imageUrl || category.image_url,
    isActive: normalized.isActive ?? category.is_active,
  };
};

/**
 * Normalize an address object
 * @param {Object} address - Raw address from API
 * @returns {Object} Normalized address
 */
export const normalizeAddress = (address) => {
  if (!address) return null;

  const normalized = normalizeKeys(address);

  return {
    ...normalized,
    id: normalized.id || address.id,
    userId: normalized.userId || address.user_id,
    label: normalized.label || address.label,
    addressLine1: normalized.addressLine1 || address.address_line_1 || address.addressLine1,
    addressLine2: normalized.addressLine2 || address.address_line_2 || address.addressLine2,
    city: normalized.city || address.city,
    state: normalized.state || address.state,
    postalCode: normalized.postalCode || address.postal_code,
    country: normalized.country || address.country,
    latitude: normalized.latitude || address.latitude,
    longitude: normalized.longitude || address.longitude,
    isDefault: normalized.isDefault ?? address.is_default,
    zoneId: normalized.zoneId || address.zone_id,
    subZoneId: normalized.subZoneId || address.sub_zone_id,
  };
};

/**
 * Normalize a user profile object
 * @param {Object} user - Raw user from API
 * @returns {Object} Normalized user
 */
export const normalizeUser = (user) => {
  if (!user) return null;

  const normalized = normalizeKeys(user);

  return {
    ...normalized,
    id: normalized.id || user.id,
    email: normalized.email || user.email,
    phone: normalized.phone || user.phone,
    role: normalized.role || user.role,
    firstName: normalized.firstName || user.first_name,
    lastName: normalized.lastName || user.last_name,
    avatarUrl: normalized.avatarUrl || user.avatar_url,
    isEmailVerified: normalized.isEmailVerified ?? user.is_email_verified,
    isPhoneVerified: normalized.isPhoneVerified ?? user.is_phone_verified,
    createdAt: normalized.createdAt || user.created_at,
    updatedAt: normalized.updatedAt || user.updated_at,
  };
};

/**
 * Normalize a message object
 * @param {Object} message - Raw message from API
 * @returns {Object} Normalized message
 */
export const normalizeMessage = (message) => {
  if (!message) return null;

  const normalized = normalizeKeys(message);

  return {
    ...normalized,
    id: normalized.id || message.id,
    bookingId: normalized.bookingId || message.booking_id,
    senderId: normalized.senderId || message.sender_id,
    senderName: normalized.senderName || message.sender_name,
    senderAvatar: normalized.senderAvatar || message.sender_avatar,
    content: normalized.content || message.content,
    messageType: normalized.messageType || message.message_type || 'text',
    isRead: normalized.isRead ?? message.is_read,
    readAt: normalized.readAt || message.read_at,
    createdAt: normalized.createdAt || message.created_at,
    isOwnMessage: normalized.isOwnMessage ?? message.is_own_message,
  };
};

/**
 * Normalize a notification object
 * @param {Object} notification - Raw notification from API
 * @returns {Object} Normalized notification
 */
export const normalizeNotification = (notification) => {
  if (!notification) return null;

  const normalized = normalizeKeys(notification);

  return {
    ...normalized,
    id: normalized.id || notification.id,
    userId: normalized.userId || notification.user_id,
    title: normalized.title || notification.title,
    message: normalized.message || notification.message,
    type: normalized.type || notification.type,
    bookingId: normalized.bookingId || notification.booking_id,
    isRead: normalized.isRead ?? notification.is_read,
    readAt: normalized.readAt || notification.read_at,
    createdAt: normalized.createdAt || notification.created_at,
  };
};

/**
 * Normalize a booking history/timeline event
 * @param {Object} event - Raw history event from API
 * @returns {Object} Normalized event
 */
export const normalizeHistoryEvent = (event) => {
  if (!event) return null;

  const normalized = normalizeKeys(event);

  return {
    ...normalized,
    id: normalized.id || event.id,
    bookingId: normalized.bookingId || event.booking_id,
    oldStatus: normalized.oldStatus || event.old_status,
    newStatus: normalized.newStatus || event.new_status,
    reason: normalized.reason || event.reason,
    changedBy: normalized.changedBy || event.changed_by,
    createdAt: normalized.createdAt || event.created_at,
  };
};

/**
 * Normalize a service question object
 * @param {Object} question - Raw question from API
 * @returns {Object} Normalized question
 */
export const normalizeQuestion = (question) => {
  if (!question) return null;

  const normalized = normalizeKeys(question);

  return {
    ...normalized,
    id: normalized.id || question.id,
    serviceId: normalized.serviceId || question.service_id,
    questionText: normalized.questionText || question.question_text,
    questionType: normalized.questionType || question.question_type,
    options: normalized.options || question.options,
    displayOrder: normalized.displayOrder || question.display_order,
    isRequired: normalized.isRequired ?? question.is_required,
    isActive: normalized.isActive ?? question.is_active,
  };
};

/**
 * Normalize an array of items using a specific normalizer function
 * @param {Array} items - Array of raw items
 * @param {Function} normalizerFn - Normalizer function to apply
 * @returns {Array} Array of normalized items
 */
export const normalizeArray = (items, normalizerFn) => {
  if (!Array.isArray(items)) return [];
  return items.map(normalizerFn);
};

/**
 * Normalize bookings list
 * @param {Array} bookings - Array of raw bookings
 * @returns {Array} Array of normalized bookings
 */
export const normalizeBookings = (bookings) => normalizeArray(bookings, normalizeBooking);

/**
 * Normalize providers list
 * @param {Array} providers - Array of raw providers
 * @returns {Array} Array of normalized providers
 */
export const normalizeProviders = (providers) => normalizeArray(providers, normalizeProvider);

/**
 * Normalize messages list
 * @param {Array} messages - Array of raw messages
 * @returns {Array} Array of normalized messages
 */
export const normalizeMessages = (messages) => normalizeArray(messages, normalizeMessage);

/**
 * Normalize history events list
 * @param {Array} events - Array of raw events
 * @returns {Array} Array of normalized events
 */
export const normalizeHistory = (events) => normalizeArray(events, normalizeHistoryEvent);

/**
 * Normalize questions list
 * @param {Array} questions - Array of raw questions
 * @returns {Array} Array of normalized questions
 */
export const normalizeQuestions = (questions) => normalizeArray(questions, normalizeQuestion);

export default {
  // Generic utilities
  snakeToCamel,
  camelToSnake,
  normalizeKeys,
  denormalizeKeys,
  normalizeArray,
  // Entity-specific normalizers
  normalizeBooking,
  normalizeBookings,
  normalizeProvider,
  normalizeProviders,
  normalizeService,
  normalizeCategory,
  normalizeAddress,
  normalizeUser,
  normalizeMessage,
  normalizeMessages,
  normalizeNotification,
  normalizeHistoryEvent,
  normalizeHistory,
  normalizeQuestion,
  normalizeQuestions,
};
