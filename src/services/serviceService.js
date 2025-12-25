/**
 * Service Service
 *
 * Handles all service-related API calls including questions for Phase 2
 *
 * All responses are normalized to use camelCase field names consistently.
 * See utils/normalizer.js for the normalization logic.
 */

import api from './api';
import { API_ENDPOINTS } from '../constants/api';
import { normalizeService, normalizeCategory, normalizeQuestions, normalizeKeys } from '../utils/normalizer';

class ServiceService {
  /**
   * Get all service categories
   *
   * @returns {Promise<Array>} Service categories
   */
  async getServiceCategories() {
    try {
      const response = await api.get(API_ENDPOINTS.SERVICE_CATEGORIES);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch service categories');
      }

      // Normalize categories to camelCase
      return (response.data || []).map(normalizeCategory);
    } catch (error) {
      console.error('Get Service Categories Error:', error);
      throw error;
    }
  }

  /**
   * Get services by category
   *
   * @param {string} categoryId - Category UUID
   * @returns {Promise<Array>} Services in category
   */
  async getCategoryServices(categoryId) {
    try {
      if (!categoryId) {
        throw new Error('Category ID is required');
      }

      const response = await api.get(API_ENDPOINTS.CATEGORY_SERVICES(categoryId));

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch category services');
      }

      // Normalize services to camelCase
      return (response.data || []).map(normalizeService);
    } catch (error) {
      console.error('Get Category Services Error:', error);
      throw error;
    }
  }

  /**
   * Search services by keyword
   *
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching services
   */
  async searchServices(query) {
    try {
      if (!query || !query.trim()) {
        throw new Error('Search query is required');
      }

      const response = await api.get(
        `${API_ENDPOINTS.SEARCH_SERVICES}?q=${encodeURIComponent(query.trim())}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Search failed');
      }

      // Normalize services to camelCase
      return (response.data || []).map(normalizeService);
    } catch (error) {
      console.error('Search Services Error:', error);
      throw error;
    }
  }

  /**
   * Get service questions (Phase 2)
   * Retrieve admin-defined questions that user must answer when booking this service
   *
   * @param {string} serviceId - Service UUID
   * @returns {Promise<Array>} Service questions
   * @returns {Object[]} questions - Array of question objects
   * @returns {string} questions[].id - Question UUID
   * @returns {string} questions[].question_text - The question to display
   * @returns {string} questions[].question_type - 'text' | 'multiple_choice' | 'number' | 'boolean'
   * @returns {Array<string>} [questions[].options] - Options for multiple_choice type
   * @returns {boolean} questions[].is_required - Whether question is mandatory
   * @returns {number} questions[].display_order - Order to display questions
   */
  async getServiceQuestions(serviceId) {
    try {
      if (!serviceId) {
        throw new Error('Service ID is required');
      }

      const response = await api.get(API_ENDPOINTS.SERVICE_QUESTIONS(serviceId));

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch service questions');
      }

      // Normalize and return questions sorted by displayOrder
      const rawQuestions = response.data.questions || [];
      const normalizedQuestions = normalizeQuestions(rawQuestions);
      return normalizedQuestions.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    } catch (error) {
      console.error('Get Service Questions Error:', error);
      throw error;
    }
  }

  /**
   * Validate service question answers
   * Client-side validation before submitting booking
   *
   * @param {Array} questions - Service questions
   * @param {Array} answers - User's answers [{question_id, answer}]
   * @returns {Object} Validation result {isValid, errors}
   */
  validateAnswers(questions, answers) {
    const errors = [];

    // Check all required questions are answered
    // Support both camelCase (normalized) and snake_case (legacy) field names
    questions.forEach(question => {
      const isRequired = question.isRequired ?? question.is_required;
      if (isRequired) {
        const answer = answers.find(a => (a.questionId || a.question_id) === question.id);

        if (!answer || !answer.answer || answer.answer.toString().trim() === '') {
          errors.push({
            questionId: question.id,
            questionText: question.questionText || question.question_text,
            error: 'This question is required',
          });
        } else {
          // Validate answer type
          const questionType = question.questionType || question.question_type;
          switch (questionType) {
            case 'multiple_choice':
              if (question.options && !question.options.includes(answer.answer)) {
                errors.push({
                  questionId: question.id,
                  questionText: question.questionText || question.question_text,
                  error: 'Please select a valid option',
                });
              }
              break;

            case 'number':
              if (isNaN(answer.answer)) {
                errors.push({
                  questionId: question.id,
                  questionText: question.questionText || question.question_text,
                  error: 'Please enter a valid number',
                });
              }
              break;

            case 'boolean':
              if (typeof answer.answer !== 'boolean') {
                errors.push({
                  questionId: question.id,
                  questionText: question.questionText || question.question_text,
                  error: 'Please select yes or no',
                });
              }
              break;

            case 'text':
            default:
              // Text validation passed (not empty)
              break;
          }
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format answers for API submission
   *
   * @param {Array} answers - Raw answers from form
   * @returns {Array} Formatted answers for API
   */
  formatAnswersForSubmission(answers) {
    return answers
      .filter(a => a.answer !== null && a.answer !== undefined && a.answer !== '')
      .map(a => ({
        // Backend expects snake_case, so denormalize
        question_id: a.questionId || a.question_id,
        answer: typeof a.answer === 'string' ? a.answer.trim() : a.answer,
      }));
  }
}

export default new ServiceService();
