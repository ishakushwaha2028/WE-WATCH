/**
 * SwordLoader.jsx
 * Grand, cinematic 3D sword loading screen inspired by the Sword of Gryffindor.
 * Features a large, ornate horizontal sword with glowing runes and stardust energy.
 */
import React, { useState, useEffect } from 'react';

const INCANTATIONS = [
  'Awakening the Sword of Gryffindor…',
  'Aligning synchronized celestial frequencies…',
  'Infusing runic blade with stardust energy…',
  'Alohomora! Unlocking the gates of We-Watch…',
];

export default function SwordLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [incantIdx, setIncantIdx] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isSlashing, setIsSlashing] = useState(false);

  // 10-second runic charging sequence so the sword is clearly visible!
  useEffect(() => {
    const startTime = Date.now();
    const duration = 10000; // 10 seconds at least

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timer);
        setIsReady(true);
      }
    }, 100);

    const incantTimer = setInterval(() => {
      setIncantIdx(prev => (prev + 1) % INCANTATIONS.length);
    }, 2500);

    return () => {
      clearInterval(timer);
      clearInterval(incantTimer);
    };
  }, []);

  function handleEnter() {
    setIsSlashing(true);
    setTimeout(() => {
      onComplete();
    }, 650);
  }

  // Auto-transition when 100% loaded (after 10s)
  useEffect(() => {
    if (isReady && !isSlashing) {
      const t = setTimeout(handleEnter, 600);
      return () => clearTimeout(t);
    }
  }, [isReady]);

  return (
    <div style={{
      ...styles.overlay,
      opacity: isSlashing ? 0 : 1,
      transform: isSlashing ? 'scale(1.06)' : 'scale(1)',
      transition: 'opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      {/* Background artwork: crystal clear, sharp, zero blur */}
      <div style={styles.bgImage} />
      <div style={styles.bgGradient} />

      {/* Main 3D Sword Stage */}
      <div style={styles.stage}>
        {/* Title */}
        <div style={styles.header}>
          <span style={styles.crestSpark}>✦</span>
          <h1 style={styles.brandTitle}>WE-WATCH</h1>
          <p style={styles.brandSubtitle}>Explore. Watch. Belong.</p>
        </div>

        {/* ── Large 3D Sword Showcase (3D Curvature, Not a Rigid Box) ── */}
        <div style={styles.swordContainer}>
          {/* Top blade glow aura */}
          <div style={{
            ...styles.swordAura,
            opacity: Math.min(1, progress / 50),
          }} />

          {/* The Grand 3D Sword Graphic */}
          <div style={styles.sword3D}>
            {/* 1. Large 3D Pommel with Glowing Ruby */}
            <div style={styles.pommel3D}>
              <div style={styles.lionRelief}>🦁</div>
              <div style={styles.rubyGem} />
            </div>

            {/* 2. Textured Braided Golden Grip */}
            <div style={styles.hiltGrip}>
              <div style={styles.gripWrap} />
            </div>

            {/* 3. Golden Crossguard with Rubies */}
            <div style={styles.crossguard3D}>
              <div style={styles.guardRubyLeft} />
              <div style={styles.guardCenterRuby} />
              <div style={styles.guardRubyRight} />
            </div>

            {/* 4. Grand Runic Broadsword Blade */}
            <div style={styles.bladeContainer}>
              {/* Silver-steel metallic blade body */}
              <div style={styles.bladeBody}>
                {/* Center fuller groove */}
                <div style={styles.bladeFuller} />

                {/* Engraved Ancient Runes */}
                <div style={styles.engravedRunes}>
                  <span>ᚷ</span><span>ᚱ</span><span>ᛁ</span><span>ᚠ</span><span>ᚠ</span>
                  <span>ᛁ</span><span>ᚾ</span><span>ᛞ</span><span>ᛟ</span><span>ᚱ</span>
                  <span>•</span><span>ᛋ</span><span>ᚹ</span><span>ᛟ</span><span>ᚱ</span><span>ᛞ</span>
                </div>

                {/* Magical Plasma Energy Fill */}
                <div style={{
                  ...styles.bladeEnergyFill,
                  width: `${progress}%`,
                }}>
                  {/* Glowing active blade cutting edge */}
                  <div style={styles.cuttingEdgeGlow} />
                  {/* Stardust sparks at current blade progress point */}
                  <div style={styles.tipSparks} />
                </div>
              </div>

              {/* Pointed 3D Blade Tip */}
              <div style={styles.bladePoint} />
            </div>
          </div>

          {/* Progress & Incantation status */}
          <div style={styles.statusRow}>
            <span style={styles.incantationLabel}>
              {INCANTATIONS[incantIdx]}
            </span>
            <div style={styles.progressCounter}>
              <span style={styles.percentNumber}>{progress}%</span>
            </div>
          </div>
        </div>

        {/* Enter / Skip action button */}
        <div style={styles.actionRow}>
          {isReady ? (
            <button onClick={handleEnter} style={styles.enterBtn} type="button">
              ✦ Unsheathe & Enter We-Watch
            </button>
          ) : (
            <button onClick={handleEnter} style={styles.skipBtn} type="button">
              Skip Intro →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#04060A',
    overflow: 'hidden',
    userSelect: 'none',
  },
  bgImage: {
    position: 'absolute',
    inset: 0,
    backgroundImage: "url('/images/hp_sword_loading.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'brightness(0.88) contrast(1.15)', // Sharp, vibrant, crystal clear, zero blur
  },
  bgGradient: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at center, rgba(8, 12, 22, 0.15) 0%, rgba(4, 6, 12, 0.6) 75%, #030508 100%)',
    pointerEvents: 'none',
  },
  stage: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: 440, // Quite small!
    padding: '16px 14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  crestSpark: {
    fontSize: 16,
    color: '#D4AF37',
    filter: 'drop-shadow(0 0 8px #D4AF37)',
  },
  brandTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: 26,
    fontWeight: 900,
    letterSpacing: 4,
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDE68A 45%, #D4AF37 80%, #92400E 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 2px 18px rgba(212, 175, 55, 0.55)',
    margin: 0,
  },
  brandSubtitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: 10,
    color: '#D4AF37',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    margin: 0,
    opacity: 0.9,
  },

  // ── Sword Showcase Box (Quite Small & Sleek) ──
  swordContainer: {
    width: '100%',
    position: 'relative',
    background: 'linear-gradient(145deg, rgba(14, 20, 36, 0.88) 0%, rgba(7, 10, 18, 0.94) 100%)',
    border: '1px solid rgba(212, 175, 55, 0.35)',
    borderRadius: 14,
    padding: '12px 16px 10px',
    boxShadow: '0 14px 36px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.14)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  swordAura: {
    position: 'absolute',
    top: 8,
    left: '8%',
    right: '8%',
    height: 22,
    background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.25) 0%, rgba(212, 175, 55, 0.18) 50%, transparent 80%)',
    pointerEvents: 'none',
    transition: 'opacity 0.4s ease',
  },

  // ── Small Sleek 3D Sword Assembly ──
  sword3D: {
    display: 'flex',
    alignItems: 'center',
    height: 28, // Quite small!
    position: 'relative',
    filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.85))',
  },

  // 1. Small 3D Pommel
  pommel3D: {
    width: 20,
    height: 24,
    borderRadius: '50% 0 0 50%',
    background: 'linear-gradient(135deg, #FEF08A 0%, #D97706 50%, #78350F 100%)',
    border: '1.2px solid #F59E0B',
    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), 0 0 8px rgba(245, 158, 11, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  lionRelief: {
    fontSize: 9,
    filter: 'drop-shadow(0 1px 1px #000)',
  },
  rubyGem: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: 'radial-gradient(circle at 35% 35%, #FCA5A5 0%, #DC2626 50%, #7F1D1D 100%)',
    border: '0.8px solid #FEF2F2',
    boxShadow: '0 0 6px #EF4444',
  },

  // 2. Small Textured Grip
  hiltGrip: {
    width: 14,
    height: 12,
    background: 'linear-gradient(180deg, #B45309 0%, #78350F 50%, #451A03 100%)',
    borderTop: '0.8px solid #F59E0B',
    borderBottom: '0.8px solid #F59E0B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  gripWrap: {
    width: '100%',
    height: '100%',
    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(253, 230, 138, 0.4) 2px, rgba(253, 230, 138, 0.4) 4px)',
  },

  // 3. Small 3D Crossguard
  crossguard3D: {
    width: 10,
    height: 32,
    background: 'linear-gradient(180deg, #FEF08A 0%, #F59E0B 35%, #B45309 70%, #78350F 100%)',
    border: '0.8px solid #FDE68A',
    borderRadius: 3,
    boxShadow: '0 0 10px rgba(217, 119, 6, 0.5), inset 0 1px 1px rgba(255,255,255,0.4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '2px 0',
    flexShrink: 0,
    zIndex: 4,
  },
  guardRubyLeft: {
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: 'radial-gradient(circle at 35% 35%, #FCA5A5 0%, #DC2626 60%, #7F1D1D 100%)',
    border: '0.5px solid #FEF2F2',
    boxShadow: '0 0 3px #EF4444',
  },
  guardCenterRuby: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'radial-gradient(circle at 35% 35%, #FCA5A5 0%, #DC2626 50%, #7F1D1D 100%)',
    border: '0.8px solid #FFF',
    boxShadow: '0 0 6px #DC2626',
  },
  guardRubyRight: {
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: 'radial-gradient(circle at 35% 35%, #FCA5A5 0%, #DC2626 60%, #7F1D1D 100%)',
    border: '0.5px solid #FEF2F2',
    boxShadow: '0 0 3px #EF4444',
  },

  // 4. Small Blade Track
  bladeContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    height: 18,
    position: 'relative',
  },
  bladeBody: {
    flex: 1,
    height: 16,
    background: 'linear-gradient(180deg, #F8FAFC 0%, #CBD5E1 18%, #64748B 50%, #334155 82%, #1E293B 100%)',
    borderTop: '1px solid #F1F5F9',
    borderBottom: '1px solid #475569',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.7)',
  },
  bladeFuller: {
    position: 'absolute',
    top: '47%',
    left: 0,
    right: 0,
    height: 2,
    background: '#0F172A',
    boxShadow: 'inset 0 0.5px 1px #000',
    zIndex: 1,
  },
  engravedRunes: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    color: 'rgba(248, 250, 252, 0.5)',
    fontSize: 8,
    fontFamily: 'serif',
    fontWeight: 'bold',
    letterSpacing: 2,
    zIndex: 2,
    pointerEvents: 'none',
  },
  bladeEnergyFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, rgba(217, 119, 6, 0.8) 0%, rgba(245, 158, 11, 0.88) 25%, rgba(56, 189, 248, 0.95) 75%, #FFFFFF 100%)',
    boxShadow: '0 0 14px rgba(56, 189, 248, 0.9), 0 0 8px rgba(245, 158, 11, 0.95)',
    transition: 'width 0.1s linear',
    zIndex: 3,
  },
  cuttingEdgeGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 1.5,
    background: '#FFFFFF',
    boxShadow: '0 0 6px #38BDF8',
  },
  tipSparks: {
    position: 'absolute',
    right: -5,
    top: -4,
    width: 10,
    height: 24,
    borderRadius: '50%',
    background: '#FFFFFF',
    boxShadow: '0 0 12px #38BDF8, 0 0 18px #F59E0B',
  },
  bladePoint: {
    width: 0,
    height: 0,
    borderTop: '8px solid transparent',
    borderBottom: '8px solid transparent',
    borderLeft: '16px solid #64748B',
    flexShrink: 0,
  },

  // Status Row
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '0 2px',
  },
  incantationLabel: {
    fontFamily: "'Cinzel', serif",
    fontSize: 11,
    color: '#D4AF37',
    fontStyle: 'italic',
    letterSpacing: 0.5,
    textShadow: '0 0 8px rgba(212, 175, 55, 0.4)',
  },
  progressCounter: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  percentNumber: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: 900,
    color: '#38BDF8',
    textShadow: '0 0 10px rgba(56, 189, 248, 0.8)',
  },

  // Actions
  actionRow: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  enterBtn: {
    fontFamily: "'Cinzel', serif",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1.2,
    background: 'linear-gradient(135deg, #D4AF37 0%, #B45309 100%)',
    color: '#FFFFFF',
    border: '1px solid #FDE68A',
    borderRadius: 20,
    padding: '8px 24px',
    cursor: 'pointer',
    boxShadow: '0 4px 18px rgba(212, 175, 55, 0.55)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  skipBtn: {
    fontFamily: "'Cinzel', serif",
    fontSize: 11,
    color: '#94A3B8',
    background: 'transparent',
    border: '1px solid rgba(148, 163, 184, 0.35)',
    borderRadius: 14,
    padding: '5px 14px',
    cursor: 'pointer',
    letterSpacing: 0.8,
  },
};
