/**
 * Lobby.jsx
 * Entrance to We-Watch.
 * Features Harry Potter themed visual styling based on selected Mode & Genre:
 * - Normal Time: Light Hogwarts Great Hall
 * - Story Time: Dark nocturnal Hogwarts / Love Yule Ball / Horror Forbidden Forest
 */
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import AtmosphereBar from './AtmosphereBar';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

function generateShortId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function Lobby({ onJoin }) {
  const { currentTheme, mode } = useTheme();
  const { connected } = useSocket();

  const [tab, setTab] = useState('create');
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [inviteCode, setInviteCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check URL query parameters on mount (no default Alice name!)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        const clean = roomParam.trim().toUpperCase();
        setRoomCode(clean);
        setInviteCode(clean);
        setTab('join');
      }

      // Clear any default or residual 'Alice' name so input is always empty
      localStorage.removeItem('yt_username');
      setUsername('');
    } catch (_) { }
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    const name = username.trim();
    if (!name) return setError('Please enter a display name.');

    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/new-room`);
      const data = await res.json();
      const userId = uuidv4();
      onJoin(data.roomId, name, userId);
    } catch {
      const roomId = generateShortId();
      const userId = uuidv4();
      onJoin(roomId, name, userId);
    } finally {
      setLoading(false);
    }
  }

  function handleJoin(e) {
    e.preventDefault();
    setError('');
    const name = username.trim();
    const code = roomCode.trim().toUpperCase();
    if (!name) return setError('Please enter a display name.');
    if (!code) return setError('Please enter a room code.');

    const userId = uuidv4();
    onJoin(code, name, userId);
  }

  return (
    <div style={{
      ...styles.page,
      color: currentTheme.colors.textPrimary,
    }}>
      {/* Dynamic Background Image: Sharp, eye-soothing, zero harsh white glare */}
      <div
        style={{
          ...styles.bgLayer,
          backgroundImage: `url('${currentTheme.bgImage}')`,
          filter: currentTheme.id === 'normal'
            ? 'brightness(0.72) contrast(1.08) sepia(0.22)' // Warm soothing candlelight Great Hall, NOT harsh white!
            : 'brightness(0.85) contrast(1.16)',
        }}
      />
      <div
        style={{
          ...styles.bgOverlay,
          background: currentTheme.colors.bgOverlay,
        }}
      />

      {/* Top Bar with Atmosphere Switcher */}
      <div style={styles.topBar}>
        <div style={styles.topBrand}>
          <span style={{ color: currentTheme.colors.accentGold, fontSize: 18 }}>✦</span>
          <span style={styles.topBrandText}>WE-WATCH</span>
        </div>
        <AtmosphereBar />
      </div>

      <div style={styles.contentWrap}>
        {/* Brand Header */}
        <div style={styles.brand}>
          <div style={{ ...styles.logoIcon, color: currentTheme.colors.accentGold }}>⚡</div>
          <h1 style={{
            ...styles.title,
            color: currentTheme.isLight ? '#1E160E' : '#FFFFFF',
            textShadow: currentTheme.isLight ? 'none' : '0 0 24px rgba(212, 175, 55, 0.55)',
          }}>
            WE-WATCH
          </h1>
          <p style={{ ...styles.sub, color: currentTheme.colors.textSecondary }}>
            {currentTheme.tagline}
          </p>
        </div>

        {/* Server offline warning banner */}
        {!connected && (
          <div style={{
            margin: '0 auto 16px',
            maxWidth: 520,
            padding: '10px 16px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.45)',
            borderRadius: 8,
            fontSize: 13,
            color: '#EF4444',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontWeight: 600,
          }}>
            <span>⚠️</span>
            <span>Connecting to backend server on port 3001… Make sure backend is running!</span>
          </div>
        )}

        {/* Invite Banner */}
        {inviteCode && tab === 'join' && (
          <div style={{
            ...styles.inviteBanner,
            borderColor: currentTheme.colors.accentGold,
            background: currentTheme.isLight ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.2)',
          }}>
            <span>✨ You have received an enchanted owl invitation to join room <b>{inviteCode}</b></span>
          </div>
        )}

        {/* ── 3D Split-Card (Matching User Reference Image) ── */}
        <div style={{
          ...styles.card,
          background: currentTheme.colors.cardBg,
          borderColor: currentTheme.colors.cardBorder,
          boxShadow: currentTheme.colors.cardShadow,
        }}>
          {/* Left Column: Cinematic Realm Artwork & Quote */}
          <div
            style={{
              ...styles.cardArtCol,
              backgroundImage: `url('${currentTheme.bgImage}')`,
            }}
          >
            <div style={styles.cardArtOverlay}>
              <div style={styles.artCrown}>✦ 🏰 ✦</div>
              <h3 style={styles.artRealmTitle}>{currentTheme.name}</h3>
              <div style={styles.artDiamond}>◇</div>
              <p style={styles.artQuote}>
                {mode === 'normal'
                  ? '“Happiness can be found even in the darkest of times, if one only remembers to turn on the light.”'
                  : currentTheme.id === 'love'
                  ? '“Somewhere, something incredible is waiting to be known.”'
                  : currentTheme.id === 'horror'
                  ? '“Some doors should never be opened…”'
                  : currentTheme.id === 'action'
                  ? '“Real courage is facing what you fear.”'
                  : '“Not all who wander are lost.”'}
              </p>
              <div style={styles.artBadge}>
                <span>✦</span> WE-WATCH CINEMA
              </div>
            </div>
          </div>

          {/* Right Column: Portal Controls & Action Form */}
          <div style={styles.cardFormCol}>
            {/* Tabs */}
            <div style={{ ...styles.tabs, borderColor: currentTheme.colors.cardBorder }}>
              <button
                style={{
                  ...styles.tab,
                  ...(tab === 'create' ? {
                    color: currentTheme.isLight ? '#1E160E' : '#FFFFFF',
                    borderBottom: `2px solid ${currentTheme.colors.accentPrimary}`,
                    fontWeight: 700,
                  } : { color: currentTheme.colors.textSecondary }),
                }}
                onClick={() => { setTab('create'); setError(''); }}
                type="button"
              >
                🏰 Create Room
              </button>
              <button
                style={{
                  ...styles.tab,
                  ...(tab === 'join' ? {
                    color: currentTheme.isLight ? '#1E160E' : '#FFFFFF',
                    borderBottom: `2px solid ${currentTheme.colors.accentPrimary}`,
                    fontWeight: 700,
                  } : { color: currentTheme.colors.textSecondary }),
                }}
                onClick={() => { setTab('join'); setError(''); }}
                type="button"
              >
                🚪 Join Room
              </button>
            </div>

            {/* Form */}
            <form onSubmit={tab === 'create' ? handleCreate : handleJoin} style={styles.form}>
              <div style={styles.field}>
                <label style={{ ...styles.label, color: currentTheme.colors.textSecondary }} htmlFor="username">
                  Your Display Name
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your name…"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  maxLength={30}
                  style={{
                    ...styles.input,
                    background: currentTheme.colors.inputBg,
                    borderColor: currentTheme.colors.inputBorder,
                    color: currentTheme.colors.textPrimary,
                  }}
                  autoFocus={!username}
                  autoComplete="off"
                />
              </div>

              {tab === 'join' && (
                <div style={styles.field}>
                  <label style={{ ...styles.label, color: currentTheme.colors.textSecondary }} htmlFor="roomcode">
                    Enchanted Room Code
                  </label>
                  <input
                    id="roomcode"
                    type="text"
                    placeholder="e.g. AB12CD"
                    value={roomCode}
                    onChange={e => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={8}
                    style={{
                      ...styles.input,
                      background: currentTheme.colors.inputBg,
                      borderColor: currentTheme.colors.inputBorder,
                      color: currentTheme.colors.textPrimary,
                      letterSpacing: 4,
                      fontWeight: 800,
                    }}
                    autoFocus={!!username}
                  />
                </div>
              )}

              {error && <p style={styles.error}>{error}</p>}

              <button
                type="submit"
                style={{
                  ...styles.submitBtn,
                  background: `linear-gradient(135deg, ${currentTheme.colors.accentPrimary} 0%, ${currentTheme.colors.accentHover} 100%)`,
                  boxShadow: `0 4px 20px ${currentTheme.colors.glowColor}`,
                }}
                disabled={loading}
              >
                {loading ? 'Casting Spell…' : tab === 'create' ? '⚡ Create Watch Party' : '🗝️ Enter Watch Room'}
              </button>
            </form>

            {tab === 'create' && (
              <p style={{
                textAlign: 'center',
                color: currentTheme.colors.textSecondary,
                fontSize: 12,
                marginTop: 12,
                fontFamily: "'Cinzel', serif",
              }}>
                👑 You become the <b>Host</b> with full control to play, pause, seek, and assign roles.
              </p>
            )}

            {/* Feature tags row inside card */}
            <div style={styles.featureRow}>
              <span>✦ Real-Time Sync</span>
              <span style={{ color: currentTheme.colors.accentGold, opacity: 0.7 }}>◇</span>
              <span>Host RBAC</span>
              <span style={{ color: currentTheme.colors.accentGold, opacity: 0.7 }}>◇</span>
              <span>Live Chat & React</span>
            </div>
          </div>
        </div>

        {/* Features Bottom Pills */}
        <div style={styles.features}>
          {[
            { icon: '🔴', label: 'Real-time sync' },
            { icon: '👑', label: 'Role-based control' },
            { icon: '🎬', label: 'YouTube in sync' },
            { icon: '✨', label: 'Floating reactions' },
          ].map(f => (
            <div
              key={f.label}
              style={{
                ...styles.feat,
                background: currentTheme.isLight ? 'rgba(255, 252, 240, 0.75)' : 'rgba(10, 15, 25, 0.65)',
                borderColor: currentTheme.colors.cardBorder,
              }}
            >
              <span style={{ fontSize: 16 }}>{f.icon}</span>
              <span style={{ fontSize: 11, color: currentTheme.colors.textSecondary, fontWeight: 600 }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflowX: 'hidden',
  },
  bgLayer: {
    position: 'fixed',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'background-image 0.5s ease-in-out',
    zIndex: 1,
  },
  bgOverlay: {
    position: 'fixed',
    inset: 0,
    backdropFilter: 'none', // Sharp and clear, zero blur!
    transition: 'background 0.5s ease',
    zIndex: 2,
  },
  topBar: {
    position: 'relative',
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    background: 'rgba(4, 7, 14, 0.55)',
    borderBottom: '1px solid rgba(212, 175, 55, 0.18)',
  },
  topBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  topBrandText: {
    fontFamily: "'Cinzel', serif",
    fontSize: 16,
    fontWeight: 800,
    letterSpacing: 2,
    color: '#D4AF37',
  },
  contentWrap: {
    position: 'relative',
    zIndex: 10,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 16px',
    gap: 18,
  },
  brand: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  logoIcon: {
    fontSize: 34,
    lineHeight: 1,
    filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.6))',
  },
  title: {
    fontFamily: "'Cinzel', serif",
    fontSize: 34,
    fontWeight: 900,
    letterSpacing: 4,
    margin: 0,
  },
  sub: {
    fontFamily: "'Cinzel', serif",
    fontSize: 12,
    letterSpacing: 1,
    margin: 0,
  },
  inviteBanner: {
    border: '1px solid',
    borderRadius: 16,
    padding: '6px 16px',
    fontSize: 11,
  },

  // ── Sleek Compact 3D Split-Card (Join / Create Room Box) ──
  card: {
    display: 'flex',
    flexWrap: 'wrap',
    border: '1.5px solid rgba(212, 175, 55, 0.35)',
    borderRadius: 16,
    width: '100%',
    maxWidth: 560, // Sleek, small & compact!
    overflow: 'hidden',
    boxShadow: '0 16px 42px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
  },

  // Left Column: Artwork + Quotes (Compact)
  cardArtCol: {
    flex: '0 0 35%',
    minWidth: 180,
    minHeight: 280,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    borderRight: '1px solid rgba(212, 175, 55, 0.22)',
  },
  cardArtOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(8, 12, 22, 0.35) 0%, rgba(4, 7, 14, 0.88) 100%)',
    padding: '16px 14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: 6,
  },
  artCrown: {
    fontSize: 14,
    color: '#D4AF37',
    filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.6))',
  },
  artRealmTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: 14,
    fontWeight: 800,
    color: '#FFFFFF',
    letterSpacing: 1.5,
    margin: 0,
  },
  artDiamond: {
    fontSize: 10,
    color: '#D4AF37',
    opacity: 0.8,
  },
  artQuote: {
    fontFamily: "'Cinzel', serif",
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 1.4,
    fontStyle: 'italic',
    margin: 0,
  },
  artBadge: {
    marginTop: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontFamily: "'Cinzel', serif",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1.2,
    color: '#D4AF37',
    border: '1px solid rgba(212, 175, 55, 0.45)',
    borderRadius: 16,
    padding: '3px 10px',
    background: 'rgba(212, 175, 55, 0.1)',
  },

  // Right Column: Form (Compact)
  cardFormCol: {
    flex: 1,
    minWidth: 230,
    padding: '16px 20px 14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid',
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    borderRadius: 0,
    padding: '6px 0',
    fontFamily: "'Cinzel', serif",
    fontSize: 12,
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.15s ease',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "'Cinzel', serif",
    letterSpacing: 0.6,
  },
  input: {
    padding: '9px 12px',
    borderRadius: 8,
    border: '1px solid',
    outline: 'none',
    fontSize: 13,
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  error: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: -2,
  },
  submitBtn: {
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 8,
    padding: '11px',
    fontFamily: "'Cinzel', serif",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 1.2,
    cursor: 'pointer',
    marginTop: 4,
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  featureRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: "'Cinzel', serif",
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 0.5,
    marginTop: 14,
    flexWrap: 'wrap',
  },

  // Bottom Floating Pills
  features: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  feat: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    border: '1px solid',
    borderRadius: 16,
    padding: '4px 12px',
  },
};
