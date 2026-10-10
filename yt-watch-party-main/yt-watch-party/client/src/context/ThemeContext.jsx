/**
 * ThemeContext.jsx
 * Manages Harry Potter-inspired modes ('normal' vs 'story') and genres ('love', 'horror', 'action', 'fantasy').
 * Provides reactive design tokens and background image paths across the application.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEMES = {
  // ── Normal Time (Eye-Soothing Warm Candlelight Hogwarts - Not White!) ──
  normal: {
    id: 'normal',
    name: 'Normal Time',
    bgImage: '/images/hp_hogwarts_light.jpg',
    isLight: false, // Eye-soothing warm atmosphere, NOT stark white!
    colors: {
      bgOverlay: 'rgba(20, 15, 12, 0.78)',
      cardBg: 'rgba(28, 22, 18, 0.92)',
      cardBorder: 'rgba(202, 160, 80, 0.38)',
      cardShadow: '0 16px 48px rgba(0, 0, 0, 0.75)',
      textPrimary: '#F6EFE6',      // Soothing warm parchment
      textSecondary: '#D1BFA8',    // Warm muted amber
      accentPrimary: '#B91C1C',    // Warm Gryffindor amber-crimson
      accentHover: '#991B1B',
      accentGold: '#F59E0B',       // Candlelight Gold
      inputBg: 'rgba(18, 14, 12, 0.9)',
      inputBorder: 'rgba(180, 140, 80, 0.35)',
      sidebarBg: 'rgba(24, 18, 15, 0.95)',
      playerBg: '#0F0C0A',
      glowColor: 'rgba(245, 158, 11, 0.35)',
      fontHeading: "'Cinzel', serif",
    },
  },

  // ── Story Time: Love (Romantic Yule Ball) ──
  love: {
    id: 'love',
    name: 'Story Time: Love & Romance',
    tagline: 'Every love story is beautiful',
    bgImage: '/images/hp_genre_love.jpg',
    isLight: false,
    colors: {
      bgOverlay: 'rgba(25, 8, 18, 0.62)',
      cardBg: 'rgba(38, 14, 28, 0.82)',
      cardBorder: 'rgba(244, 114, 182, 0.38)',
      cardShadow: '0 12px 42px rgba(236, 72, 153, 0.22)',
      textPrimary: '#FFF1F2',
      textSecondary: '#FBCFE8',
      accentPrimary: '#EC4899',      // Romantic Pink
      accentHover: '#DB2777',
      accentGold: '#FCD34D',      // Candle Gold
      inputBg: 'rgba(26, 8, 19, 0.85)',
      inputBorder: 'rgba(244, 114, 182, 0.35)',
      sidebarBg: 'rgba(30, 10, 22, 0.92)',
      playerBg: 'rgba(15, 5, 12, 0.95)',
      glowColor: 'rgba(236, 72, 153, 0.45)',
      fontHeading: "'Cinzel', serif",
    },
  },

  // ── Story Time: Horror (Dark Forbidden Forest) ──
  horror: {
    id: 'horror',
    name: 'Story Time: Horror & Gloom',
    tagline: 'some doors should never be opened',
    bgImage: '/images/hp_genre_horror.jpg',
    isLight: false,
    colors: {
      bgOverlay: 'rgba(4, 10, 8, 0.72)',
      cardBg: 'rgba(10, 22, 16, 0.86)',
      cardBorder: 'rgba(34, 197, 94, 0.3)',
      cardShadow: '0 12px 42px rgba(4, 20, 12, 0.6)',
      textPrimary: '#ECFDF5',
      textSecondary: '#86EFAC',
      accentPrimary: '#10B981',      // Eerie Emerald
      accentHover: '#059669',
      accentGold: '#F59E0B',      // Lantern Glow
      inputBg: 'rgba(8, 16, 12, 0.9)',
      inputBorder: 'rgba(34, 197, 94, 0.3)',
      sidebarBg: 'rgba(8, 18, 13, 0.94)',
      playerBg: 'rgba(4, 10, 7, 0.96)',
      glowColor: 'rgba(16, 185, 129, 0.35)',
      fontHeading: "'Cinzel', serif",
    },
  },

  // ── Story Time: Action (Triwizard Arena) ──
  action: {
    id: 'action',
    name: 'Story Time: Action & Adventure',
    tagline: 'No fear ,No limits, Just action',
    bgImage: '/images/hp_dragon_action.jpg',
    isLight: false,
    colors: {
      bgOverlay: 'rgba(20, 8, 4, 0.65)',
      cardBg: 'rgba(32, 14, 8, 0.84)',
      cardBorder: 'rgba(249, 115, 22, 0.4)',
      cardShadow: '0 12px 42px rgba(234, 88, 12, 0.25)',
      textPrimary: '#FFF7ED',
      textSecondary: '#FED7AA',
      accentPrimary: '#EA580C',      // Dragon Flame
      accentHover: '#C2410C',
      accentGold: '#FBBF24',      // Fiery Gold
      inputBg: 'rgba(24, 10, 6, 0.88)',
      inputBorder: 'rgba(249, 115, 22, 0.35)',
      sidebarBg: 'rgba(26, 10, 6, 0.92)',
      playerBg: 'rgba(12, 5, 2, 0.95)',
      glowColor: 'rgba(249, 115, 22, 0.45)',
      fontHeading: "'Cinzel', serif",
    },
  },

  // ── Story Time: Fantasy & Mystery (Astronomy Tower) ──
  fantasy: {
    id: 'fantasy',
    name: 'Story Time: Fantasy & Mystery',
    tagline: 'Not all who wander are lost',
    bgImage: '/images/hp_hogwarts_night.jpg',
    isLight: false,
    colors: {
      bgOverlay: 'rgba(8, 12, 28, 0.62)',
      cardBg: 'rgba(16, 22, 46, 0.84)',
      cardBorder: 'rgba(139, 92, 246, 0.4)',
      cardShadow: '0 12px 42px rgba(124, 58, 237, 0.25)',
      textPrimary: '#F5F3FF',
      textSecondary: '#DDD6FE',
      accentPrimary: '#8B5CF6',      // Arcane Violet
      accentHover: '#7C3AED',
      accentGold: '#F59E0B',      // Starlight Gold
      inputBg: 'rgba(12, 16, 36, 0.88)',
      inputBorder: 'rgba(139, 92, 246, 0.35)',
      sidebarBg: 'rgba(14, 18, 40, 0.92)',
      playerBg: 'rgba(6, 8, 20, 0.96)',
      glowColor: 'rgba(139, 92, 246, 0.45)',
      fontHeading: "'Cinzel', serif",
    },
  },
};

export function ThemeProvider({ children }) {
  // mode: null (shows Mode Selection) | 'normal' | 'story'
  // Always starts at null so localhost opens directly to Mode Selector!
  const [mode, setMode] = useState(null);

  // genre: 'love' | 'horror' | 'action' | 'fantasy'
  const [genre, setGenre] = useState(() => {
    try { return localStorage.getItem('ww_genre') || 'fantasy'; } catch (_) { return 'fantasy'; }
  });

  // Save changes
  useEffect(() => {
    try {
      if (genre) localStorage.setItem('ww_genre', genre);
    } catch (_) { }
  }, [genre]);

  // Determine active theme
  const currentKey = mode === 'normal' ? 'normal' : genre;
  const currentTheme = THEMES[currentKey] || THEMES.normal;

  // Apply CSS variables to :root dynamically
  useEffect(() => {
    const root = document.documentElement;
    const { colors, fontHeading } = currentTheme;

    root.style.setProperty('--ww-bg-overlay', colors.bgOverlay);
    root.style.setProperty('--ww-card-bg', colors.cardBg);
    root.style.setProperty('--ww-card-border', colors.cardBorder);
    root.style.setProperty('--ww-card-shadow', colors.cardShadow);
    root.style.setProperty('--ww-text-primary', colors.textPrimary);
    root.style.setProperty('--ww-text-sec', colors.textSecondary);
    root.style.setProperty('--ww-accent-primary', colors.accentPrimary);
    root.style.setProperty('--ww-accent-hover', colors.accentHover);
    root.style.setProperty('--ww-accent-gold', colors.accentGold);
    root.style.setProperty('--ww-input-bg', colors.inputBg);
    root.style.setProperty('--ww-input-border', colors.inputBorder);
    root.style.setProperty('--ww-sidebar-bg', colors.sidebarBg);
    root.style.setProperty('--ww-player-bg', colors.playerBg);
    root.style.setProperty('--ww-glow', colors.glowColor);
    root.style.setProperty('--ww-font-heading', fontHeading);

    // Update standard base tokens
    root.style.setProperty('--bg', currentTheme.isLight ? '#FBF8F0' : '#0B0D13');
    root.style.setProperty('--card', colors.cardBg);
    root.style.setProperty('--border', colors.cardBorder);
    root.style.setProperty('--primary', colors.accentPrimary);
    root.style.setProperty('--primary-hover', colors.accentHover);
    root.style.setProperty('--text', colors.textPrimary);
    root.style.setProperty('--text-sec', colors.textSecondary);
    root.style.setProperty('--input', colors.inputBg);
  }, [currentTheme]);

  // Incremented on every mode or genre change to trigger the cloud-parting animation
  const [transitionCount, setTransitionCount] = useState(0);

  function triggerCloudTransition() {
    setTransitionCount(c => c + 1);
  }

  function handleSetMode(newMode) {
    setMode(newMode);
    setTransitionCount(c => c + 1);
  }

  function handleSetGenre(newGenre) {
    setGenre(newGenre);
    setTransitionCount(c => c + 1);
  }

  function resetMode() {
    setMode(null);
    setTransitionCount(c => c + 1);
  }

  return (
    <ThemeContext.Provider value={{
      mode,
      setMode: handleSetMode,
      genre,
      setGenre: handleSetGenre,
      currentTheme,
      resetMode,
      transitionCount,
      triggerCloudTransition,
      allThemes: THEMES,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
