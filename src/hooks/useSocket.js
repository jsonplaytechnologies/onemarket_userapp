/**
 * Socket Hooks for User App
 * Wrappers around SocketContext for backward compatibility
 */

import { useEffect, useState, useCallback } from 'react';
import { useSocketContext } from '../context/SocketContext';

// Main socket hook - wraps SocketContext
export const useSocket = () => {
  const socketContext = useSocketContext();
  return socketContext;
};

// Hook for booking-specific socket events
export const useBookingSocket = (bookingId) => {
  const {
    isConnected,
    joinBooking,
    leaveBooking,
    sendMessage,
    setTyping,
    markMessageRead,
    on,
    off,
  } = useSocketContext();

  const [messages, setMessages] = useState([]);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [isProTyping, setIsProTyping] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isConnected && bookingId) {
      joinBooking(bookingId);

      // Listen for new messages
      const handleNewMessage = (message) => {
        setMessages((prev) => {
          const prevMessages = Array.isArray(prev) ? prev : [];
          // Avoid duplicates
          const exists = prevMessages.some(m => m.id === message.id);
          if (exists) return prevMessages;
          return [...prevMessages, message];
        });
      };

      // Listen for booking status changes
      const handleStatusChange = (data) => {
        if (data.bookingId === bookingId) {
          setBookingStatus(data);
        }
      };

      // Listen for typing indicators - separate handlers for proper cleanup
      const handleUserTyping = (data) => {
        if (data.bookingId === bookingId) {
          setIsProTyping(data.isTyping);
        }
      };

      const handleProTyping = (data) => {
        if (data.bookingId === bookingId) {
          setIsProTyping(data.isTyping);
        }
      };

      // Listen for message read receipts
      const handleMessageRead = (data) => {
        setMessages((prev) => {
          const prevMessages = Array.isArray(prev) ? prev : [];
          return prevMessages.map((msg) =>
            msg.id === data.messageId ? { ...msg, isRead: true, is_read: true } : msg
          );
        });
      };

      // Listen for job start request
      const handleJobStartRequest = (data) => {
        if (data.bookingId === bookingId) {
          setBookingStatus(prev => ({ ...prev, status: 'job_start_requested', ...data }));
        }
      };

      // Listen for job complete request
      const handleJobCompleteRequest = (data) => {
        if (data.bookingId === bookingId) {
          setBookingStatus(prev => ({ ...prev, status: 'job_complete_requested', ...data }));
        }
      };

      // Phase 2: Provider assignment events
      const handleProviderAssigned = (data) => {
        if (data.bookingId === bookingId) {
          setBookingStatus(prev => ({ ...prev, ...data }));
          setNotifications(prev => [...prev, {
            type: 'provider-assigned',
            message: `Provider found: ${data.proName}`,
            timestamp: new Date(),
          }]);
        }
      };

      const handleProviderReassigning = (data) => {
        if (data.bookingId === bookingId) {
          setBookingStatus(prev => ({ ...prev, ...data }));
          setNotifications(prev => [...prev, {
            type: 'provider-reassigning',
            message: `Finding another provider... (Attempt ${data.attemptNumber}/${data.maxAttempts})`,
            timestamp: new Date(),
          }]);
        }
      };

      const handleBookingFailed = (data) => {
        if (data.bookingId === bookingId) {
          setBookingStatus(prev => ({ ...prev, status: 'failed', ...data }));
          setNotifications(prev => [...prev, {
            type: 'booking-failed',
            message: 'Sorry, no providers available',
            timestamp: new Date(),
          }]);
        }
      };

      // Phase 2: Quote events
      const handleQuoteReceived = (data) => {
        if (data.bookingId === bookingId) {
          setBookingStatus(prev => ({ ...prev, ...data }));
          setNotifications(prev => [...prev, {
            type: 'quote-received',
            message: `Quote received: ${data.amount} XAF`,
            timestamp: new Date(),
          }]);
        }
      };

      const handleQuoteExpired = (data) => {
        if (data.bookingId === bookingId) {
          setBookingStatus(prev => ({ ...prev, status: 'quote_expired', ...data }));
          setNotifications(prev => [...prev, {
            type: 'quote-expired',
            message: 'Quote has expired',
            timestamp: new Date(),
          }]);
        }
      };

      // Phase 2: Limbo timeout warning
      const handleLimboTimeoutWarning = (data) => {
        if (data.bookingId === bookingId) {
          setNotifications(prev => [...prev, {
            type: 'limbo-timeout-warning',
            message: `${data.secondsRemaining} seconds remaining`,
            timestamp: new Date(),
          }]);
        }
      };

      on('new-message', handleNewMessage);
      on('booking-status-changed', handleStatusChange);
      on('user-typing', handleUserTyping);
      on('pro-typing', handleProTyping);
      on('message-read', handleMessageRead);
      on('job-start-request', handleJobStartRequest);
      on('job-complete-request', handleJobCompleteRequest);

      // Phase 2 events
      on('provider-assigned', handleProviderAssigned);
      on('provider-reassigning', handleProviderReassigning);
      on('booking-failed', handleBookingFailed);
      on('quote-received', handleQuoteReceived);
      on('quote-expired', handleQuoteExpired);
      on('limbo-timeout-warning', handleLimboTimeoutWarning);

      return () => {
        leaveBooking(bookingId);
        off('new-message', handleNewMessage);
        off('booking-status-changed', handleStatusChange);
        off('user-typing', handleUserTyping);
        off('pro-typing', handleProTyping);
        off('message-read', handleMessageRead);
        off('job-start-request', handleJobStartRequest);
        off('job-complete-request', handleJobCompleteRequest);
        // Phase 2 cleanup
        off('provider-assigned', handleProviderAssigned);
        off('provider-reassigning', handleProviderReassigning);
        off('booking-failed', handleBookingFailed);
        off('quote-received', handleQuoteReceived);
        off('quote-expired', handleQuoteExpired);
        off('limbo-timeout-warning', handleLimboTimeoutWarning);
      };
    }
  }, [isConnected, bookingId, joinBooking, leaveBooking, on, off]);

  // Send message with Promise support - returns Promise for acknowledgment
  const send = useCallback(
    async (content, type = 'text') => {
      try {
        const message = await sendMessage(bookingId, content, type);
        return message;
      } catch (error) {
        console.error('Failed to send message:', error.message);
        throw error;
      }
    },
    [bookingId, sendMessage]
  );

  // Fire-and-forget send (for backwards compatibility)
  const sendAsync = useCallback(
    (content, type = 'text') => {
      sendMessage(bookingId, content, type).catch(err => {
        console.error('Message send failed:', err.message);
      });
    },
    [bookingId, sendMessage]
  );

  const typing = useCallback(
    (isTyping) => {
      setTyping(bookingId, isTyping);
    },
    [bookingId, setTyping]
  );

  // Mark message as read with Promise support
  const markRead = useCallback(
    async (messageId) => {
      try {
        const result = await markMessageRead(bookingId, messageId);
        return result;
      } catch (error) {
        console.error('Failed to mark message as read:', error.message);
        throw error;
      }
    },
    [bookingId, markMessageRead]
  );

  // Fire-and-forget mark read (for backwards compatibility)
  const markReadAsync = useCallback(
    (messageId) => {
      markMessageRead(bookingId, messageId).catch(err => {
        console.error('Mark read failed:', err.message);
      });
    },
    [bookingId, markMessageRead]
  );

  return {
    isConnected,
    messages,
    setMessages,
    bookingStatus,
    isProTyping,
    notifications,
    send,
    sendAsync,
    typing,
    markRead,
    markReadAsync,
    on,
    off,
  };
};

export default useSocket;
