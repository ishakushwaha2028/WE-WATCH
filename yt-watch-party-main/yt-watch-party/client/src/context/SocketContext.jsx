/**
 * SocketContext
 * Provides the Socket.IO connection and a toast notification system
 * to the entire React tree.
 */
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://we-watch-v3zv.onrender.com';

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [toasts, setToasts]       = useState([]);

  // ── Toast helpers ────────────────────────────────────────────────────────
  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  // ── Socket init ──────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports:        ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnectionAttempts: 20,
    });

    socket.on('connect',       () => setConnected(true));
    socket.on('disconnect',    () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));

    socket.on('error', ({ message }) => addToast(message, 'error'));
    socket.on('promoted_to_host', ({ message }) => addToast(message, 'success'));
    socket.on('removed_from_room', ({ message }) => addToast(message, 'error', 5000));

    socketRef.current = socket;

    return () => socket.disconnect();
  }, [addToast]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, addToast }}>
      {children}

      {/* ── Toast container ── */}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>
        ))}
      </div>
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside <SocketProvider>');
  return ctx;
}
