const { io } = require('../client/node_modules/socket.io-client');

const SERVER_URL = 'http://localhost:3001';

async function runTest() {
  console.log('🚀 Starting Automated Watch Party End-to-End Test...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Connect Host
  const hostSocket = io(SERVER_URL);
  const participantSocket = io(SERVER_URL);

  await new Promise(r => setTimeout(r, 500));

  assert(hostSocket.connected, 'Host socket connected to server');
  assert(participantSocket.connected, 'Participant socket connected to server');

  const roomId = 'ROOM_' + Math.floor(Math.random() * 10000);

  // 2. Host Joins
  let hostJoinedPromise = new Promise(resolve => {
    hostSocket.on('sync_state', (state) => {
      resolve(state);
    });
  });

  hostSocket.emit('join_room', {
    roomId,
    username: 'Alice (Host)',
    userId: 'user-alice-1',
  });

  const hostSync = await hostJoinedPromise;
  assert(hostSync.participants.length === 1, 'Room created with 1 participant');
  assert(hostSync.participants[0].role === 'host', 'First joiner automatically assigned Host role');

  // 3. Participant Joins
  let partJoinedPromise = new Promise(resolve => {
    participantSocket.on('sync_state', (state) => {
      resolve(state);
    });
  });

  participantSocket.emit('join_room', {
    roomId,
    username: 'Bob (Joiner)',
    userId: 'user-bob-2',
  });

  const partSync = await partJoinedPromise;
  assert(partSync.participants.length === 2, 'Room now has 2 participants');
  const bob = partSync.participants.find(p => p.userId === 'user-bob-2');
  assert(bob && bob.role === 'participant', 'Second joiner automatically assigned Participant role');

  // 4. Host changes video
  let videoChangePromise = new Promise(resolve => {
    participantSocket.on('change_video', resolve);
  });
  hostSocket.emit('change_video', { videoId: 'dQw4w9WgXcQ' });
  const videoEvent = await videoChangePromise;
  assert(videoEvent.videoId === 'dQw4w9WgXcQ', 'Video change synchronized to participant');

  // 5. Host plays video
  let playPromise = new Promise(resolve => {
    participantSocket.on('play', resolve);
  });
  hostSocket.emit('play', { currentTime: 15 });
  const playEvent = await playPromise;
  assert(playEvent.currentTime === 15, 'Play state synchronized with time 15s');

  // 6. Host seeks video
  let seekPromise = new Promise(resolve => {
    participantSocket.on('seek', resolve);
  });
  hostSocket.emit('seek', { time: 55 });
  const seekEvent = await seekPromise;
  assert(seekEvent.time === 55, 'Seek position 55s synchronized to participant');

  // 7. Participant attempting unauthorized direct control should be rejected
  let rejectPromise = new Promise(resolve => {
    participantSocket.on('error', resolve);
  });
  participantSocket.emit('pause', { currentTime: 55 });
  const errEvent = await rejectPromise;
  assert(errEvent.message && errEvent.message.includes('Only Host and Moderator'), 'Unauthorized pause from participant rejected by backend');

  // 8. Participant requests control
  let reqReceivedPromise = new Promise(resolve => {
    hostSocket.on('control_request', resolve);
  });
  let reqSentPromise = new Promise(resolve => {
    participantSocket.on('control_request_sent', resolve);
  });
  participantSocket.emit('request_control', { action: 'pause' });
  const reqReceived = await reqReceivedPromise;
  const reqSent = await reqSentPromise;
  assert(reqSent.action === 'pause', 'Requester acknowledged with control_request_sent');
  assert(reqReceived.fromUsername === 'Bob (Joiner)' && reqReceived.action === 'pause', 'Host received participant control request');

  // 9. Host approves request
  let reqResolvedPromise = new Promise(resolve => {
    participantSocket.on('control_request_resolved', resolve);
  });
  let pauseBroadcastPromise = new Promise(resolve => {
    participantSocket.on('pause', resolve);
  });
  hostSocket.emit('resolve_control_request', { requestId: reqReceived.id, approved: true });
  const resolvedEvent = await reqResolvedPromise;
  await pauseBroadcastPromise;
  assert(resolvedEvent.approved === true, 'Participant notified that request was approved');

  // 10. Host assigns role (promote Participant to Moderator)
  let roleAssignPromise = new Promise(resolve => {
    participantSocket.on('role_assigned', resolve);
  });
  hostSocket.emit('assign_role', { userId: 'user-bob-2', role: 'moderator' });
  const roleEvent = await roleAssignPromise;
  assert(roleEvent.userId === 'user-bob-2' && roleEvent.role === 'moderator', 'Role promotion to Moderator broadcast to room');

  // 11. Promoted Moderator can now control playback directly
  let modPlayPromise = new Promise(resolve => {
    hostSocket.on('play', resolve);
  });
  participantSocket.emit('play', { currentTime: 60 });
  const modPlayEvent = await modPlayPromise;
  assert(modPlayEvent.currentTime === 60, 'Promoted Moderator can directly control playback');

  // 12. Host assigns Viewer role
  let viewerRolePromise = new Promise(resolve => {
    participantSocket.on('role_assigned', resolve);
  });
  hostSocket.emit('assign_role', { userId: 'user-bob-2', role: 'viewer' });
  const viewerEvent = await viewerRolePromise;
  assert(viewerEvent.role === 'viewer', 'Viewer role assignment supported');

  // 13. Viewer attempting request_control is rejected
  let viewerRejectPromise = new Promise(resolve => {
    participantSocket.on('error', resolve);
  });
  participantSocket.emit('request_control', { action: 'play' });
  const viewerErr = await viewerRejectPromise;
  assert(viewerErr.message && viewerErr.message.includes('Viewers cannot request control'), 'Viewer restricted from control requests');

  // 14. Real-time chat
  let chatPromise = new Promise(resolve => {
    participantSocket.on('chat_message', resolve);
  });
  hostSocket.emit('chat_message', { text: 'Welcome to the watch party!' });
  const chatMsg = await chatPromise;
  assert(chatMsg.text === 'Welcome to the watch party!', 'Real-time chat synchronized');

  // 15. Emoji reaction
  let reactionPromise = new Promise(resolve => {
    hostSocket.on('reaction', resolve);
  });
  participantSocket.emit('send_reaction', { emoji: '🔥' });
  const reactionMsg = await reactionPromise;
  assert(reactionMsg.emoji === '🔥' && reactionMsg.username === 'Bob (Joiner)', 'Floating reaction synchronized across room');

  // 16. Host removes participant
  let removedPromise = new Promise(resolve => {
    participantSocket.on('removed_from_room', resolve);
  });
  hostSocket.emit('remove_participant', { userId: 'user-bob-2' });
  const removedEvent = await removedPromise;
  assert(removedEvent.message && removedEvent.message.includes('removed from the room'), 'Participant kicked notification delivered');

  console.log(`\n========================================`);
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  hostSocket.disconnect();
  participantSocket.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTest().catch(err => {
  console.error('Unhandled error during test:', err);
  process.exit(1);
});
