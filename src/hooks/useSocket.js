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

      // Listen for typing indicator
      const handleTyping = (data) => {
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

      on('new-message', handleNewMessage);
      on('booking-status-changed', handleStatusChange);
      on('user-typing', handleTyping);
      on('pro-typing', handleTyping);
      on('message-read', handleMessageRead);
      on('job-start-request', handleJobStartRequest);
      on('job-complete-request', handleJobCompleteRequest);

      return () => {
        leaveBooking(bookingId);
        off('new-message');
        off('booking-status-changed');
        off('user-typing');
        off('pro-typing');
        off('message-read');
        off('job-start-request');
        off('job-complete-request');
      };
    }
  }, [isConnected, bookingId, joinBooking, leaveBooking, on, off]);

  const send = useCallback(
    (content, type = 'text') => {
      sendMessage(bookingId, content, type);
    },
    [bookingId, sendMessage]
  );

  const typing = useCallback(
    (isTyping) => {
      setTyping(bookingId, isTyping);
    },
    [bookingId, setTyping]
  );

  const markRead = useCallback(
    (messageId) => {
      markMessageRead(bookingId, messageId);
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
    typing,
    markRead,
    on,
    off,
  };
};

export default useSocket;
