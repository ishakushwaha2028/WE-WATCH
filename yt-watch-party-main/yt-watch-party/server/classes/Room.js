/**
 * Room class
 * Manages all participants, video state, and chat messages for a single room.
 * Exposes broadcast helpers so the socket handler stays thin.
 */
class Room {
  /**
   * @param {string} roomId    - Unique room code
   * @param {object} io        - Socket.IO server instance (for broadcasting)
   */
  constructor(roomId, io) {
    this.roomId  = roomId;
    this.io      = io;

    /** @type {Map<string, import('./Participant')>} socketId → Participant */
    this.participants = new Map();

    /** Current video state */
    this.videoState = {
      videoId:     '',        // YouTube video ID
      playing:     false,
      currentTime: 0,
      updatedAt:   Date.now(),
    };

    /** Pending control requests: requestId → request */
    this.controlRequests = new Map();

    /** Chat messages (optional bonus) */
    this.messages = [];

    this.createdAt = Date.now();
  }

  // ── Participant management ─────────────────────────────────────────────────

  addParticipant(participant) {
    this.participants.set(participant.socketId, participant);
  }

  removeParticipantBySocket(socketId) {
    const p = this.participants.get(socketId);
    this.participants.delete(socketId);
    return p;           // returns removed Participant or undefined
  }

  getParticipantBySocket(socketId) {
    return this.participants.get(socketId);
  }

  getParticipantByUserId(userId) {
    for (const p of this.participants.values()) {
      if (p.userId === userId) return p;
    }
    return null;
  }

  getHost() {
    for (const p of this.participants.values()) {
      if (p.isHost()) return p;
    }
    return null;
  }

  get participantCount() {
    return this.participants.size;
  }

  isEmpty() {
    return this.participants.size === 0;
  }

  /** Returns a plain-object list of all participants (for broadcasting) */
  getParticipantList() {
    return [...this.participants.values()].map(p => p.toJSON());
  }

  // ── Video state ────────────────────────────────────────────────────────────

  /**
   * Calculates the current playback timestamp based on elapsed time if playing.
   * Prevents new joiners from getting stale timestamps.
   */
  getCurrentTime() {
    if (!this.videoState.playing) {
      return this.videoState.currentTime;
    }
    const elapsedSeconds = (Date.now() - this.videoState.updatedAt) / 1000;
    return Math.max(0, this.videoState.currentTime + elapsedSeconds);
  }

  /**
   * Returns current video state with playState and calculated current time
   */
  getVideoState() {
    return {
      videoId:     this.videoState.videoId,
      playing:     this.videoState.playing,
      playState:   this.videoState.playing ? 'playing' : 'paused',
      currentTime: this.getCurrentTime(),
      updatedAt:   this.videoState.updatedAt,
    };
  }

  updateVideoState(patch) {
    Object.assign(this.videoState, patch, { updatedAt: Date.now() });
  }

  // ── Control requests management ───────────────────────────────────────────

  addControlRequest(req) {
    this.controlRequests.set(req.id, req);
    return req;
  }

  getControlRequest(reqId) {
    return this.controlRequests.get(reqId);
  }

  resolveControlRequest(reqId) {
    const req = this.controlRequests.get(reqId);
    this.controlRequests.delete(reqId);
    return req;
  }

  getActiveControlRequests() {
    return [...this.controlRequests.values()];
  }

  // ── Broadcast helpers ──────────────────────────────────────────────────────

  /** Emit to every socket in the room */
  broadcast(event, payload) {
    this.io.to(this.roomId).emit(event, payload);
  }

  /** Emit to every socket except the sender */
  broadcastExcept(senderSocketId, event, payload) {
    this.io.to(this.roomId).except(senderSocketId).emit(event, payload);
  }

  // ── Chat ──────────────────────────────────────────────────────────────────

  addMessage(msg) {
    this.messages.push(msg);
    // Keep last 200 messages in memory
    if (this.messages.length > 200) this.messages.shift();
  }
}

module.exports = Room;
