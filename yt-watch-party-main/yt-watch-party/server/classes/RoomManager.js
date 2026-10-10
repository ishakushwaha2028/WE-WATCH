/**
 * RoomManager class
 * Manages the collection of active watch party rooms.
 * Encapsulates room creation, retrieval, and cleanup logic.
 */
const Room = require('./Room');

class RoomManager {
  constructor(io) {
    this.io = io;
    /** @type {Map<string, Room>} roomId → Room */
    this.rooms = new Map();
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  hasRoom(roomId) {
    return this.rooms.has(roomId);
  }

  getOrCreateRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Room(roomId, this.io));
    }
    return this.rooms.get(roomId);
  }

  deleteRoom(roomId) {
    return this.rooms.delete(roomId);
  }

  cleanupEmptyRooms() {
    for (const [id, room] of this.rooms.entries()) {
      if (room.isEmpty()) {
        this.rooms.delete(id);
      }
    }
  }

  get roomCount() {
    return this.rooms.size;
  }

  getAllRooms() {
    return [...this.rooms.values()];
  }
}

module.exports = RoomManager;
