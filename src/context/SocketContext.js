/**
 * Socket Context for User App
 * Global socket connection management
 */

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../constants/api';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const listenersRef = useRef(new Map());

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('Initializing socket connection...');

      socketRef.current = io(API_BASE_URL, {
        auth: { token },
        query: { role: 'user' },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current.id);
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        setIsConnected(false);
      });

      return () => {
        if (socketRef.current) {
          console.log('Disconnecting socket...');
          socketRef.current.disconnect();
          socketRef.current = null;
          setIsConnected(false);
        }
      };
    }
  }, [isAuthenticated, token]);

  // Subscribe to socket events
  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      listenersRef.current.set(event, callback);
    }
  }, []);

  // Unsubscribe from socket events
  const off = useCallback((event) => {
    if (socketRef.current) {
      const callback = listenersRef.current.get(event);
      if (callback) {
        socketRef.current.off(event, callback);
        listenersRef.current.delete(event);
      }
    }
  }, []);

  // Emit socket events
  const emit = useCallback((event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  }, [isConnected]);

  // Join a booking room for real-time updates
  const joinBooking = useCallback((bookingId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-booking', bookingId);
      console.log('Joined booking room:', bookingId);
    }
  }, [isConnected]);

  // Leave a booking room
  const leaveBooking = useCallback((bookingId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave-booking', bookingId);
      console.log('Left booking room:', bookingId);
    }
  }, [isConnected]);

  // Send a chat message
  const sendMessage = useCallback((bookingId, message) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send-message', { bookingId, message });
    }
  }, [isConnected]);

  // Set typing status
  const setTyping = useCallback((bookingId, isTyping) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', { bookingId, isTyping });
    }
  }, [isConnected]);

  // Mark message as read
  const markMessageRead = useCallback((bookingId, messageId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('message-read', { bookingId, messageId });
    }
  }, [isConnected]);

  const value = {
    isConnected,
    socket: socketRef.current,
    on,
    off,
    emit,
    joinBooking,
    leaveBooking,
    sendMessage,
    setTyping,
    markMessageRead,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
