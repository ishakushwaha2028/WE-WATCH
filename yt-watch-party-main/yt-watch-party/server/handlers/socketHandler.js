/**
 * socketHandler.js
 * Entry point for WebSocket registration using OOP:
 * RoomManager manages room state and lifecycles;
 * MessageHandler handles event routing and permissions.
 */

const RoomManager    = require('../classes/RoomManager');
const MessageHandler = require('../classes/MessageHandler');

let roomManagerInstance = null;
let messageHandlerInstance = null;

function registerSocketHandler(io) {
  roomManagerInstance    = new RoomManager(io);
  messageHandlerInstance = new MessageHandler(io, roomManagerInstance);

  io.on('connection', (socket) => {
    messageHandlerInstance.register(socket);
  });

  return { roomManager: roomManagerInstance, messageHandler: messageHandlerInstance };
}

module.exports = {
  registerSocketHandler,
  get roomManager() { return roomManagerInstance; },
  get rooms() { return roomManagerInstance ? roomManagerInstance.rooms : new Map(); },
};
