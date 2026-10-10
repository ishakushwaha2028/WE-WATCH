/**
 * Player.jsx
 * YouTube IFrame API player with full bidirectional sync.
 * Features:
 *  - Native controls hidden (controls=0) with custom controls for full sync integrity
 *  - Immediate seek synchronization without gating
 *  - Periodic heartbeat time sync to prevent lag drift
 *  - Participant control requests (Play, Pause, Seek, Change Video)
 *  - Viewer mode (watch-only, restricted from control requests)
 *  - Real-time animated emoji reactions overlay
 *  - Clear error handling for embedding restrictions (error 101/150/100)
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ReactionsBar } from './Reactions';
import { useTheme } from '../context/ThemeContext';
import AtmosphereBar from './AtmosphereBar';

// ─── YouTube IFrame API bootstrap ────────────────────────────────────────────
let _ytReady = false;
const _ytQueue = [];

if (typeof window !== 'undefined') {
  window.onYouTubeIframeAPIReady = () => {
    _ytReady = true;
    _ytQueue.forEach(fn => fn());
    _ytQueue.length = 0;
  };
  if (window.YT?.Player) _ytReady = true;
}

function whenYTReady(cb) {
  if (_ytReady && window.YT?.Player) return cb();
  _ytQueue.push(cb);
  if (!document.getElementById('yt-api-script')) {
    const s = document.createElement('script');
    s.id = 'yt-api-script';
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    document.head.appendChild(s);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function extractVideoId(raw) {
  if (!raw) return '';
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /\/embed\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const re of patterns) {
    const m = raw.match(re);
    if (m) return m[1];
  }
  return '';
}

function fmtTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

const DRIFT_THRESHOLD = 2.0;

const ROLE_META = {
  host: { label: '👑 Host', color: '#FF0000' },
  moderator: { label: '🛡 Moderator', color: '#F59E0B' },
  participant: { label: '👤 Participant', color: '#AAAAAA' },
  viewer: { label: '👁 Viewer', color: '#6B7280' },
};

export default function Player({ socket, roomId, videoState, canControl, myRole, myUserId, participants = [], reactions = [] }) {
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const suppressRef = useRef(false);
  const suppressTimer = useRef(null);
  const tickRef = useRef(null);
  const canControlRef = useRef(canControl);

  const [playerReady, setPlayerReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentSec, setCurrentSec] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlErr, setUrlErr] = useState('');
  const [ytError, setYtError] = useState('');

  const loadedVideoRef = useRef('');

  useEffect(() => { canControlRef.current = canControl; }, [canControl]);

  // ── Progress ticker ───────────────────────────────────────────────────────
  function startTick() {
    stopTick();
    tickRef.current = setInterval(() => {
      const t = playerRef.current?.getCurrentTime?.();
      if (t != null) setCurrentSec(t);
    }, 500);
  }

  function stopTick() {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  // ── Suppress echo ─────────────────────────────────────────────────────────
  function suppress(ms = 700) {
    suppressRef.current = true;
    clearTimeout(suppressTimer.current);
    suppressTimer.current = setTimeout(() => { suppressRef.current = false; }, ms);
  }

  // ── Periodic heartbeat time sync from Host / Moderator ───────────────────
  useEffect(() => {
    if (!canControl || !playing || !playerReady || !socket) return;
    const interval = setInterval(() => {
      const t = playerRef.current?.getCurrentTime?.();
      if (typeof t === 'number' && !isNaN(t)) {
        socket.emit('time_sync', { currentTime: t });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [canControl, playing, playerReady, socket]);

  // ── Listen for direct seek and time_sync socket events ────────────────────
  useEffect(() => {
    if (!socket) return;

    const onRemoteSeek = ({ time }) => {
      const p = playerRef.current;
      if (!p || !playerReady || typeof time !== 'number') return;
      suppress(800);
      p.seekTo(time, true);
      setCurrentSec(time);
    };

    const onRemoteTimeSync = ({ currentTime }) => {
      const p = playerRef.current;
      if (!p || !playerReady || canControlRef.current) return;
      const local = p.getCurrentTime?.() || 0;
      if (Math.abs(local - currentTime) > DRIFT_THRESHOLD) {
        suppress(600);
        p.seekTo(currentTime, true);
        setCurrentSec(currentTime);
      }
    };

    socket.on('seek', onRemoteSeek);
    socket.on('time_sync', onRemoteTimeSync);

    return () => {
      socket.off('seek', onRemoteSeek);
      socket.off('time_sync', onRemoteTimeSync);
    };
  }, [socket, playerReady]);

  // ── Build / rebuild YouTube player ────────────────────────────────────────
  useEffect(() => {
    if (!videoState.videoId) return;
    if (playerRef.current) return;

    let cancelled = false;

    whenYTReady(() => {
      if (cancelled || !mountRef.current) return;

      mountRef.current.innerHTML = '';
      const div = document.createElement('div');
      div.style.width = '100%';
      div.style.height = '100%';
      mountRef.current.appendChild(div);

      playerRef.current = new window.YT.Player(div, {
        width: '100%',
        height: '100%',
        videoId: videoState.videoId,
        playerVars: {
          controls: 0,
          disablekb: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          modestbranding: 1,
          iv_load_policy: 3,
          origin: window.location.origin,
        },
        events: {
          onReady(e) {
            if (cancelled) return;
            loadedVideoRef.current = videoState.videoId;
            const dur = e.target.getDuration?.() || 0;
            setDuration(dur);
            setCurrentSec(videoState.currentTime || 0);
            setPlayerReady(true);
            setYtError('');

            suppress(900);
            if (videoState.currentTime > 0) {
              e.target.seekTo(videoState.currentTime, true);
            }
            if (videoState.playing) {
              e.target.playVideo();
            } else {
              e.target.pauseVideo();
            }
          },
          onStateChange: handleStateChange,
          onError(e) {
            console.warn('[YT error]', e.data);
            setBuffering(false);
            let msg = 'An error occurred while loading this YouTube video.';
            if (e.data === 100) msg = 'Video not found or is set to private.';
            if (e.data === 101 || e.data === 150) {
              msg = 'Embedding is disabled by the owner for this video. Please try another video URL.';
            }
            setYtError(msg);
          },
        },
      });
    });

    return () => {
      cancelled = true;
    };
  }, [videoState.videoId]); // eslint-disable-line

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopTick();
      clearTimeout(suppressTimer.current);
      try { playerRef.current?.destroy?.(); } catch (_) { }
      playerRef.current = null;
      loadedVideoRef.current = '';
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []);

  // ── Handle YouTube player state change ────────────────────────────────────
  const handleStateChange = useCallback((event) => {
    const YT = window.YT;
    const p = playerRef.current;
    if (!p || !YT) return;

    const state = event.data;

    if (state === YT.PlayerState.BUFFERING) {
      setBuffering(true);
      return;
    }
    setBuffering(false);

    if (state === YT.PlayerState.ENDED) {
      stopTick();
      setPlaying(false);
      return;
    }

    if (state === YT.PlayerState.PLAYING) {
      setPlaying(true);
      setDuration(p.getDuration?.() || 0);
      startTick();
      if (!suppressRef.current && canControlRef.current) {
        suppress(800);
        socket.emit('play', { currentTime: p.getCurrentTime?.() || 0 });
      }
    }

    if (state === YT.PlayerState.PAUSED) {
      setPlaying(false);
      stopTick();
      if (!suppressRef.current && canControlRef.current) {
        suppress(800);
        socket.emit('pause', { currentTime: p.getCurrentTime?.() || 0 });
      }
    }
  }, [socket]);

  // ── Apply remote videoState changes ───────────────────────────────────────
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !playerReady || !videoState.videoId) return;

    setYtError('');
    suppress(800);

    // Different video → load/cue
    if (videoState.videoId !== loadedVideoRef.current) {
      loadedVideoRef.current = videoState.videoId;
      if (videoState.playing) {
        p.loadVideoById({ videoId: videoState.videoId, startSeconds: videoState.currentTime });
      } else {
        p.cueVideoById({ videoId: videoState.videoId, startSeconds: videoState.currentTime });
      }
      setCurrentSec(videoState.currentTime);
      setPlaying(videoState.playing);
      return;
    }

    // Same video drift check
    const local = p.getCurrentTime?.() || 0;
    if (Math.abs(local - videoState.currentTime) > DRIFT_THRESHOLD) {
      p.seekTo(videoState.currentTime, true);
      setCurrentSec(videoState.currentTime);
    }

    if (videoState.playing) {
      p.playVideo();
      setPlaying(true);
      startTick();
    } else {
      p.pauseVideo();
      setPlaying(false);
      stopTick();
    }
  }, [videoState, playerReady]); // eslint-disable-line

  // ── Controls: Play / Pause / Seek ─────────────────────────────────────────
  function handlePlay() {
    const p = playerRef.current;
    if (!p || !canControl) return;
    suppress(800);
    p.playVideo();
    socket.emit('play', { currentTime: p.getCurrentTime?.() || 0 });
  }

  function handlePause() {
    const p = playerRef.current;
    if (!p || !canControl) return;
    suppress(800);
    p.pauseVideo();
    socket.emit('pause', { currentTime: p.getCurrentTime?.() || 0 });
  }

  function handleSeek(e) {
    const p = playerRef.current;
    if (!p || !canControl) return;
    const time = Number(e.target.value);
    suppress(800);
    p.seekTo(time, true);
    setCurrentSec(time);
    socket.emit('seek', { time });
  }

  // ── Load Video ────────────────────────────────────────────────────────────
  function handleLoadVideo(e) {
    e.preventDefault();
    setUrlErr('');
    const id = extractVideoId(urlInput.trim());
    if (!id) return setUrlErr('❌  Could not find a valid YouTube video ID in that URL.');

    if (canControl) {
      socket.emit('change_video', { videoId: id });
    } else {
      socket.emit('request_control', { action: 'change_video', payload: { videoId: id } });
      setUrlErr('🙋  Video change request sent to Host and Moderators.');
    }
    setUrlInput('');
  }

  // ── Participant Request Actions ───────────────────────────────────────────
  function requestAction(action, payload = {}) {
    socket.emit('request_control', { action, payload });
    if (action === 'play') setUrlErr('🙋 Play request sent to Host and Moderators.');
    if (action === 'pause') setUrlErr('🙋 Pause request sent to Host and Moderators.');
    if (action === 'seek') setUrlErr(`🙋 Seek request (${fmtTime(payload.time)}) sent to Host and Moderators.`);
  }

  const { currentTheme } = useTheme();

  const role = ROLE_META[myRole] || ROLE_META.participant;
  const hasVideo = !!videoState.videoId;
  const pct = duration > 0 ? Math.min(100, (currentSec / duration) * 100) : 0;

  return (
    <div style={{ ...s.wrapper, color: currentTheme.colors.textPrimary }}>
      {/* ── Top bar ── */}
      <div style={{
        ...s.topBar,
        background: currentTheme.isLight ? 'rgba(255, 252, 242, 0.92)' : 'var(--card)',
        borderBottom: `1px solid ${currentTheme.colors.cardBorder}`,
        color: currentTheme.colors.textPrimary,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ color: currentTheme.colors.accentGold, fontSize: 15, fontWeight: 900, fontFamily: "'Cinzel', serif" }}>
            WE-WATCH
          </span>
          <span style={{ ...s.roleChip, borderColor: role.color, color: role.color }}>
            {role.label}
          </span>
          {/* Prominent Host Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: currentTheme.isLight ? 'rgba(212, 175, 55, 0.2)' : 'rgba(212, 175, 55, 0.12)',
            border: '1px solid rgba(212, 175, 55, 0.55)',
            borderRadius: 20,
            padding: '3px 12px',
            fontSize: 12,
            boxShadow: '0 0 10px rgba(212, 175, 55, 0.25)',
          }}>
            <span style={{ fontSize: 13 }}>👑</span>
            <span style={{ color: currentTheme.colors.textSecondary, fontWeight: 600 }}>Host:</span>
            <b style={{ color: currentTheme.colors.accentGold, fontWeight: 800 }}>
              {(() => {
                const host = participants.find(p => p.role === 'host');
                if (!host) return 'Assigning…';
                return host.userId === myUserId ? 'You' : host.username;
              })()}
            </b>
          </div>
          <span style={{ ...s.roomLabel, color: currentTheme.colors.textSecondary }}>
            Room&nbsp;<b style={{ color: currentTheme.colors.textPrimary, letterSpacing: 2 }}>{roomId}</b>
          </span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {buffering && (
            <span style={s.bufferingPill}>⏳ Buffering…</span>
          )}
          <AtmosphereBar />
        </div>
      </div>

      {/* ── Player area ── */}
      <div style={s.playerBox}>
        {/* Error banner */}
        {ytError && (
          <div style={s.ytErrorBanner}>
            <span>⚠️ {ytError}</span>
            <button
              className="btn-secondary"
              style={{ padding: '3px 10px', fontSize: 11 }}
              onClick={() => setYtError('')}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Empty state */}
        {!hasVideo && (
          <div style={s.emptyState}>
            <div style={s.bigIcon}>▶</div>
            <p style={s.emptyTitle}>
              {canControl ? 'Load a video to start the party' : 'Waiting for host to load a video…'}
            </p>
            {canControl ? (
              <p style={s.emptyHint}>Paste any YouTube link in the bar below</p>
            ) : (
              <p style={s.emptyHint}>You can also suggest a video link using the bar below</p>
            )}
          </div>
        )}

        {/* YT iframe mount point */}
        {hasVideo && (
          <div ref={mountRef} style={s.ytMount} />
        )}

        {/* Click blocker overlay for non-controllers */}
        {!canControl && hasVideo && (
          <div style={s.clickBlocker} title="Playback is controlled by Host and Moderator" />
        )}
      </div>

      {/* ── Host / Mod controls ── */}
      {canControl && (
        <div style={s.controls}>
          <button
            style={s.playBtn}
            onClick={playing ? handlePause : handlePlay}
            disabled={!playerReady || !hasVideo}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? '⏸' : '▶'}
          </button>

          <span style={s.time}>{fmtTime(currentSec)}</span>

          <input
            type="range"
            min={0}
            max={Math.floor(duration) || 100}
            value={Math.floor(currentSec)}
            onChange={handleSeek}
            disabled={!playerReady || duration === 0}
            style={s.seekBar}
            aria-label="Seek video"
          />

          <span style={s.time}>{fmtTime(duration)}</span>
        </div>
      )}

      {/* ── Read-only progress bar for Participants / Viewers ── */}
      {!canControl && hasVideo && (
        <div style={s.controls}>
          <span style={{ fontSize: 16, color: '#aaa' }}>
            {videoState.playing ? '▶' : '⏸'}
          </span>
          <span style={s.time}>{fmtTime(currentSec)} / {fmtTime(duration)}</span>
          <div style={s.progressTrack}>
            <div style={{ ...s.progressFill, width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* ── URL input bar ── */}
      {myRole !== 'viewer' && (
        <form onSubmit={handleLoadVideo} style={s.urlBar}>
          <input
            type="text"
            placeholder={
              canControl
                ? '🔗  Paste YouTube URL or video ID to load…'
                : '🔗  Paste YouTube URL to request video change…'
            }
            value={urlInput}
            onChange={e => { setUrlInput(e.target.value); setUrlErr(''); }}
            style={{ flex: 1 }}
            autoComplete="off"
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ whiteSpace: 'nowrap', padding: '10px 22px' }}
          >
            {canControl ? '▶ Load' : '🙋 Request'}
          </button>
        </form>
      )}

      {urlErr && <p style={s.urlErr}>{urlErr}</p>}

      {/* ── Participant Request Controls ── */}
      {myRole === 'participant' && (
        <div style={s.reqRow}>
          <span style={{ color: '#888', fontSize: 12 }}>Request control approval:</span>
          <button
            className="btn-secondary"
            style={s.reqBtn}
            onClick={() => requestAction('play')}
          >
            ▶ Request Play
          </button>
          <button
            className="btn-secondary"
            style={s.reqBtn}
            onClick={() => requestAction('pause')}
          >
            ⏸ Request Pause
          </button>
          {hasVideo && (
            <button
              className="btn-secondary"
              style={s.reqBtn}
              onClick={() => {
                const target = Math.max(0, currentSec - 10);
                requestAction('seek', { time: target });
              }}
            >
              ⏪ Seek -10s
            </button>
          )}
          {hasVideo && (
            <button
              className="btn-secondary"
              style={s.reqBtn}
              onClick={() => {
                const target = Math.min(duration, currentSec + 10);
                requestAction('seek', { time: target });
              }}
            >
              ⏩ Seek +10s
            </button>
          )}
        </div>
      )}

      {/* ── Viewer Status Notice ── */}
      {myRole === 'viewer' && (
        <div style={s.reqRow}>
          <span style={{ color: '#888', fontSize: 12 }}>
            👁 You are currently in <b>Viewer</b> mode (watch-only). Ask the Host to promote you to Participant to send control requests.
          </span>
        </div>
      )}

      {/* ── Real-Time Reaction Bar ── */}
      <ReactionsBar socket={socket} roomId={roomId} disabled={!roomId} />
    </div>
  );
}

const s = {
  wrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: 'var(--bg)',
    minHeight: 0,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 16px',
    background: 'var(--card)',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
    minHeight: 44,
  },
  roleChip: {
    border: '1px solid',
    borderRadius: 20,
    padding: '3px 12px',
    fontSize: 12,
    fontWeight: 700,
  },
  roomLabel: {
    fontSize: 13,
    color: '#aaa',
  },
  bufferingPill: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#F59E0B',
    background: '#1f1a0e',
    border: '1px solid #F59E0B55',
    borderRadius: 12,
    padding: '2px 10px',
  },
  playerBox: {
    flex: 1,
    position: 'relative',
    background: 'var(--bg)',
    minHeight: 0,
    overflow: 'hidden',
  },
  ytErrorBanner: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    zIndex: 30,
    background: 'rgba(239, 68, 68, 0.95)',
    color: '#fff',
    borderRadius: 8,
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 13,
    fontWeight: 500,
    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
  },
  emptyState: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  bigIcon: {
    fontSize: 72,
    color: 'var(--primary)',
    lineHeight: 1,
    filter: 'drop-shadow(0 0 24px rgba(255, 0, 0, 0.35))',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#fff',
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
  ytMount: {
    position: 'absolute',
    inset: 0,
    background: '#000',
  },
  clickBlocker: {
    position: 'absolute',
    inset: 0,
    zIndex: 10,
    cursor: 'default',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 16px',
    background: '#111',
    borderTop: '1px solid var(--border)',
    flexShrink: 0,
    minHeight: 52,
  },
  playBtn: {
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    width: 40,
    height: 40,
    fontSize: 17,
    cursor: 'pointer',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s',
  },
  time: {
    color: '#aaa',
    fontSize: 12,
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    minWidth: 40,
  },
  seekBar: {
    flex: 1,
    accentColor: 'var(--primary)',
    cursor: 'pointer',
    height: 4,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    background: 'var(--border)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'var(--primary)',
    borderRadius: 2,
    transition: 'width 0.5s linear',
  },
  urlBar: {
    display: 'flex',
    gap: 10,
    padding: '10px 16px',
    background: 'var(--card)',
    borderTop: '1px solid var(--border)',
    flexShrink: 0,
  },
  urlErr: {
    fontSize: 12,
    padding: '0 16px 8px',
    background: 'var(--card)',
    color: 'var(--error)',
  },
  reqRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px 10px',
    background: 'var(--card)',
    borderTop: '1px solid var(--border)',
    flexShrink: 0,
    flexWrap: 'wrap',
  },
  reqBtn: {
    fontSize: 12,
    padding: '4px 12px',
  },
};
