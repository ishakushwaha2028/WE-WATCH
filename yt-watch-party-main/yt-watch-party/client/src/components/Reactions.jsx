/**
 * Reactions.jsx
 * Floating real-time emoji reactions overlay and trigger bar.
 * Adds dynamic social interaction during watch parties (Bonus Requirement).
 */
import React from 'react';

export const EMOJI_OPTIONS = ['❤️', '🔥', '👏', '😂', '😮', '🍿'];

export function ReactionsOverlay({ reactions = [] }) {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div style={styles.floatingContainer} aria-hidden="true">
      {reactions.map((r) => (
        <div
          key={r.id}
          style={{
            ...styles.floatingItem,
            left: `${r.left || 50}%`,
            animationDuration: `${r.duration || 2.4}s`,
          }}
        >
          <span style={styles.emoji}>{r.emoji}</span>
          {r.username && (
            <span style={styles.username}>{r.username}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export function ReactionsBar({ socket, roomId, disabled }) {
  function sendReaction(emoji) {
    if (disabled || !socket) return;
    socket.emit('send_reaction', { emoji, roomId });
  }

  return (
    <div style={styles.bar}>
      <span style={styles.barLabel}>✨ React:</span>
      <div style={styles.buttonGroup}>
        {EMOJI_OPTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => sendReaction(emoji)}
            disabled={disabled}
            style={styles.reactionBtn}
            title={`React with ${emoji}`}
            type="button"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Reactions({ socket, roomId, reactions = [], disabled }) {
  return (
    <>
      <ReactionsOverlay reactions={reactions} />
      <ReactionsBar socket={socket} roomId={roomId} disabled={disabled} />
    </>
  );
}

const styles = {
  floatingContainer: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: 99999, // Supreme z-index so emojis always pop above video and panels!
  },
  floatingItem: {
    position: 'absolute',
    bottom: 270, // Start above the chat panel so it is immediately visible
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(10, 15, 26, 0.94)',
    border: '1.5px solid rgba(212, 175, 55, 0.7)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 20px rgba(212, 175, 55, 0.45)',
    padding: '8px 16px',
    borderRadius: 30,
    animation: 'floatUp 2.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    transformOrigin: 'bottom center',
  },
  emoji: {
    fontSize: 32,
    lineHeight: 1,
    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))',
  },
  username: {
    fontFamily: "'Cinzel', serif",
    fontSize: 12,
    fontWeight: 700,
    color: '#F8FAFC',
    maxWidth: 110,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    letterSpacing: 0.5,
  },
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 14px',
    background: 'rgba(0, 0, 0, 0.35)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    flexShrink: 0,
  },
  barLabel: {
    fontFamily: "'Cinzel', serif",
    fontSize: 11,
    fontWeight: 700,
    color: '#D4AF37',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  buttonGroup: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  reactionBtn: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: 16,
    padding: '4px 10px',
    fontSize: 18,
    cursor: 'pointer',
    transition: 'transform 0.15s, background 0.15s, border-color 0.15s',
    lineHeight: 1.2,
  },
};
