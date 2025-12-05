import { useEffect, useRef, useContext, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../constants/api';

// Socket instance singleton
let socketInstance = null;

export const useSocket = () => {
  const { token } = useContext(AuthContext);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const listenersRef = useRef({});

  useEffect(() => {
    if (token && !socketInstance) {
      // Create socket connection
      socketInstance = io(API_BASE_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id);
        setIsConnected(true);
        setConnectionError(null);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
      });

      socketInstance.on('error', (error) => {
        console.error('Socket error:', error);
        setConnectionError(error.message);
      });
    }

    return () => {
      // Cleanup listeners on unmount but keep socket alive
    };
  }, [token]);

  // Disconnect socket completely (call on logout)
  const disconnect = useCallback(() => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
      setIsConnected(false);
    }
  }, []);

  // Join a booking room for real-time updates
  const joinBooking = useCallback((bookingId) => {
    if (socketInstance && isConnected) {
      socketInstance.emit('join-booking', bookingId);
      console.log('Joined booking room:', bookingId);
    }
  }, [isConnected]);

  // Leave a booking room
  const leaveBooking = useCallback((bookingId) => {
    if (socketInstance) {
      socketInstance.emit('leave-booking', bookingId);
      console.log('Left booking room:', bookingId);
    }
  }, []);

  // Send a chat message
  const sendMessage = useCallback((bookingId, content, messageType = 'text') => {
    if (socketInstance && isConnected) {
      socketInstance.emit('send-message', {
        bookingId,
        content,
        messageType,
      });
    }
  }, [isConnected]);

  // Send typing indicator
  const setTyping = useCallback((bookingId, isTyping) => {
    if (socketInstance && isConnected) {
      socketInstance.emit('typing', { bookingId, isTyping });
    }
  }, [isConnected]);

  // Mark message as read
  const markMessageRead = useCallback((bookingId, messageId) => {
    if (socketInstance && isConnected) {
      socketInstance.emit('mark-read', { bookingId, messageId });
    }
  }, [isConnected]);

  // Subscribe to an event
  const on = useCallback((event, callback) => {
    if (socketInstance) {
      // Remove existing listener for this event if any
      if (listenersRef.current[event]) {
        socketInstance.off(event, listenersRef.current[event]);
      }
      listenersRef.current[event] = callback;
      socketInstance.on(event, callback);
    }
  }, []);

  // Unsubscribe from an event
  const off = useCallback((event) => {
    if (socketInstance && listenersRef.current[event]) {
      socketInstance.off(event, listenersRef.current[event]);
      delete listenersRef.current[event];
    }
  }, []);

  // Get socket instance for advanced usage
  const getSocket = useCallback(() => socketInstance, []);

  return {
    socket: socketInstance,
    isConnected,
    connectionError,
    disconnect,
    joinBooking,
    leaveBooking,
    sendMessage,
    setTyping,
    markMessageRead,
    on,
    off,
    getSocket,
  };
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
  } = useSocket();

  const [messages, setMessages] = useState([]);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [isProTyping, setIsProTyping] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isConnected && bookingId) {
      joinBooking(bookingId);

      // Listen for new messages
      on('new-message', (message) => {
        setMessages((prev) => {
          const prevMessages = Array.isArray(prev) ? prev : [];
          return [...prevMessages, message];
        });
      });

      // Listen for booking status changes
      on('booking-status-changed', (data) => {
        if (data.bookingId === bookingId) {
          setBookingStatus(data);
        }
      });

      // Listen for typing indicator
      on('user-typing', (data) => {
        if (data.userId !== bookingId) {
          setIsProTyping(data.isTyping);
        }
      });

      // Listen for message read receipts
      on('message-read', (data) => {
        setMessages((prev) => {
          const prevMessages = Array.isArray(prev) ? prev : [];
          return prevMessages.map((msg) =>
            msg.id === data.messageId ? { ...msg, isRead: true } : msg
          );
        });
      });

      // Listen for notifications
      on('notification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });

      // Listen for payment status
      on('payment-confirmed', (data) => {
        if (data.bookingId === bookingId) {
          setBookingStatus({ ...bookingStatus, status: 'paid', ...data });
        }
      });

      on('payment-failed', (data) => {
        if (data.bookingId === bookingId) {
          setNotifications((prev) => [
            { type: 'payment_failed', message: data.reason, bookingId },
            ...prev,
          ]);
        }
      });

      return () => {
        leaveBooking(bookingId);
        off('new-message');
        off('booking-status-changed');
        off('user-typing');
        off('message-read');
        off('notification');
        off('payment-confirmed');
        off('payment-failed');
      };
    }
  }, [isConnected, bookingId]);

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
  };
};

// Hook for global notifications
export const useNotifications = () => {
  const { isConnected, on, off } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isConnected) {
      on('notification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      on('booking-status-changed', (data) => {
        // Create a notification for status changes
        const statusMessages = {
          accepted: 'Your booking has been accepted',
          rejected: 'Your booking was rejected',
          quotation_sent: 'You received a quotation',
          paid: 'Payment confirmed',
          on_the_way: 'Pro is on the way',
          job_started: 'Job has started',
          completed: 'Job completed',
          cancelled: 'Booking cancelled',
        };

        if (statusMessages[data.status]) {
          setNotifications((prev) => [
            {
              type: 'booking_status',
              title: 'Booking Update',
              message: statusMessages[data.status],
              bookingId: data.bookingId,
              status: data.status,
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ]);
          setUnreadCount((prev) => prev + 1);
        }
      });

      on('message-notification', (data) => {
        setNotifications((prev) => [
          {
            type: 'new_message',
            title: 'New Message',
            message: data.preview,
            bookingId: data.bookingId,
            senderId: data.senderId,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        setUnreadCount((prev) => prev + 1);
      });

      return () => {
        off('notification');
        off('booking-status-changed');
        off('message-notification');
      };
    }
  }, [isConnected]);

  const clearNotification = useCallback((index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    clearNotification,
    clearAll,
    markAsRead,
  };
};

export default useSocket;
