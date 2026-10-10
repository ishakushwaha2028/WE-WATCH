/**
 * AtmosphereBar.jsx
 * Displays the current Harry Potter atmosphere and allows switching modes/genres anytime.
 */
import React, { useState } from 'react';
import { useTheme, THEMES } from '../context/ThemeContext';

export default function AtmosphereBar() {
  const { mode, genre, setMode, setGenre, currentTheme, resetMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={styles.container}>
      <div style={styles.badgeRow}>
        <span style={styles.realmLabel}>Atmosphere:</span>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            ...styles.realmBtn,
            borderColor: currentTheme.colors.cardBorder,
            color: currentTheme.isLight ? '#1E160E' : '#FFFFFF',
            background: currentTheme.isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.55)',
          }}
          type="button"
          title="Click to switch atmosphere"
        >
          <span>{currentTheme.name}</span>
          <span style={{ fontSize: 10 }}>▼</span>
        </button>
      </div>

      {menuOpen && (
        <div style={{
          ...styles.dropdown,
          background: currentTheme.isLight ? '#FFFDF8' : '#111624',
          borderColor: currentTheme.colors.cardBorder,
          color: currentTheme.colors.textPrimary,
        }}>
          <div style={styles.menuHeader}>Select Enchanted Atmosphere</div>

          <button
            style={styles.menuItem}
            onClick={() => { setMode('normal'); setMenuOpen(false); }}
            type="button"
          >
            <span style={{ fontSize: 16 }}>☀️</span>
            <div style={styles.itemText}>
              <b>Normal Time</b>
              <small>Enjoy</small>
            </div>
          </button>

          <div style={styles.divider} />
          <div style={styles.menuSubHeader}>Story Time Genres</div>

          {[
            { id: 'love', icon: '🌹', title: 'Love & Romance', },
            { id: 'horror', icon: '💀', title: 'Horror & Thriller', },
            { id: 'action', icon: '⚔️', title: 'Action & Adventure' },
            { id: 'fantasy', icon: '🔮', title: 'Fantasy & Mystery' },
          ].map((item) => (
            <button
              key={item.id}
              style={{
                ...styles.menuItem,
                background: genre === item.id && mode === 'story' ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
              }}
              onClick={() => {
                setMode('story');
                setGenre(item.id);
                setMenuOpen(false);
              }}
              type="button"
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <div style={styles.itemText}>
                <b>{item.title}</b>
                <small>{item.sub}</small>
              </div>
            </button>
          ))}

          <div style={styles.divider} />
          <button
            style={{ ...styles.menuItem, color: '#D4AF37', justifyContent: 'center' }}
            onClick={() => { resetMode(); setMenuOpen(false); }}
            type="button"
          >
            ⚡ Back to Mode Selector
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    zIndex: 40,
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  realmLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.75,
  },
  realmBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: "'Cinzel', serif",
    fontSize: 12,
    fontWeight: 700,
    padding: '4px 12px',
    borderRadius: 16,
    border: '1px solid',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.15s ease',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 8,
    width: 260,
    borderRadius: 12,
    border: '1px solid',
    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.55)',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    zIndex: 999,
  },
  menuHeader: {
    fontSize: 11,
    fontFamily: "'Cinzel', serif",
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
    padding: '6px 8px 4px',
    color: '#D4AF37',
  },
  menuSubHeader: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    padding: '4px 8px',
    opacity: 0.6,
  },
  divider: {
    height: 1,
    background: 'rgba(255, 255, 255, 0.1)',
    margin: '4px 0',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 10px',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.12s',
  },
  itemText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    fontSize: 12,
  },
};
