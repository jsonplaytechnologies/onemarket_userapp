/**
 * Booking Service
 *
 * Handles all booking-related API calls for Phase 2 booking system
 * Includes: Create booking (V2), scope acceptance/decline, answers, and booking management
 *
 * All responses are normalized to use camelCase field names consistently.
 * See utils/normalizer.js for the normalization logic.
 */

import api from './api';
import { API_ENDPOINTS } from '../constants/api';
import {
  normalizeBooking,
  normalizeBookings,
  normalizeMessages,
  normalizeHistory,
} from '../utils/normalizer';

class BookingService {
  /**
   * Create a Phase 2 booking with enhanced features
   *
   * @param {Object} bookingData - Booking creation data
   * @param {string} bookingData.serviceId - Service UUID
   * @param {string} bookingData.userAddressId - User address UUID
   * @param {string} bookingData.bookingPath - 'auto' or 'manual'
   * @param {string} [bookingData.proId] - Provider UUID (required for manual path)
   * @param {boolean} bookingData.isBookNow - true for immediate, false for scheduled
   * @param {string} [bookingData.requestedDatetime] - ISO datetime for scheduled bookings
   * @param {number} [bookingData.jobDurationMinutes] - Estimated job duration
   * @param {string} [bookingData.userNote] - Optional user note
   * @param {Array} [bookingData.answers] - Service question answers [{question_id, answer}]
   * @returns {Promise<Object>} Created booking object
   */
  async createBookingV2(bookingData) {
    try {
      // Validate required fields
      if (!bookingData.serviceId) {
        throw new Error('Service ID is required');
      }
      if (!bookingData.userAddressId) {
        throw new Error('User address is required');
      }
      if (!bookingData.bookingPath) {
        throw new Error('Booking path is required (auto or manual)');
      }
      if (bookingData.bookingPath === 'manual' && !bookingData.proId) {
        throw new Error('Provider ID is required for manual booking path');
      }
      if (bookingData.isBookNow === undefined) {
        throw new Error('isBookNow flag is required');
      }
      if (!bookingData.isBookNow && !bookingData.requestedDatetime) {
        throw new Error('Requested datetime is required for scheduled bookings');
      }

      const response = await api.post(API_ENDPOINTS.BOOKINGS_V2, bookingData);

      if (!response.success) {
        throw new Error(response.message || 'Failed to create booking');
      }

      // Normalize response to camelCase
      return normalizeBooking(response.data);
    } catch (error) {
      console.error('Create Booking V2 Error:', error);
      throw error;
    }
  }

  /**
   * Get all bookings for the current user
   *
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=20] - Items per page
   * @param {string} [params.status] - Filter by status
   * @returns {Promise<Object>} Bookings list with pagination
   */
  async getBookings(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        ...(params.status && { status: params.status }),
      });

      const response = await api.get(`${API_ENDPOINTS.BOOKINGS}?${queryParams}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch bookings');
      }

      // Normalize bookings list to camelCase
      return {
        ...response.data,
        bookings: normalizeBookings(response.data.bookings || response.data),
      };
    } catch (error) {
      console.error('Get Bookings Error:', error);
      throw error;
    }
  }

  /**
   * Get booking details by ID
   *
   * @param {string} bookingId - Booking UUID
   * @returns {Promise<Object>} Booking details
   */
  async getBookingById(bookingId) {
    try {
      if (!bookingId) {
        throw new Error('Booking ID is required');
      }

      const response = await api.get(API_ENDPOINTS.BOOKING_DETAILS(bookingId));

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch booking details');
      }

      // Normalize booking to camelCase
      return normalizeBooking(response.data);
    } catch (error) {
      console.error('Get Booking Details Error:', error);
      throw error;
    }
  }

  /**
   * Get booking history/timeline
   *
   * @param {string} bookingId - Booking UUID
   * @returns {Promise<Array>} Booking history events
   */
  async getBookingHistory(bookingId) {
    try {
      if (!bookingId) {
        throw new Error('Booking ID is required');
      }

      const response = await api.get(API_ENDPOINTS.BOOKING_HISTORY(bookingId));

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch booking history');
      }

      // Normalize history events to camelCase
      return normalizeHistory(response.data);
    } catch (error) {
      console.error('Get Booking History Error:', error);
      throw error;
    }
  }

  /**
   * Accept scope/quote from provider (Phase 2)
   * User confirms they accept the quoted price and duration before payment
   *
   * @param {string} bookingId - Booking UUID
   * @returns {Promise<Object>} Updated booking status
   */
  async acceptScope(bookingId) {
    try {
      if (!bookingId) {
        throw new Error('Booking ID is required');
      }

      const response = await api.post(API_ENDPOINTS.BOOKING_ACCEPT_SCOPE(bookingId));

      if (!response.success) {
        throw new Error(response.message || 'Failed to accept scope');
      }

      // Normalize booking to camelCase
      return normalizeBooking(response.data);
    } catch (error) {
      console.error('Accept Scope Error:', error);
      throw error;
    }
  }

  /**
   * Decline scope/quote from provider (Phase 2)
   * User rejects the quote - triggers reassignment or cancellation
   *
   * @param {string} bookingId - Booking UUID
   * @param {string} reason - Reason for declining
   * @returns {Promise<Object>} Updated booking status
   */
  async declineScope(bookingId, reason = '') {
    try {
      if (!bookingId) {
        throw new Error('Booking ID is required');
      }

      const response = await api.post(
        API_ENDPOINTS.BOOKING_DECLINE_SCOPE(bookingId),
        { reason }
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to decline scope');
      }

      // Normalize booking to camelCase
      return normalizeBooking(response.data);
    } catch (error) {
      console.error('Decline Scope Error:', error);
      throw error;
    }
  }

  /**
   * Get booking answers (Phase 2)
   * Retrieve user's answers to service questions
   *
   * @param {string} bookingId - Booking UUID
   * @returns {Promise<Array>} Booking answers
   */
  async getBookingAnswers(bookingId) {
    try {
      if (!bookingId) {
        throw new Error('Booking ID is required');
      }

      const response = await api.get(API_ENDPOINTS.BOOKING_ANSWERS(bookingId));

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch booking answers');
      }

      return response.data;
    } catch (error) {
      console.error('Get Booking Answers Error:', error);
      throw error;
    }
  }

  /**
   * Process payment for a booking
   *
   * @param {string} bookingId - Booking UUID
   * @param {Object} paymentData - Payment information
   * @param {string} paymentData.paymentMethod - 'orange_money' or 'mtn_momo'
   * @param {string} paymentData.phoneNumber - Payment phone number
   * @returns {Promise<Object>} Payment result
   */
  async processPayment(bookingId, paymentData) {
    try {
      if (!bookingId) {
        throw new Error('Booking ID is required');
      }
      if (!paymentData.paymentMethod) {
        throw new Error('Payment method is required');
      }
      if (!paymentData.phoneNumber) {
        throw new Error('Phone number is required');
      }

      const response = await api.post(
        API_ENDPOINTS.BOOKING_PAY(bookingId),
        paymentData
      );

      if (!response.success) {
        throw new Error(response.message || 'Payment failed');
      }

      return response.data;
    } catch (error) {
      console.error('Process Payment Error:', error);
      throw error;
    }
  }

  /**
   * Check payment status
   *
   * @param {string} bookingId - Booking UUID
   * @returns {Promise<Object>} Payment status
   */
  async checkPaymentStatus(bookingId) {
    try {
      if (!bookingId) {
        throw new Error('Booking ID is required');
      }

      const response = await api.get(API_ENDPOINTS.BOOKING_PAYMENT_STATUS(bookingId));

      if (!response.success) {
        throw new Error(response.message || 'Failed to check payment status');
      }

      return response.data;
    } catch (error) {
      console.error('Check Payment Status Error:', error);
      throw error;
    }
  }

  /**
   * Cancel a booking
   *
   * @param {string} bookingId - Booking UUID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelBooking(bookingId, reason) {
    try {
      if (!bookingId) {
        throw new Error('Booking ID is required');
      }
      if (!reason) {
        throw new Error('Cancellation reason is required');
      }

      const response = await api.post(
        API_ENDPOINTS.BOOKING_CANCEL(bookingId),
        { reason }
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to cancel booking');
      }

      // Normalize booking to camelCase
      return normalizeBooking(response.data);
    } catch (error) {
      console.error('Cancel Booking Error:', error);
      throw error;
    }
  }

  /**
   * Confirm job start
   *
   * @param {string} bookingId - Booking UUID
   * @returns {Promise<Object>} Updated booking
   */
  async confirmJobStart(bookingId) {
    try {
      if (!bookingId) {
        throw new Error('Booking ID is required');
      }

      const response = await api.patch(API_ENDPOINTS.BOOKING_CONFIRM_START(bookingId));

      if (!response.success) {
        throw new Error(response.message || 'Failed to confirm job start');
      }

      // Normalize booking to camelCase
      return normalizeBooking(response.data);
    } catch (error) {
      console.error('Confirm Job Start Error:', error);
      throw error;
    }
  }

  /**
   * Confirm job completion
   *
   * @param {string} bookingId - Booking UUID
   * @returns {Promise<Object>} Updated booking
   */
  async confirmJobComplete(bookingId) {
    try {
      if (!bookingId) {
        throw new Error('Booking ID is required');
      }

      const response = await api.patch(API_ENDPOINTS.BOOKING_CONFIRM_COMPLETE(bookingId));

      if (!response.success) {
        throw new Error(response.message || 'Failed to confirm job completion');
      }

      // Normalize booking to camelCase
      return normalizeBooking(response.data);
    } catch (error) {
      console.error('Confirm Job Complete Error:', error);
      throw error;
    }
  }

  /**
   * Get duration options for scheduled bookings
   *
   * @returns {Promise<Array>} Available duration options
   */
  async getDurationOptions() {
    try {
      const response = await api.get(API_ENDPOINTS.BOOKING_DURATION_OPTIONS);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch duration options');
      }

      return response.data;
    } catch (error) {
      console.error('Get Duration Options Error:', error);
      throw error;
    }
  }

  /**
   * Get booking messages/chat
   *
   * @param {string} bookingId - Booking UUID
   * @returns {Promise<Array>} Chat messages
   */
  async getMessages(bookingId) {
    try {
      if (!bookingId) {
        throw new Error('Booking ID is required');
      }

      const response = await api.get(API_ENDPOINTS.BOOKING_MESSAGES(bookingId));

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch messages');
      }

      // Normalize messages to camelCase
      const data = response.data;
      return {
        ...data,
        messages: normalizeMessages(data.messages || data),
      };
    } catch (error) {
      console.error('Get Messages Error:', error);
      throw error;
    }
  }

  /**
   * Send a text message
   *
   * @param {string} bookingId - Booking UUID
   * @param {string} message - Message text
   * @returns {Promise<Object>} Sent message
   */
  async sendMessage(bookingId, message) {
    try {
      if (!bookingId) {
        throw new Error('Booking ID is required');
      }
      if (!message || !message.trim()) {
        throw new Error('Message cannot be empty');
      }

      const response = await api.post(
        API_ENDPOINTS.BOOKING_MESSAGES(bookingId),
        { message: message.trim() }
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to send message');
      }

      return response.data;
    } catch (error) {
      console.error('Send Message Error:', error);
      throw error;
    }
  }

  /**
   * Send an image message
   *
   * @param {string} bookingId - Booking UUID
   * @param {Object} imageFile - Image file object from picker
   * @returns {Promise<Object>} Sent message
   */
  async sendImageMessage(bookingId, imageFile) {
    try {
      if (!bookingId) {
        throw new Error('Booking ID is required');
      }
      if (!imageFile) {
        throw new Error('Image file is required');
      }

      const formData = new FormData();
      formData.append('image', {
        uri: imageFile.uri,
        type: imageFile.type || 'image/jpeg',
        name: imageFile.fileName || 'chat-image.jpg',
      });

      const response = await api.post(
        API_ENDPOINTS.BOOKING_MESSAGES_IMAGE(bookingId),
        formData
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to send image');
      }

      return response.data;
    } catch (error) {
      console.error('Send Image Message Error:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   *
   * @param {string} bookingId - Booking UUID
   * @returns {Promise<Object>} Updated read status
   */
  async markMessagesAsRead(bookingId) {
    try {
      if (!bookingId) {
        throw new Error('Booking ID is required');
      }

      const response = await api.patch(API_ENDPOINTS.BOOKING_MESSAGES_READ(bookingId));

      if (!response.success) {
        throw new Error(response.message || 'Failed to mark messages as read');
      }

      return response.data;
    } catch (error) {
      console.error('Mark Messages As Read Error:', error);
      throw error;
    }
  }
}

export default new BookingService();
