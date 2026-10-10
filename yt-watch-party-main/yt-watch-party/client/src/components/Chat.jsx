/**
 * Chat
 * Real-time text chat panel inside the watch room.
 */
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const ROLE_COLORS = {
  host:        '#FF0000',
  moderator:   '#F59E0B',
  participant: '#AAAAAA',
  viewer:      '#6B7280',
};

const ROLE_ICONS = {
  host:        '👑',
  moderator:   '🛡',
  participant: '',
  viewer:      '',
};

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Chat({ socket, roomId, messages, myUserId }) {
  const { currentTheme } = useTheme();
  const [text,       setText]       = useState('');
  const [collapsed,  setCollapsed]  = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (!collapsed) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, collapsed]);

  function send(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!socket) return;
    socket.emit('chat_message', { text: trimmed, roomId });
    setText('');
  }

  return (
    <div style={{ ...styles.wrapper, height: collapsed ? 44 : 260 }}>
      {/* ── Header ── */}
      <button style={styles.header} onClick={() => setCollapsed(c => !c)}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>💬 Live Chat</span>
        {messages.length > 0 && collapsed && (
          <span style={styles.badge}>{messages.length}</span>
        )}
        <span style={{ marginLeft: 'auto', color: 'var(--text-sec)', fontSize: 12 }}>
          {collapsed ? '▲' : '▼'}
        </span>
      </button>

      {!collapsed && (
        <>
          {/* ── Messages ── */}
          <div style={styles.messages} aria-live="polite" aria-label="Chat messages">
            {messages.length === 0 && (
              <p style={{ color: 'var(--text-sec)', fontSize: 12, textAlign: 'center', marginTop: 16 }}>
                No messages yet. Say hi!
              </p>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.userId === myUserId;
              const isHost = msg.role === 'host';
              return (
                <div key={msg.id || i} style={{ ...styles.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    ...styles.bubble,
                    background: isMe
                      ? (currentTheme.isLight ? 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)' : 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)')
                      : (currentTheme.isLight ? '#FFFBF0' : 'rgba(15, 23, 42, 0.85)'),
                    borderColor: isHost
                      ? 'rgba(212, 175, 55, 0.8)'
                      : isMe
                        ? 'rgba(212, 175, 55, 0.6)'
                        : (currentTheme.isLight ? 'rgba(180, 130, 60, 0.4)' : 'rgba(255, 255, 255, 0.15)'),
                    boxShadow: isHost ? '0 0 12px rgba(212, 175, 55, 0.25)' : isMe ? '0 2px 10px rgba(0,0,0,0.25)' : 'none',
                  }}>
                    <div style={styles.msgMeta}>
                      <span style={{
                        color: isHost ? '#F59E0B' : isMe ? '#FDE68A' : ROLE_COLORS[msg.role],
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        {ROLE_ICONS[msg.role]} {msg.username}
                        {isHost && (
                          <span style={{
                            background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
                            color: '#000',
                            fontSize: 9,
                            fontWeight: 900,
                            padding: '1px 5px',
                            borderRadius: 4,
                            marginLeft: 4,
                            letterSpacing: 0.5,
                          }}>
                            HOST
                          </span>
                        )}
                      </span>
                      <span style={{
                        color: isMe ? 'rgba(255, 255, 255, 0.75)' : (currentTheme.isLight ? '#78654E' : '#94A3B8'),
                        fontSize: 10,
                      }}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <p style={{
                      ...styles.msgText,
                      color: isMe ? '#FFFFFF' : (currentTheme.isLight ? '#1E160E' : '#F8FAFC'),
                      fontWeight: 500,
                    }}>
                      {msg.text}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* ── Quick Emoji Reaction Bar inside Chat ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            background: currentTheme.isLight ? 'rgba(240, 235, 220, 0.6)' : 'rgba(0, 0, 0, 0.25)',
            borderTop: `1px solid ${currentTheme.colors.cardBorder}`,
          }}>
            <span style={{ fontSize: 11, fontFamily: "'Cinzel', serif", color: currentTheme.colors.accentGold, fontWeight: 700 }}>
              React:
            </span>
            {['❤️', '🔥', '👏', '😂', '😮', '🍿'].map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => socket?.emit('send_reaction', { emoji, roomId })}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 15,
                  cursor: 'pointer',
                  padding: '2px 4px',
                  borderRadius: 6,
                  transition: 'transform 0.12s',
                }}
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* ── Input ── */}
          <form onSubmit={send} style={{
            ...styles.inputRow,
            borderTop: `1px solid ${currentTheme.colors.cardBorder}`,
            background: currentTheme.isLight ? '#FFFDF8' : 'rgba(10, 15, 26, 0.95)',
          }}>
            <input
              type="text"
              placeholder="Send an enchanted message…"
              value={text}
              onChange={e => setText(e.target.value)}
              maxLength={500}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: 13,
                background: currentTheme.colors.inputBg,
                color: currentTheme.colors.textPrimary,
                borderColor: currentTheme.colors.inputBorder,
                borderRadius: 8,
              }}
              aria-label="Chat message input"
            />
            <button
              type="submit"
              className="btn-primary"
              style={{
                padding: '7px 16px',
                fontSize: 13,
                background: currentTheme.colors.accentPrimary,
                color: '#FFFFFF',
              }}
              disabled={!text.trim()}
            >
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    borderTop: '1px solid var(--border)',
    background: 'var(--card)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'height 0.2s ease',
    overflow: 'hidden',
    flexShrink: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 16px',
    height: 44,
    background: 'transparent',
    color: 'var(--text)',
    borderRadius: 0,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
  },
  badge: {
    background: 'var(--primary)',
    color: '#fff',
    borderRadius: 10,
    padding: '1px 6px',
    fontSize: 11,
    fontWeight: 700,
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  msgRow: {
    display: 'flex',
  },
  bubble: {
    maxWidth: '80%',
    background: 'var(--input)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '6px 10px',
  },
  msgMeta: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    marginBottom: 2,
  },
  msgText: {
    fontSize: 13,
    color: 'var(--text)',
    wordBreak: 'break-word',
    lineHeight: 1.4,
  },
  inputRow: {
    display: 'flex',
    gap: 8,
    padding: '8px 12px',
    borderTop: '1px solid var(--border)',
  },
};
