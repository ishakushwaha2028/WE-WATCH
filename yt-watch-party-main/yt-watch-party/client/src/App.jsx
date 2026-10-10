import React, { useState, useEffect, useCallback } from 'react';
import { SocketProvider, useSocket } from './context/SocketContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import SwordLoader   from './components/SwordLoader';
import CloudTransition from './components/CloudTransition';
import ModeSelector  from './components/ModeSelector';
import Lobby         from './components/Lobby';
import Player        from './components/Player';
import Sidebar       from './components/Sidebar';
import Chat          from './components/Chat';
import { ReactionsOverlay } from './components/Reactions';

// ── Inner app (needs socket & theme context) ─────────────────────────────────
function Inner() {
  const { socket, addToast } = useSocket();
  const { mode, currentTheme } = useTheme();

  // ── Introductory loading animation state ──
  const [showLoader, setShowLoader] = useState(true);

  // ── State ────────────────────────────────────────────────────────────────
  const [roomId,       setRoomId]       = useState(null);
  const [myUserId,     setMyUserId]     = useState(null);
  const [myRole,       setMyRole]       = useState('participant');
  const [participants, setParticipants] = useState([]);
  const [videoState,   setVideoState]   = useState({
    videoId: '', playing: false, currentTime: 0,
  });
  const [messages,     setMessages]     = useState([]);
  const [pendingReqs,  setPendingReqs]  = useState([]);
  const [reactions,    setReactions]    = useState([]);

  // ── Socket event handlers ────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onSyncState = ({ videoId, playing, currentTime, participants: ps, pendingRequests: prs }) => {
      setVideoState({
        videoId:     videoId      || '',
        playing:     playing      ?? false,
        currentTime: currentTime  ?? 0,
      });
      const list = ps || [];
      setParticipants(list);
      if (Array.isArray(prs)) {
        setPendingReqs(prs);
      }
      setMyUserId(prev => {
        const me = list.find(p => p.userId === prev);
        if (me) setMyRole(me.role);
        return prev;
      });
    };

    const onUserJoined = ({ username, role, participants: ps }) => {
      setParticipants(ps);
      addToast(`${username} joined as ${role}`, 'info', 2500);
    };

    const onUserLeft = ({ username, participants: ps }) => {
      setParticipants(ps);
      addToast(`${username} left`, 'info', 2000);
    };

    const onPlay = ({ currentTime }) => {
      setVideoState(v => ({ ...v, playing: true, currentTime }));
    };

    const onPause = ({ currentTime }) => {
      setVideoState(v => ({ ...v, playing: false, currentTime }));
    };

    const onSeek = ({ time }) => {
      setVideoState(v => ({ ...v, currentTime: time }));
    };

    const onChangeVideo = ({ videoId }) => {
      setVideoState({ videoId, playing: false, currentTime: 0 });
      addToast('Video changed', 'info', 2000);
    };

    const onRoleAssigned = ({ userId, username, role, participants: ps }) => {
      setParticipants(ps);
      setMyUserId(prev => {
        if (prev === userId) setMyRole(role);
        return prev;
      });
      addToast(`${username} is now ${role}`, 'success', 2500);
    };

    const onParticipantRemoved = ({ participants: ps }) => {
      setParticipants(ps);
    };

    const onRemovedFromRoom = ({ message }) => {
      addToast(message || 'You were removed from the room.', 'error', 5000);
      setRoomId(null);
      setParticipants([]);
      setMessages([]);
      setPendingReqs([]);
      setReactions([]);
    };

    const onChatMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };

    const onControlRequest = (req) => {
      setPendingReqs(prev => {
        if (prev.some(r => r.id === req.id)) return prev;
        return [...prev, req];
      });
    };

    const onDismissControlRequest = ({ requestId }) => {
      setPendingReqs(prev => prev.filter(r => r.id !== requestId));
    };

    const onControlRequestSent = ({ message }) => {
      addToast(message || 'Request sent to Host/Moderator', 'info', 3000);
    };

    const onControlRequestResolved = ({ message, approved }) => {
      addToast(message, approved ? 'success' : 'error', 4000);
    };

    const onHostTransferred = ({ message }) => {
      addToast(message, 'info', 4000);
    };

    const onReaction = (reaction) => {
      const left = Math.floor(Math.random() * 60) + 20; // 20% to 80%
      const duration = (Math.random() * 0.8 + 2.0).toFixed(1);
      const newReaction = { ...reaction, left, duration };

      setReactions(prev => [...prev.slice(-12), newReaction]);
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 2500);
    };

    socket.on('sync_state',                onSyncState);
    socket.on('user_joined',               onUserJoined);
    socket.on('user_left',                 onUserLeft);
    socket.on('play',                      onPlay);
    socket.on('pause',                     onPause);
    socket.on('seek',                      onSeek);
    socket.on('change_video',              onChangeVideo);
    socket.on('role_assigned',             onRoleAssigned);
    socket.on('participant_removed',       onParticipantRemoved);
    socket.on('removed_from_room',         onRemovedFromRoom);
    socket.on('chat_message',              onChatMessage);
    socket.on('control_request',           onControlRequest);
    socket.on('dismiss_control_request',   onDismissControlRequest);
    socket.on('control_request_sent',      onControlRequestSent);
    socket.on('control_request_resolved',  onControlRequestResolved);
    socket.on('host_transferred',          onHostTransferred);
    socket.on('reaction',                  onReaction);

    return () => {
      socket.off('sync_state',                onSyncState);
      socket.off('user_joined',               onUserJoined);
      socket.off('user_left',                 onUserLeft);
      socket.off('play',                      onPlay);
      socket.off('pause',                     onPause);
      socket.off('seek',                      onSeek);
      socket.off('change_video',              onChangeVideo);
      socket.off('role_assigned',             onRoleAssigned);
      socket.off('participant_removed',       onParticipantRemoved);
      socket.off('removed_from_room',         onRemovedFromRoom);
      socket.off('chat_message',              onChatMessage);
      socket.off('control_request',           onControlRequest);
      socket.off('dismiss_control_request',   onDismissControlRequest);
      socket.off('control_request_sent',      onControlRequestSent);
      socket.off('control_request_resolved',  onControlRequestResolved);
      socket.off('host_transferred',          onHostTransferred);
      socket.off('reaction',                  onReaction);
    };
  }, [socket, addToast]);

  // Keep myRole in sync when participants list updates
  useEffect(() => {
    if (!myUserId) return;
    const me = participants.find(p => p.userId === myUserId);
    if (me) setMyRole(me.role);
  }, [participants, myUserId]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const joinRoom = useCallback((id, username, userId) => {
    setRoomId(id);
    setMyUserId(userId);
    socket.emit('join_room', {
      roomId: id,
      username,
      userId,
    });
  }, [socket]);

  const leaveRoom = useCallback(() => {
    socket.emit('leave_room');
    setRoomId(null);
    setParticipants([]);
    setMessages([]);
    setPendingReqs([]);
    setReactions([]);
  }, [socket]);

  const approveControlRequest = useCallback((req) => {
    socket.emit('resolve_control_request', { requestId: req.id, approved: true });
    setPendingReqs(prev => prev.filter(r => r.id !== req.id));
    addToast(`Approved ${req.fromUsername}'s request`, 'success', 2000);
  }, [socket, addToast]);

  const denyControlRequest = useCallback((req) => {
    socket.emit('resolve_control_request', { requestId: req.id, approved: false });
    setPendingReqs(prev => prev.filter(r => r.id !== req.id));
    addToast(`Denied ${req.fromUsername}'s request`, 'info', 2000);
  }, [socket, addToast]);

  const canControl = myRole === 'host' || myRole === 'moderator';

  function formatActionText(req) {
    if (req.action === 'play') return 'wants to play the video';
    if (req.action === 'pause') return 'wants to pause the video';
    if (req.action === 'seek') {
      const sec = req.payload?.time || 0;
      const m = Math.floor(sec / 60);
      const s = String(Math.floor(sec % 60)).padStart(2, '0');
      return `wants to seek to ${m}:${s}`;
    }
    if (req.action === 'change_video') {
      return `wants to change video (ID: ${req.payload?.videoId || 'new'})`;
    }
    return `wants to ${req.action}`;
  }

  return (
    <>
      {/* Cloud-parting magical transition effect triggered on any genre/mode shift */}
      <CloudTransition />

      {showLoader ? (
        <SwordLoader onComplete={() => setShowLoader(false)} />
      ) : !mode ? (
        <ModeSelector onSelected={() => {}} />
      ) : !roomId ? (
        <Lobby onJoin={joinRoom} />
      ) : (
        <div style={{
      ...styles.layout,
      backgroundImage: `url('${currentTheme.bgImage}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      {/* Real-time floating emojis popping up across the room */}
      <ReactionsOverlay reactions={reactions} />

      {/* Background theme tint overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: currentTheme.colors.bgOverlay,
        backdropFilter: 'none',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      {/* Main room content */}
      <div style={{ ...styles.contentLayer, zIndex: 10 }}>
        {/* Left: Player area */}
        <div style={styles.main}>
          <Player
            socket={socket}
            roomId={roomId}
            videoState={videoState}
            canControl={canControl}
            myRole={myRole}
            reactions={reactions}
          />

          {/* Pending control requests banner for host/moderator */}
          {canControl && pendingReqs.length > 0 && (
            <div style={{
              ...styles.reqBanner,
              background: currentTheme.colors.cardBg,
              borderColor: currentTheme.colors.cardBorder,
            }}>
              {pendingReqs.map(req => (
                <div key={req.id} style={{
                  ...styles.reqItem,
                  background: currentTheme.isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(10, 15, 25, 0.85)',
                  borderColor: currentTheme.colors.cardBorder,
                }}>
                  <span style={{ color: currentTheme.colors.textSecondary, fontSize: 13 }}>
                    <b style={{ color: currentTheme.colors.textPrimary }}>{req.fromUsername}</b> {formatActionText(req)}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn-primary"
                      style={{ padding: '4px 12px', fontSize: 12, background: currentTheme.colors.accentPrimary }}
                      onClick={() => approveControlRequest(req)}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="btn-ghost"
                      style={{ fontSize: 12, color: currentTheme.colors.textSecondary }}
                      onClick={() => denyControlRequest(req)}
                    >
                      ✕ Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Chat
            socket={socket}
            roomId={roomId}
            messages={messages}
            myUserId={myUserId}
          />
        </div>

        {/* Right: Sidebar */}
        <Sidebar
          roomId={roomId}
          participants={participants}
          myUserId={myUserId}
          myRole={myRole}
          socket={socket}
          onLeave={leaveRoom}
        />
      </div>
    </div>
      )}
    </>
  );
}

const styles = {
  layout: {
    position: 'relative',
    height: '100vh',
    overflow: 'hidden',
  },
  contentLayer: {
    position: 'relative',
    display: 'flex',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
  },
  reqBanner: {
    borderTop: '1px solid',
    padding: '10px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    backdropFilter: 'blur(8px)',
  },
  reqItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid',
    borderRadius: 8,
    padding: '8px 14px',
  },
};

// ── Root export with Providers ────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <Inner />
      </SocketProvider>
    </ThemeProvider>
  );
}
