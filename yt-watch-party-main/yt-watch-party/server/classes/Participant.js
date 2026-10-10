/**
 * Participant class
 * Represents a single user connected to a room.
 * Encapsulates identity, role, and socket reference.
 */
class Participant {
  /**
   * @param {string} socketId  - Socket.IO socket id
   * @param {string} userId    - Stable user id (uuid generated on join)
   * @param {string} username  - Display name chosen by user
   * @param {string} role      - 'host' | 'moderator' | 'participant'
   */
  constructor(socketId, userId, username, role = 'participant') {
    this.socketId = socketId;
    this.userId   = userId;
    this.username = username;
    this.role     = role;
    this.joinedAt = Date.now();
  }

  /** Promote / demote role */
  setRole(role) {
    this.role = role;
  }

  /** Serialise to plain object for broadcasting */
  toJSON() {
    return {
      userId:   this.userId,
      username: this.username,
      role:     this.role,
    };
  }

  // ── Permission helpers ────────────────────────────────────────────────────

  isHost()        { return this.role === 'host'; }
  isModerator()   { return this.role === 'moderator'; }
  isParticipant() { return this.role === 'participant'; }
  isViewer()      { return this.role === 'viewer'; }

  /** Host OR Moderator can control playback directly */
  canControlPlayback() {
    return this.role === 'host' || this.role === 'moderator';
  }

  /** Participant can request controls; Viewers are pure watch-only */
  canRequestControl() {
    return this.role === 'participant';
  }

  /** Only host can manage participants / assign roles / remove */
  canManageParticipants() {
    return this.role === 'host';
  }
}

module.exports = Participant;
