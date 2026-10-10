/**
 * CloudTransition.jsx
 * Ethereal magical cloud-parting transition effect.
 * Automatically triggers whenever the mode or genre changes,
 * parting clouds from the center outwards to reveal the new realm.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function CloudTransition() {
  const { currentTheme, transitionCount } = useTheme();
  const [animating, setAnimating] = useState(false);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setAnimating(true);
    const timer = setTimeout(() => {
      setAnimating(false);
    }, 1050);
    return () => clearTimeout(timer);
  }, [transitionCount, currentTheme.id]);


  if (!animating) return null;

  return (
    <div style={styles.container} aria-hidden="true">
      {/* Central Ethereal Mist Vortex */}
      <div style={styles.mistCenter} />

      {/* Left Billowing Cloud Curtain */}
      <div style={styles.cloudLeft} />

      {/* Right Billowing Cloud Curtain */}
      <div style={styles.cloudRight} />

      {/* Shimmering Golden Rune / Starlight Sparkles */}
      <div style={styles.sparkleCenter}>
        <span style={styles.sparkleIcon}>✦</span>
        <span style={styles.realmAnnouncement}>{currentTheme.name}</span>
        <span style={styles.sparkleIcon}>✦</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    zIndex: 99998,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  mistCenter: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.85) 0%, rgba(240, 230, 205, 0.6) 35%, rgba(18, 24, 38, 0.4) 65%, transparent 100%)',
    animation: 'cloudMistCenter 0.95s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    filter: 'blur(10px)',
  },
  cloudLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '60%',
    background: 'radial-gradient(ellipse at 40% 50%, rgba(255, 255, 255, 0.95) 0%, rgba(220, 210, 190, 0.85) 30%, rgba(15, 20, 32, 0.9) 70%, transparent 100%)',
    animation: 'cloudPartLeft 0.95s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    filter: 'blur(8px)',
  },
  cloudRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '60%',
    background: 'radial-gradient(ellipse at 60% 50%, rgba(255, 255, 255, 0.95) 0%, rgba(220, 210, 190, 0.85) 30%, rgba(15, 20, 32, 0.9) 70%, transparent 100%)',
    animation: 'cloudPartRight 0.95s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    filter: 'blur(8px)',
  },
  sparkleCenter: {
    position: 'absolute',
    top: '46%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    animation: 'starlightSparkle 0.95s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  },
  sparkleIcon: {
    fontSize: 28,
    color: '#D4AF37',
    filter: 'drop-shadow(0 0 16px rgba(212, 175, 55, 0.9))',
  },
  realmAnnouncement: {
    fontFamily: "'Cinzel', serif",
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: 4,
    color: '#FFFFFF',
    textShadow: '0 2px 20px rgba(212, 175, 55, 0.8), 0 0 40px #FFFFFF',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
  },
};
