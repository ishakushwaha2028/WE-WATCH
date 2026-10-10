/**
 * MessageHandler class
 * Encapsulates all WebSocket event routing, payload validation,
 * role-based permission checks, and room coordination.
 */
const { v4: uuidv4 } = require('uuid');
const Participant = require('./Participant');

const VALID_ROLES = ['host', 'moderator', 'participant', 'viewer'];

class MessageHandler {
  /**
   * @param {import('socket.io').Server} io
   * @param {import('./RoomManager')} roomManager
   */
  constructor(io, roomManager) {
    this.io = io;
    this.roomManager = roomManager;
  }

  /**
   * Attaches all event listeners for a newly connected socket
   * @param {import('socket.io').Socket} socket
   */
  register(socket) {
    console.log(`[socket] connected: ${socket.id}`);

    socket.on('join_room', (data) => this.handleJoin(socket, data));
    socket.on('leave_room', () => this.handleLeave(socket));
    socket.on('play', (data) => this.handlePlay(socket, data));
    socket.on('pause', (data) => this.handlePause(socket, data));
    socket.on('seek', (data) => this.handleSeek(socket, data));
    socket.on('change_video', (data) => this.handleChangeVideo(socket, data));
    socket.on('assign_role', (data) => this.handleAssignRole(socket, data));
    socket.on('remove_participant', (data) => this.handleRemoveParticipant(socket, data));
    socket.on('request_control', (data) => this.handleRequestControl(socket, data));
    socket.on('resolve_control_request', (data) => this.handleResolveControlRequest(socket, data));
    socket.on('time_sync', (data) => this.handleTimeSync(socket, data));
    socket.on('send_reaction', (data) => this.handleReaction(socket, data));
    socket.on('chat_message', (data) => this.handleChatMessage(socket, data));
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  // ── Context extraction ──────────────────────────────────────────────────────

  getContext(socket, explicitRoomId) {
    let roomId = explicitRoomId || socket.data?.roomId;
    if (!roomId) {
      for (const r of this.roomManager.getAllRooms()) {
        if (r.participants.has(socket.id)) {
          roomId = r.roomId;
          socket.data.roomId = roomId;
          break;
        }
      }
    }
    if (!roomId) return {};
    const room = this.roomManager.getRoom(roomId);
    if (!room) return {};
    const participant = room.getParticipantBySocket(socket.id);
    return { room, participant };
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  handleJoin(socket, { roomId, username, userId: clientUserId } = {}) {
    if (!roomId || !username || !username.trim()) {
      return socket.emit('error', { message: 'Room ID and username are required.' });
    }

    const cleanRoomId = roomId.trim().toUpperCase();
    const cleanUsername = username.trim().slice(0, 30);
    const room = this.roomManager.getOrCreateRoom(cleanRoomId);

    // First joiner in room becomes host, otherwise participant
    const isHost = room.isEmpty();
    const role = isHost ? 'host' : 'participant';
    const userId = clientUserId || uuidv4();

    const participant = new Participant(socket.id, userId, cleanUsername, role);
    room.addParticipant(participant);
    socket.join(cleanRoomId);
    socket.data.roomId = cleanRoomId;

    console.log(`[room:${cleanRoomId}] ${cleanUsername} joined as ${role}`);

    // Send complete current room state to the newly joined client
    socket.emit('sync_state', {
      ...room.getVideoState(),
      participants: room.getParticipantList(),
      pendingRequests: participant.canControlPlayback() ? room.getActiveControlRequests() : [],
      messages: room.messages || [],
    });

    // Notify room of new participant
    room.broadcast('user_joined', {
      userId,
      username: participant.username,
      role,
      participants: room.getParticipantList(),
    });
  }

  handleLeave(socket) {
    const { room, participant } = this.getContext(socket);
    if (!room || !participant) return;

    room.removeParticipantBySocket(socket.id);
    socket.leave(room.roomId);
    socket.data.roomId = null;

    // If host left and participants remain, promote next participant to host
    if (participant.isHost() && !room.isEmpty()) {
      const nextHost = [...room.participants.values()][0];
      nextHost.setRole('host');
      this.io.to(nextHost.socketId).emit('promoted_to_host', {
        message: 'The host has left. You are now the host!',
      });
      room.broadcast('role_assigned', {
        userId: nextHost.userId,
        username: nextHost.username,
        role: 'host',
        participants: room.getParticipantList(),
      });
    }

    room.broadcast('user_left', {
      userId: participant.userId,
      username: participant.username,
      participants: room.getParticipantList(),
    });

    this.roomManager.cleanupEmptyRooms();
    console.log(`[room:${room.roomId}] ${participant.username} left`);
  }

  handlePlay(socket, { currentTime } = {}) {
    const { room, participant } = this.getContext(socket);
    if (!room || !participant) return;

    if (!participant.canControlPlayback()) {
      return socket.emit('error', { message: 'Only Host and Moderator can control playback.' });
    }

    const time = typeof currentTime === 'number' ? currentTime : room.getCurrentTime();
    room.updateVideoState({ playing: true, currentTime: time });
    room.broadcast('play', { currentTime: time });
  }

  handlePause(socket, { currentTime } = {}) {
    const { room, participant } = this.getContext(socket);
    if (!room || !participant) return;

    if (!participant.canControlPlayback()) {
      return socket.emit('error', { message: 'Only Host and Moderator can control playback.' });
    }

    const time = typeof currentTime === 'number' ? currentTime : room.getCurrentTime();
    room.updateVideoState({ playing: false, currentTime: time });
    room.broadcast('pause', { currentTime: time });
  }

  handleSeek(socket, { time } = {}) {
    const { room, participant } = this.getContext(socket);
    if (!room || !participant) return;

    if (!participant.canControlPlayback()) {
      return socket.emit('error', { message: 'Only Host and Moderator can seek.' });
    }

    if (typeof time !== 'number' || isNaN(time)) return;

    room.updateVideoState({ currentTime: time });
    room.broadcast('seek', { time });
  }

  handleChangeVideo(socket, { videoId } = {}) {
    const { room, participant } = this.getContext(socket);
    if (!room || !participant) return;

    if (!participant.canControlPlayback()) {
      return socket.emit('error', { message: 'Only Host and Moderator can change the video.' });
    }

    if (!videoId || typeof videoId !== 'string') {
      return socket.emit('error', { message: 'Invalid video ID.' });
    }

    room.updateVideoState({ videoId: videoId.trim(), playing: false, currentTime: 0 });
    room.broadcast('change_video', { videoId: videoId.trim() });
  }

  handleAssignRole(socket, { userId, role } = {}) {
    const { room, participant } = this.getContext(socket);
    if (!room || !participant) return;

    if (!participant.canManageParticipants()) {
      return socket.emit('error', { message: 'Only Host can assign roles.' });
    }

    if (!VALID_ROLES.includes(role)) {
      return socket.emit('error', { message: `Invalid role. Allowed: ${VALID_ROLES.join(', ')}` });
    }

    const target = room.getParticipantByUserId(userId);
    if (!target) return socket.emit('error', { message: 'User not found.' });

    if (target.userId === participant.userId && role !== 'host') {
      return socket.emit('error', { message: 'Host cannot demote themselves directly; transfer host instead.' });
    }

    if (role === 'host') {
      // Transfer host: current host becomes moderator, target becomes host
      participant.setRole('moderator');
      target.setRole('host');

      this.io.to(participant.socketId).emit('role_assigned', {
        userId: participant.userId,
        username: participant.username,
        role: 'moderator',
        participants: room.getParticipantList(),
      });
      this.io.to(participant.socketId).emit('host_transferred', {
        message: `You transferred host to ${target.username}. You are now Moderator.`,
      });
    } else {
      target.setRole(role);
    }

    room.broadcast('role_assigned', {
      userId: target.userId,
      username: target.username,
      role: target.role,
      participants: room.getParticipantList(),
    });

    console.log(`[room:${room.roomId}] ${target.username} role changed to ${target.role}`);
  }

  handleRemoveParticipant(socket, { userId } = {}) {
    const { room, participant } = this.getContext(socket);
    if (!room || !participant) return;

    if (!participant.canManageParticipants()) {
      return socket.emit('error', { message: 'Only Host can remove participants.' });
    }

    const target = room.getParticipantByUserId(userId);
    if (!target) return socket.emit('error', { message: 'User not found.' });

    if (target.socketId === socket.id) {
      return socket.emit('error', { message: 'Cannot remove yourself. Use leave instead.' });
    }

    room.removeParticipantBySocket(target.socketId);

    // Notify the removed participant
    this.io.to(target.socketId).emit('removed_from_room', {
      message: 'You have been removed from the room by the host.',
    });

    const targetSocket = this.io.sockets.sockets.get(target.socketId);
    if (targetSocket) {
      targetSocket.leave(room.roomId);
      targetSocket.data.roomId = null;
    }

    room.broadcast('participant_removed', {
      userId: target.userId,
      participants: room.getParticipantList(),
    });

    console.log(`[room:${room.roomId}] ${target.username} removed by host`);
  }

  handleRequestControl(socket, { action, payload } = {}) {
    const { room, participant } = this.getContext(socket);
    if (!room || !participant) return;

    // Viewers cannot request control
    if (!participant.canRequestControl()) {
      if (participant.canControlPlayback()) {
        return socket.emit('error', { message: 'You already have playback controls.' });
      }
      return socket.emit('error', { message: 'Viewers cannot request control. Ask host for participant role.' });
    }

    const reqId = uuidv4();
    const req = {
      id: reqId,
      fromUserId: participant.userId,
      fromUsername: participant.username,
      action,
      payload: payload || {},
      createdAt: Date.now(),
    };

    room.addControlRequest(req);

    // Confirm request sent back to participant
    socket.emit('control_request_sent', {
      requestId: reqId,
      action,
      message: `Request to ${action} sent to Host and Moderators.`,
    });

    // Notify all hosts and moderators
    for (const p of room.participants.values()) {
      if (p.canControlPlayback()) {
        this.io.to(p.socketId).emit('control_request', req);
      }
    }
  }

  handleResolveControlRequest(socket, { requestId, approved } = {}) {
    const { room, participant } = this.getContext(socket);
    if (!room || !participant) return;

    if (!participant.canControlPlayback()) {
      return socket.emit('error', { message: 'Only Host/Moderator can approve or deny requests.' });
    }

    const req = room.resolveControlRequest(requestId);
    if (!req) return;

    const requester = room.getParticipantByUserId(req.fromUserId);

    if (approved) {
      // Execute the requested action
      if (req.action === 'play') {
        const time = req.payload?.currentTime ?? room.getCurrentTime();
        room.updateVideoState({ playing: true, currentTime: time });
        room.broadcast('play', { currentTime: time });
      } else if (req.action === 'pause') {
        const time = req.payload?.currentTime ?? room.getCurrentTime();
        room.updateVideoState({ playing: false, currentTime: time });
        room.broadcast('pause', { currentTime: time });
      } else if (req.action === 'seek') {
        if (typeof req.payload?.time === 'number') {
          room.updateVideoState({ currentTime: req.payload.time });
          room.broadcast('seek', { time: req.payload.time });
        }
      } else if (req.action === 'change_video') {
        if (req.payload?.videoId) {
          room.updateVideoState({ videoId: req.payload.videoId, playing: false, currentTime: 0 });
          room.broadcast('change_video', { videoId: req.payload.videoId });
        }
      }

      if (requester) {
        this.io.to(requester.socketId).emit('control_request_resolved', {
          requestId,
          approved: true,
          action: req.action,
          message: `Your request to ${req.action} was approved by ${participant.username}!`,
        });
      }
    } else {
      if (requester) {
        this.io.to(requester.socketId).emit('control_request_resolved', {
          requestId,
          approved: false,
          action: req.action,
          message: `Your request to ${req.action} was denied.`,
        });
      }
    }

    // Dismiss the request banner on all controllers' screens
    for (const p of room.participants.values()) {
      if (p.canControlPlayback()) {
        this.io.to(p.socketId).emit('dismiss_control_request', { requestId });
      }
    }
  }

  handleTimeSync(socket, { currentTime } = {}) {
    const { room, participant } = this.getContext(socket);
    if (!room || !participant) return;

    // Only host or moderator provides authoritative time sync
    if (!participant.canControlPlayback()) return;
    if (typeof currentTime !== 'number' || isNaN(currentTime)) return;

    room.updateVideoState({ currentTime });
    // Broadcast gentle time correction to other participants
    room.broadcastExcept(socket.id, 'time_sync', { currentTime });
  }

  handleReaction(socket, { emoji, roomId } = {}) {
    const { room, participant } = this.getContext(socket, roomId);
    if (!room || !participant) {
      console.warn(`[reaction] ignored: socket ${socket.id} not in room`);
      return;
    }
    if (!emoji || typeof emoji !== 'string') return;

    const reaction = {
      id: uuidv4(),
      emoji: emoji.slice(0, 8),
      username: participant.username,
      userId: participant.userId,
      timestamp: Date.now(),
    };

    room.broadcast('reaction', reaction);
  }

  handleChatMessage(socket, { text, roomId } = {}) {
    const { room, participant } = this.getContext(socket, roomId);
    if (!room || !participant) {
      console.warn(`[chat] rejected: socket ${socket.id} not in room`);
      return socket.emit('error', { message: 'Message sending failed: not connected to room. Please rejoin.' });
    }
    if (!text || !text.trim()) return;

    const msg = {
      id: uuidv4(),
      userId: participant.userId,
      username: participant.username,
      role: participant.role,
      text: text.trim().slice(0, 500),
      timestamp: Date.now(),
    };
    room.addMessage(msg);
    room.broadcast('chat_message', msg);
  }

  handleDisconnect(socket) {
    console.log(`[socket] disconnected: ${socket.id}`);
    this.handleLeave(socket);
  }
}

module.exports = MessageHandler;
