/**
 * ModeSelector.jsx
 * 3D Split-Card design matching the reference showcase image:
 *  - 2x2 Split-cards with cinematic left-side artworks, golden serif typography,
 *    star icons, diamond dividers, and interactive glowing pill buttons.
 *  - Grand Bottom Featured Banner: "Same screen. Different worlds." with hero panorama.
 *  - Seamlessly links to "Normal Time" (Daylight Hogwarts) and "Story Time" (Love, Horror, Action, Fantasy).
 */
import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ModeSelector({ onSelected }) {
  const { setMode, setGenre } = useTheme();

  function selectNormal() {
    setMode('normal');
    onSelected();
  }

  function selectGenre(genreKey) {
    setMode('story');
    setGenre(genreKey);
    onSelected();
  }

  return (
    <div style={styles.overlay}>
      {/* Background artwork: sharp, vibrant, low blur */}
      <div style={styles.bgArtwork} />
      <div style={styles.bgVignette} />

      <div style={styles.container}>
        {/* Top Header */}
        <div style={styles.header}>
          <div style={styles.headerCrest}>✦</div>
          <h1 style={styles.mainTitle}>WE-WATCH</h1>
          <p style={styles.subTitle}>Watch Party</p>
        </div>

        {/* ── 1. Top Section: Normal Time (Prominently Above) ── */}
        <div
          style={styles.normalTimeHeroCard}
          onClick={selectNormal}
          role="button"
          tabIndex={0}
        >
          <div
            style={{
              ...styles.normalHeroImage,
              backgroundImage: "url('/images/hp_hogwarts_light.jpg')",
            }}
          />
          <div style={styles.normalHeroInfo}>
            <div style={styles.genreBadge}>
              <span>🏰</span> NORMAL TIME
            </div>
            <h2 style={styles.normalHeroQuote}>
              “Even the smallest person can change the course of the future.”
            </h2>
            <div style={styles.diamondDivider}>◇</div>
            <p style={styles.genreNote}>
              Daylight Hogwarts Great Hall • Instant watch party without genre setup
            </p>
            <button style={styles.normalHeroButton} type="button">
              <span>✦</span> Enter Normal Time
            </button>
          </div>
        </div>

        {/* ── 2. Middle Section Header: Story Time Realms (From There Down) ── */}
        <div style={styles.storySectionHeader}>
          <div style={styles.storyHeaderDivider} />
          <div style={styles.storyHeaderContent}>
            <span style={styles.storyHeaderCrest}>✦ ⚡ ✦</span>
            <h2 style={styles.storySectionTitle}>STORY TIME REALMS</h2>
            <p style={styles.storySectionSub}>Choose an enchanted genre for a custom atmospheric watch party</p>
          </div>
          <div style={styles.storyHeaderDivider} />
        </div>

        {/* ── 2x2 Story Time Genre Split Cards Grid ── */}
        <div style={styles.cardsGrid}>

          {/* Genre 1: Fantasy & Mystery */}
          <div
            style={styles.splitCard}
            onClick={() => selectGenre('fantasy')}
            role="button"
            tabIndex={0}
          >
            <div
              style={{
                ...styles.cardImage,
                backgroundImage: "url('/images/hp_hogwarts_night.jpg')",
              }}
            />
            <div style={styles.cardInfo}>
              <span style={styles.cardIcon}>✦</span>
              <h3 style={styles.cardGenreTag}>FANTASY & MYSTERY</h3>
              <h4 style={styles.cardQuote}>
                “Not all who wander are lost.”
              </h4>
              <div style={styles.diamondDivider}>◇</div>
              <button style={styles.pillButton} type="button">
                <span>✦</span> Select Fantasy
              </button>
            </div>
          </div>

          {/* Genre 2: Action & Adventure */}
          <div
            style={styles.splitCard}
            onClick={() => selectGenre('action')}
            role="button"
            tabIndex={0}
          >
            <div
              style={{
                ...styles.cardImage,
                backgroundImage: "url('/images/hp_dragon_action.jpg')",
              }}
            />
            <div style={styles.cardInfo}>
              <span style={styles.cardIcon}>🐉</span>
              <h3 style={styles.cardGenreTag}>ACTION & ADVENTURE</h3>
              <h4 style={styles.cardQuote}>
                “Real courage is facing what you fear.”
              </h4>
              <div style={styles.diamondDivider}>◇</div>
              <button style={styles.pillButton} type="button">
                <span>✦</span> Select Action
              </button>
            </div>
          </div>

          {/* Genre 3: Love & Romance */}
          <div
            style={styles.splitCard}
            onClick={() => selectGenre('love')}
            role="button"
            tabIndex={0}
          >
            <div
              style={{
                ...styles.cardImage,
                backgroundImage: "url('/images/hp_genre_love.jpg')",
              }}
            />
            <div style={styles.cardInfo}>
              <span style={styles.cardIcon}>🌹</span>
              <h3 style={styles.cardGenreTag}>LOVE & ROMANCE</h3>
              <h4 style={styles.cardQuote}>
                “Somewhere, something incredible is waiting to be known.”
              </h4>
              <div style={styles.diamondDivider}>◇</div>
              <button style={styles.pillButton} type="button">
                <span>✦</span> Select Romance
              </button>
            </div>
          </div>

          {/* Genre 4: Horror & Gloom */}
          <div
            style={styles.splitCard}
            onClick={() => selectGenre('horror')}
            role="button"
            tabIndex={0}
          >
            <div
              style={{
                ...styles.cardImage,
                backgroundImage: "url('/images/hp_genre_horror.jpg')",
              }}
            />
            <div style={styles.cardInfo}>
              <span style={styles.cardIcon}>💀</span>
              <h3 style={styles.cardGenreTag}>HORROR & GLOOM</h3>
              <h4 style={styles.cardQuote}>
                “Some doors should never be opened…”
              </h4>
              <div style={styles.diamondDivider}>◇</div>
              <button style={{ ...styles.pillButton, borderColor: '#10B981' }} type="button">
                <span>✦</span> Select Horror
              </button>
            </div>
          </div>

        </div>

        {/* ── Bottom Featured Hero Banner (Matching Reference Image) ── */}
        <div style={styles.heroBanner}>
          {/* Left Column: Brand & Quote */}
          <div style={styles.bannerTextCol}>
            <div style={styles.bannerCrown}>👑</div>
            <span style={styles.bannerPickLabel}>My Top Pick for We-Watch</span>
            <div style={styles.diamondDivider}>◇</div>

            <h2 style={styles.bannerQuote}>
              “Same screen.<br />Different worlds.”
            </h2>

            <p style={styles.bannerDesc}>
              Fantasy isn't just a genre…<br />
              it's a place where dreams come alive.
            </p>

            <div style={styles.goldenSeparator} />

            <div style={styles.bannerBrandRow}>
              <h3 style={styles.bannerBrandName}>WE-WATCH</h3>
              <span style={styles.bannerTagline}>Explore. Watch. Belong.</span>
            </div>
          </div>

          {/* Right Column: Heroic Panoramic Landscape */}
          <div
            style={{
              ...styles.bannerImageCol,
              backgroundImage: "url('/images/hp_hero_landscape.jpg')",
            }}
          />
        </div>

      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9000,
    display: 'flex',
    justifyContent: 'center',
    overflowY: 'auto',
    padding: '40px 20px 60px',
  },
  bgArtwork: {
    position: 'fixed',
    inset: 0,
    backgroundImage: "url('/images/hp_hogwarts_night.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'brightness(0.72) contrast(1.12)', // Sharp & clear, low blur!
  },
  bgVignette: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(circle at center, rgba(10, 14, 24, 0.45) 0%, rgba(4, 7, 12, 0.88) 80%, #030408 100%)',
    pointerEvents: 'none',
  },
  container: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: 1080,
    display: 'flex',
    flexDirection: 'column',
    gap: 32,
    margin: 'auto 0',
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  headerCrest: {
    fontSize: 24,
    color: '#D4AF37',
    filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.6))',
  },
  mainTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: 44,
    fontWeight: 900,
    letterSpacing: 6,
    color: '#FFFFFF',
    textShadow: '0 4px 28px rgba(212, 175, 55, 0.5)',
    margin: 0,
  },
  subTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: 13,
    color: '#D4AF37',
    letterSpacing: 2,
    textTransform: 'uppercase',
    margin: 0,
  },

  // ── 1. Normal Time Hero Card (Prominently Above) ──
  normalTimeHeroCard: {
    display: 'flex',
    background: 'linear-gradient(135deg, #131A2A 0%, #0C121E 100%)',
    border: '1.5px solid rgba(212, 175, 55, 0.45)',
    borderRadius: 22,
    overflow: 'hidden',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
    cursor: 'pointer',
    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease',
  },
  normalHeroImage: {
    flex: '0 0 45%',
    minHeight: 220,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRight: '1.5px solid rgba(212, 175, 55, 0.25)',
  },
  normalHeroInfo: {
    flex: 1,
    padding: '28px 32px 24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 10,
  },
  genreBadge: {
    alignSelf: 'flex-start',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: "'Cinzel', serif",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.5,
    color: '#D4AF37',
    background: 'rgba(212, 175, 55, 0.12)',
    border: '1px solid rgba(212, 175, 55, 0.35)',
    borderRadius: 16,
    padding: '4px 12px',
  },
  normalHeroQuote: {
    fontFamily: "'Cinzel', serif",
    fontSize: 18,
    fontWeight: 800,
    color: '#FFFFFF',
    lineHeight: 1.4,
    margin: 0,
  },
  genreNote: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    margin: 0,
    lineHeight: 1.5,
  },
  normalHeroButton: {
    alignSelf: 'flex-start',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: "'Cinzel', serif",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 1.5,
    color: '#0A0E17',
    background: 'linear-gradient(135deg, #FDE68A 0%, #D4AF37 100%)',
    border: 'none',
    borderRadius: 20,
    padding: '9px 24px',
    cursor: 'pointer',
    marginTop: 4,
    boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)',
    transition: 'all 0.15s ease',
  },

  // ── 2. Story Time Header (From There Down) ──
  storySectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    margin: '8px 0',
  },
  storyHeaderDivider: {
    flex: 1,
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.4), transparent)',
  },
  storyHeaderContent: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  storyHeaderCrest: {
    fontSize: 16,
    color: '#D4AF37',
    letterSpacing: 2,
  },
  storySectionTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: 4,
    color: '#FFFFFF',
    textShadow: '0 0 16px rgba(212, 175, 55, 0.45)',
    margin: 0,
  },
  storySectionSub: {
    fontFamily: "'Cinzel', serif",
    fontSize: 11,
    color: '#D4AF37',
    letterSpacing: 1.2,
    margin: 0,
    opacity: 0.85,
  },
  cardGenreTag: {
    fontFamily: "'Cinzel', serif",
    fontSize: 11,
    fontWeight: 800,
    color: '#D4AF37',
    letterSpacing: 1.5,
    margin: '0 0 2px',
  },

  // ── 2x2 Split Cards Grid ──
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
    gap: 22,
  },
  splitCard: {
    display: 'flex',
    background: '#0B0F1A',
    border: '1px solid rgba(212, 175, 55, 0.28)',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 20px 45px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.12)',
    cursor: 'pointer',
    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease',
  },
  cardImage: {
    flex: '0 0 46%',
    minHeight: 210,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRight: '1px solid rgba(212, 175, 55, 0.18)',
  },
  cardInfo: {
    flex: 1,
    padding: '24px 24px 20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
  },
  cardIcon: {
    fontSize: 18,
    color: '#D4AF37',
    marginBottom: -2,
  },
  cardQuote: {
    fontFamily: "'Cinzel', serif",
    fontSize: 16,
    fontWeight: 700,
    color: '#F8FAFC',
    lineHeight: 1.45,
    margin: 0,
  },
  diamondDivider: {
    fontSize: 12,
    color: '#D4AF37',
    opacity: 0.8,
  },
  cardDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
    lineHeight: 1.45,
    margin: 0,
    flex: 1,
  },
  pillButton: {
    alignSelf: 'flex-start',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: "'Cinzel', serif",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    color: '#F8FAFC',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(212, 175, 55, 0.4)',
    borderRadius: 20,
    padding: '7px 18px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    marginTop: 6,
  },

  // ── Bottom Featured Hero Banner (Matching Reference Image) ──
  heroBanner: {
    display: 'flex',
    background: '#0B0F1A',
    border: '1px solid rgba(212, 175, 55, 0.35)',
    borderRadius: 22,
    overflow: 'hidden',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.14)',
    minHeight: 280,
  },
  bannerTextCol: {
    flex: '0 0 38%',
    padding: '32px 36px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: 8,
    background: 'linear-gradient(135deg, #090D18 0%, #0F1422 100%)',
    borderRight: '1px solid rgba(212, 175, 55, 0.2)',
  },
  bannerCrown: {
    fontSize: 22,
    color: '#D4AF37',
    filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.5))',
  },
  bannerPickLabel: {
    fontFamily: "'Cinzel', serif",
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  bannerQuote: {
    fontFamily: "'Cinzel', serif",
    fontSize: 22,
    fontWeight: 800,
    color: '#F8FAFC',
    lineHeight: 1.35,
    margin: '4px 0 0',
  },
  bannerDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
    lineHeight: 1.5,
    margin: 0,
  },
  goldenSeparator: {
    width: 60,
    height: 1,
    background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
    margin: '8px 0',
  },
  bannerBrandRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  bannerBrandName: {
    fontFamily: "'Cinzel', serif",
    fontSize: 20,
    fontWeight: 900,
    letterSpacing: 3,
    color: '#FFFFFF',
    margin: 0,
  },
  bannerTagline: {
    fontFamily: "'Cinzel', serif",
    fontSize: 11,
    color: '#D4AF37',
    letterSpacing: 1.5,
  },
  bannerImageCol: {
    flex: 1,
    backgroundSize: 'cover',
    backgroundPosition: 'center right',
  },
};
