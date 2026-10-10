/**
 * Sidebar
 * Shows: room info, invite link, participant list with role management.
 * Host can assign roles, remove participants, or transfer host.
 */
import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const ROLE_COLORS = {
  host: '#FF0000',
  moderator: '#F59E0B',
  participant: '#AAAAAA',
  viewer: '#6B7280',
};

const ROLE_ICONS = {
  host: '👑',
  moderator: '🛡',
  participant: '👤',
  viewer: '👁',
};

export default function Sidebar({ roomId, participants, myUserId, myRole, socket, onLeave }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(null); // userId of expanded participant menu

  const isHost = myRole === 'host';

  function copyInvite() {
    const url = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function copyCode() {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function assignRole(userId, role) {
    socket.emit('assign_role', { userId, role });
    setExpanded(null);
  }

  function removeParticipant(userId) {
    if (window.confirm('Remove this participant from the room?')) {
      socket.emit('remove_participant', { userId });
    }
    setExpanded(null);
  }

  const { currentTheme } = useTheme();

  return (
    <aside style={{
      ...styles.sidebar,
      background: currentTheme.colors.sidebarBg,
      borderLeft: `1px solid ${currentTheme.colors.cardBorder}`,
      color: currentTheme.colors.textPrimary,
    }}>
      {/* ── Room info ── */}
      <div style={styles.section}>
        <h2 style={{ ...styles.sectionTitle, color: currentTheme.colors.textSecondary, fontFamily: "'Cinzel', serif" }}>
          We-Watch Room
        </h2>
        <div style={{ ...styles.roomCode, color: currentTheme.colors.accentGold }}>{roomId}</div>
        <div style={styles.inviteRow}>
          <button className="btn-secondary" style={styles.inviteBtn} onClick={copyCode}>
            {copied ? '✓ Copied' : '📋 Copy Code'}
          </button>
          <button className="btn-secondary" style={styles.inviteBtn} onClick={copyInvite}>
            🔗 Copy Link
          </button>
        </div>
      </div>

      <div style={styles.divider} />

      {/* ── Participants ── */}
      <div style={{ ...styles.section, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <h3 style={styles.sectionTitle}>
          Participants
          <span style={styles.count}>{participants.length}</span>
        </h3>

        <div style={styles.participantList}>
          {participants.map(p => {
            const isMe = p.userId === myUserId;
            const menuOpen = expanded === p.userId;

            return (
              <div key={p.userId} style={styles.participantItem}>
                {/* Avatar + name */}
                <div style={styles.avatar(p.role)}>
                  {p.username.charAt(0).toUpperCase()}
                </div>
                <div style={styles.pInfo}>
                  <span style={styles.pName}>
                    {p.username}
                    {isMe && <span style={styles.youBadge}>you</span>}
                  </span>
                  <span style={{ ...styles.pRole, color: ROLE_COLORS[p.role] }}>
                    {ROLE_ICONS[p.role]} {p.role}
                  </span>
                </div>

                {/* Host actions (not on self unless transferring host) */}
                {isHost && !isMe && (
                  <div style={{ position: 'relative' }}>
                    <button
                      className="btn-ghost"
                      style={{ padding: '2px 8px', fontSize: 18, lineHeight: 1 }}
                      onClick={() => setExpanded(menuOpen ? null : p.userId)}
                      aria-label="Manage participant"
                    >
                      ⋯
                    </button>

                    {menuOpen && (
                      <div style={styles.menu}>
                        {/* Role options */}
                        {['moderator', 'participant', 'viewer'].map(role => (
                          p.role !== role && (
                            <button key={role} style={styles.menuItem}
                              onClick={() => assignRole(p.userId, role)}>
                              {ROLE_ICONS[role]} Make {role}{role === 'viewer' ? ' (watch only)' : ''}
                            </button>
                          )
                        ))}
                        {/* Transfer host */}
                        {p.role !== 'host' && (
                          <button style={{ ...styles.menuItem, color: ROLE_COLORS.host }}
                            onClick={() => assignRole(p.userId, 'host')}>
                            👑 Transfer Host
                          </button>
                        )}
                        <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                        <button style={{ ...styles.menuItem, color: 'var(--error)' }}
                          onClick={() => removeParticipant(p.userId)}>
                          ✕ Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={styles.divider} />

      {/* ── Leave button ── */}
      <div style={styles.footer}>
        <button className="btn-danger" style={{ width: '100%' }} onClick={onLeave}>
          🚪 Leave Room
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 280,
    minWidth: 260,
    background: 'var(--card)',
    borderLeft: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  section: {
    padding: '16px',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--text-sec)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  count: {
    background: 'var(--input)',
    borderRadius: 10,
    padding: '1px 7px',
    fontSize: 11,
    color: 'var(--text)',
    fontWeight: 700,
  },
  roomCode: {
    fontFamily: 'monospace',
    fontSize: 26,
    fontWeight: 800,
    letterSpacing: 5,
    color: 'var(--primary)',
    marginBottom: 12,
    textAlign: 'center',
  },
  inviteRow: {
    display: 'flex',
    gap: 8,
  },
  inviteBtn: {
    flex: 1,
    padding: '7px 0',
    fontSize: 12,
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    background: 'var(--border)',
    flexShrink: 0,
  },
  participantList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  participantItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    borderRadius: 8,
    background: 'var(--bg)',
    border: '1px solid transparent',
    transition: 'border-color 0.15s',
    position: 'relative',
  },
  avatar: (role) => ({
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: ROLE_COLORS[role] + '22',
    border: `2px solid ${ROLE_COLORS[role]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 15,
    color: ROLE_COLORS[role],
    flexShrink: 0,
  }),
  pInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
  },
  pName: {
    fontWeight: 600,
    fontSize: 14,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  youBadge: {
    background: 'var(--primary)',
    color: '#fff',
    fontSize: 10,
    padding: '1px 5px',
    borderRadius: 4,
    fontWeight: 700,
    letterSpacing: 0.3,
  },
  pRole: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  menu: {
    position: 'absolute',
    right: 0,
    top: '100%',
    background: '#222',
    border: '1px solid var(--border)',
    borderRadius: 8,
    minWidth: 170,
    zIndex: 50,
    padding: '4px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
  },
  menuItem: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    background: 'transparent',
    color: 'var(--text)',
    padding: '8px 12px',
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'background 0.1s',
  },
  footer: {
    padding: '12px 16px',
    flexShrink: 0,
  },
};
