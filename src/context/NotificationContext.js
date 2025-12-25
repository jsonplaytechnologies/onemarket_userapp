/**
 * Notification Context for User App
 * Global notification state, unread count, and toast management
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Vibration } from 'react-native';
import { useSocketContext } from './SocketContext';
import { useAuth } from './AuthContext';
import apiService from '../services/api';
import { API_ENDPOINTS } from '../constants/api';

// Try to import expo-av, fallback if not available
let Audio = null;
try {
  Audio = require('expo-av').Audio;
} catch (e) {
  console.log('expo-av not available, notifications will use vibration only');
}

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isConnected, on, off } = useSocketContext();
  const { isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);
  const [toastData, setToastData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const soundRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  // Load notification sound (if expo-av available)
  useEffect(() => {
    const loadSound = async () => {
      if (!Audio) return;

      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/notification.mp3')
        );
        soundRef.current = sound;
      } catch (error) {
        console.log('Could not load notification sound:', error);
      }
    };

    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(err => {
          console.warn('Error unloading sound:', err);
        });
      }
    };
  }, []);

  // Play notification sound and vibrate
  const playSound = async () => {
    // Vibrate phone
    Vibration.vibrate(200);

    // Play sound if available
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
      }
    } catch (error) {
      console.log('Could not play sound:', error);
    }
  };

  // Show toast notification
  const showToast = useCallback((data) => {
    // Clear any existing timeout to prevent memory leaks
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToastData(data);
    playSound();

    // Auto-hide after 4 seconds
    toastTimeoutRef.current = setTimeout(() => {
      setToastData(null);
      toastTimeoutRef.current = null;
    }, 4000);
  }, []);

  // Hide toast
  const hideToast = useCallback(() => {
    // Clear timeout when manually hiding
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToastData(null);
  }, []);

  // Cleanup toast timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Trigger refresh for screens
  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await apiService.get(API_ENDPOINTS.NOTIFICATIONS);
      if (response.success) {
        const notifs = response.data?.notifications || response.data || [];
        setNotifications(notifs);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiService.get(API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT);
      if (response.success) {
        // API returns { unreadCount: number }
        setUnreadCount(response.data?.unreadCount ?? 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  // Fetch unread chats count
  const fetchUnreadChatsCount = useCallback(async () => {
    try {
      const response = await apiService.get(API_ENDPOINTS.CONVERSATIONS);
      if (response.success) {
        // API returns { conversations: [...], totalUnread: number }
        setUnreadChatsCount(response.data?.totalUnread ?? 0);
      }
    } catch (error) {
      console.error('Error fetching unread chats count:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await apiService.patch(API_ENDPOINTS.NOTIFICATIONS_READ_ALL);
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  }, []);

  // Initial fetch on auth
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      fetchUnreadChatsCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setUnreadChatsCount(0);
    }
  }, [isAuthenticated, fetchUnreadCount, fetchUnreadChatsCount]);

  // Define socket event handlers with useCallback for proper cleanup
  const handleNotification = useCallback((notification) => {
    console.log('Received notification:', notification);
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    showToast({
      type: notification.type,
      title: notification.title,
      message: notification.message,
      bookingId: notification.booking_id || notification.bookingId,
    });

    triggerRefresh();
  }, [showToast, triggerRefresh]);

  const handleBookingAccepted = useCallback((data) => {
    console.log('Booking accepted:', data);
    showToast({
      type: 'booking_update',
      title: 'Booking Accepted',
      message: 'A professional has accepted your booking',
      bookingId: data.bookingId,
    });
    setUnreadCount(prev => prev + 1);
    triggerRefresh();
  }, [showToast, triggerRefresh]);

  const handleBookingRejected = useCallback((data) => {
    console.log('Booking rejected:', data);
    showToast({
      type: 'booking_update',
      title: 'Booking Declined',
      message: 'The professional was unable to accept your booking',
      bookingId: data.bookingId,
    });
    setUnreadCount(prev => prev + 1);
    triggerRefresh();
  }, [showToast, triggerRefresh]);

  const handleQuotationReceived = useCallback((data) => {
    console.log('Quotation received:', data);
    showToast({
      type: 'quotation',
      title: 'Quotation Received',
      message: `Price quote: ${data.amount?.toLocaleString() || ''} XAF`,
      bookingId: data.bookingId,
    });
    setUnreadCount(prev => prev + 1);
    triggerRefresh();
  }, [showToast, triggerRefresh]);

  const handleBookingStatusChanged = useCallback((data) => {
    console.log('Booking status changed:', data);

    const statusMessages = {
      accepted: 'Your booking has been accepted',
      quotation_sent: 'You received a price quote',
      on_the_way: 'Professional is on the way',
      job_start_requested: 'Professional requests to start the job',
      job_started: 'Job has started',
      job_complete_requested: 'Professional requests to mark job complete',
      completed: 'Job completed successfully',
      cancelled: 'Booking was cancelled',
    };

    if (statusMessages[data.status]) {
      showToast({
        type: 'booking_update',
        title: 'Booking Update',
        message: statusMessages[data.status],
        bookingId: data.bookingId,
        status: data.status,
      });
    }

    triggerRefresh();
  }, [showToast, triggerRefresh]);

  const handleProOnTheWay = useCallback((data) => {
    console.log('Pro on the way:', data);
    showToast({
      type: 'location',
      title: 'On The Way',
      message: 'Professional is heading to your location',
      bookingId: data.bookingId,
    });
    triggerRefresh();
  }, [showToast, triggerRefresh]);

  const handleJobStartRequest = useCallback((data) => {
    console.log('Job start requested:', data);
    showToast({
      type: 'action_required',
      title: 'Confirm Job Start',
      message: 'Please confirm the professional has arrived',
      bookingId: data.bookingId,
    });
    setUnreadCount(prev => prev + 1);
    triggerRefresh();
  }, [showToast, triggerRefresh]);

  const handleJobCompleteRequest = useCallback((data) => {
    console.log('Job complete requested:', data);
    showToast({
      type: 'action_required',
      title: 'Confirm Completion',
      message: 'Please confirm the job is complete',
      bookingId: data.bookingId,
    });
    setUnreadCount(prev => prev + 1);
    triggerRefresh();
  }, [showToast, triggerRefresh]);

  const handleMessageNotification = useCallback((data) => {
    console.log('New message:', data);
    showToast({
      type: 'new_message',
      title: 'New Message',
      message: data.preview || 'You have a new message',
      bookingId: data.bookingId,
    });
    setUnreadChatsCount(prev => prev + 1);
    triggerRefresh();
  }, [showToast, triggerRefresh]);

  const handlePaymentConfirmed = useCallback((data) => {
    console.log('Payment confirmed:', data);
    showToast({
      type: 'payment',
      title: 'Payment Successful',
      message: 'Your payment has been processed',
      bookingId: data.bookingId,
    });
    triggerRefresh();
  }, [showToast, triggerRefresh]);

  // Socket event listeners for USER role
  useEffect(() => {
    if (!isConnected) return;

    // Register all event handlers with stored references
    on('notification', handleNotification);
    on('booking-accepted', handleBookingAccepted);
    on('booking-rejected', handleBookingRejected);
    on('quotation-received', handleQuotationReceived);
    on('booking-status-changed', handleBookingStatusChanged);
    on('pro-on-the-way', handleProOnTheWay);
    on('job-start-request', handleJobStartRequest);
    on('job-complete-request', handleJobCompleteRequest);
    on('message-notification', handleMessageNotification);
    on('payment-confirmed', handlePaymentConfirmed);

    // Cleanup with proper callback references for correct unsubscription
    return () => {
      off('notification', handleNotification);
      off('booking-accepted', handleBookingAccepted);
      off('booking-rejected', handleBookingRejected);
      off('quotation-received', handleQuotationReceived);
      off('booking-status-changed', handleBookingStatusChanged);
      off('pro-on-the-way', handleProOnTheWay);
      off('job-start-request', handleJobStartRequest);
      off('job-complete-request', handleJobCompleteRequest);
      off('message-notification', handleMessageNotification);
      off('payment-confirmed', handlePaymentConfirmed);
    };
  }, [
    isConnected,
    on,
    off,
    handleNotification,
    handleBookingAccepted,
    handleBookingRejected,
    handleQuotationReceived,
    handleBookingStatusChanged,
    handleProOnTheWay,
    handleJobStartRequest,
    handleJobCompleteRequest,
    handleMessageNotification,
    handlePaymentConfirmed,
  ]);

  const value = {
    notifications,
    unreadCount,
    unreadChatsCount,
    toastData,
    refreshTrigger,
    fetchNotifications,
    fetchUnreadCount,
    fetchUnreadChatsCount,
    markAllAsRead,
    showToast,
    hideToast,
    triggerRefresh,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
