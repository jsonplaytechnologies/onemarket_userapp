/**
 * Provider Service
 *
 * Handles all provider-related API calls including availability for Phase 2
 *
 * All responses are normalized to use camelCase field names consistently.
 * See utils/normalizer.js for the normalization logic.
 */

import api from './api';
import { API_ENDPOINTS } from '../constants/api';
import { normalizeProvider, normalizeProviders, normalizeKeys } from '../utils/normalizer';

class ProviderService {
  /**
   * Search for providers
   *
   * @param {Object} params - Search parameters
   * @param {string} [params.serviceId] - Filter by service
   * @param {string} [params.latitude] - User latitude
   * @param {string} [params.longitude] - User longitude
   * @param {number} [params.radius] - Search radius in km
   * @param {string} [params.query] - Search query
   * @returns {Promise<Array>} Matching providers
   */
  async searchProviders(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.serviceId) queryParams.append('serviceId', params.serviceId);
      if (params.latitude) queryParams.append('latitude', params.latitude);
      if (params.longitude) queryParams.append('longitude', params.longitude);
      if (params.radius) queryParams.append('radius', params.radius);
      if (params.query) queryParams.append('q', params.query);

      const response = await api.get(
        `${API_ENDPOINTS.SEARCH_PROS}?${queryParams.toString()}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to search providers');
      }

      // Normalize providers to camelCase
      return normalizeProviders(response.data);
    } catch (error) {
      console.error('Search Providers Error:', error);
      throw error;
    }
  }

  /**
   * Get provider profile details
   *
   * @param {string} proId - Provider UUID
   * @returns {Promise<Object>} Provider profile
   */
  async getProviderProfile(proId) {
    try {
      if (!proId) {
        throw new Error('Provider ID is required');
      }

      const response = await api.get(API_ENDPOINTS.PRO_PROFILE(proId));

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch provider profile');
      }

      // Normalize provider to camelCase
      return normalizeProvider(response.data);
    } catch (error) {
      console.error('Get Provider Profile Error:', error);
      throw error;
    }
  }

  /**
   * Get provider's available time slots for a specific date (Phase 2)
   * Returns available hours considering working hours and existing bookings
   *
   * @param {string} proId - Provider UUID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Object>} Available slots
   * @returns {Array} slots - Array of slot objects
   * @returns {string} slots[].start_time - Slot start time (HH:MM:SS)
   * @returns {string} slots[].end_time - Slot end time (HH:MM:SS)
   * @returns {Array} slots[].blocked_ranges - Busy time ranges [{start, end}]
   */
  async getProviderAvailableSlots(proId, date) {
    try {
      if (!proId) {
        throw new Error('Provider ID is required');
      }
      if (!date) {
        throw new Error('Date is required');
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        throw new Error('Date must be in YYYY-MM-DD format');
      }

      const response = await api.get(
        `${API_ENDPOINTS.PRO_AVAILABLE_SLOTS(proId)}?date=${date}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch available slots');
      }

      // Normalize slots to camelCase
      return normalizeKeys(response.data);
    } catch (error) {
      console.error('Get Provider Available Slots Error:', error);
      throw error;
    }
  }

  /**
   * Check if provider is available right now (Phase 2)
   * For "Book Now" functionality
   *
   * @param {string} proId - Provider UUID
   * @returns {Promise<Object>} Availability status
   * @returns {boolean} isAvailable - Whether provider is available now
   * @returns {string} [reason] - Reason if not available
   * @returns {string} [nextAvailable] - Next available datetime if not available now
   */
  async checkProviderAvailableNow(proId) {
    try {
      if (!proId) {
        throw new Error('Provider ID is required');
      }

      const response = await api.get(API_ENDPOINTS.PRO_IS_AVAILABLE_NOW(proId));

      if (!response.success) {
        throw new Error(response.message || 'Failed to check provider availability');
      }

      // Normalize availability response to camelCase
      return normalizeKeys(response.data);
    } catch (error) {
      console.error('Check Provider Available Now Error:', error);
      throw error;
    }
  }

  /**
   * Get provider reviews
   *
   * @param {string} proId - Provider UUID
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @returns {Promise<Object>} Reviews with pagination
   */
  async getProviderReviews(proId, params = {}) {
    try {
      if (!proId) {
        throw new Error('Provider ID is required');
      }

      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
      });

      const response = await api.get(
        `${API_ENDPOINTS.PRO_REVIEWS(proId)}?${queryParams.toString()}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch reviews');
      }

      // Normalize reviews to camelCase
      return normalizeKeys(response.data);
    } catch (error) {
      console.error('Get Provider Reviews Error:', error);
      throw error;
    }
  }

  /**
   * Parse available slots into selectable time ranges
   * Helper function to convert API response into UI-friendly format
   *
   * @param {Array} slots - Raw slots from API
   * @param {number} durationMinutes - Required job duration
   * @returns {Array} Selectable time slots
   */
  parseAvailableSlots(slots, durationMinutes = 60) {
    const selectableSlots = [];

    if (!slots || slots.length === 0) {
      return selectableSlots;
    }

    slots.forEach(slot => {
      const startTime = this.parseTime(slot.start_time);
      const endTime = this.parseTime(slot.end_time);
      const blockedRanges = slot.blocked_ranges || [];

      // Generate time slots in 30-minute intervals
      let currentTime = startTime;
      const intervalMinutes = 30;

      while (currentTime + durationMinutes <= endTime) {
        const slotEnd = currentTime + durationMinutes;

        // Check if this slot overlaps with any blocked range
        const isBlocked = blockedRanges.some(blocked => {
          const blockedStart = this.parseTime(blocked.start);
          const blockedEnd = this.parseTime(blocked.end);

          // Check for overlap
          return (
            (currentTime >= blockedStart && currentTime < blockedEnd) ||
            (slotEnd > blockedStart && slotEnd <= blockedEnd) ||
            (currentTime <= blockedStart && slotEnd >= blockedEnd)
          );
        });

        if (!isBlocked) {
          selectableSlots.push({
            startTime: this.formatTime(currentTime),
            endTime: this.formatTime(slotEnd),
            startMinutes: currentTime,
            endMinutes: slotEnd,
          });
        }

        currentTime += intervalMinutes;
      }
    });

    return selectableSlots;
  }

  /**
   * Parse time string (HH:MM:SS) to minutes since midnight
   *
   * @param {string} timeStr - Time string (HH:MM:SS)
   * @returns {number} Minutes since midnight
   */
  parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Format minutes since midnight to time string (HH:MM)
   *
   * @param {number} minutes - Minutes since midnight
   * @returns {string} Time string (HH:MM)
   */
  formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Check if a specific datetime is available for a provider
   * Client-side validation helper
   *
   * @param {Array} slots - Available slots from API
   * @param {Date} requestedDatetime - Requested booking time
   * @param {number} durationMinutes - Job duration
   * @returns {boolean} Whether the slot is available
   */
  isSlotAvailable(slots, requestedDatetime, durationMinutes) {
    if (!slots || slots.length === 0) {
      return false;
    }

    const requestedMinutes =
      requestedDatetime.getHours() * 60 + requestedDatetime.getMinutes();
    const requestedEndMinutes = requestedMinutes + durationMinutes;

    return slots.some(slot => {
      const startTime = this.parseTime(slot.start_time);
      const endTime = this.parseTime(slot.end_time);

      // Check if requested time is within slot hours
      if (requestedMinutes < startTime || requestedEndMinutes > endTime) {
        return false;
      }

      // Check if requested time overlaps with any blocked range
      const blockedRanges = slot.blocked_ranges || [];
      const hasOverlap = blockedRanges.some(blocked => {
        const blockedStart = this.parseTime(blocked.start);
        const blockedEnd = this.parseTime(blocked.end);

        return (
          (requestedMinutes >= blockedStart && requestedMinutes < blockedEnd) ||
          (requestedEndMinutes > blockedStart && requestedEndMinutes <= blockedEnd) ||
          (requestedMinutes <= blockedStart && requestedEndMinutes >= blockedEnd)
        );
      });

      return !hasOverlap;
    });
  }

  /**
   * Sort providers by ranking criteria (Phase 2)
   * Helper function for manual path provider selection
   *
   * @param {Array} providers - Array of provider objects
   * @param {Object} criteria - Sorting criteria
   * @param {string} criteria.sortBy - 'trust_score' | 'distance' | 'completed_bookings'
   * @param {string} [criteria.order='desc'] - 'asc' | 'desc'
   * @returns {Array} Sorted providers
   */
  sortProviders(providers, criteria = { sortBy: 'trust_score', order: 'desc' }) {
    const sorted = [...providers];
    const { sortBy, order = 'desc' } = criteria;

    sorted.sort((a, b) => {
      let aValue = a[sortBy] || 0;
      let bValue = b[sortBy] || 0;

      if (order === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return sorted;
  }
}

export default new ProviderService();
