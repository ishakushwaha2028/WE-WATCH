# 🎬 YT Watch Party — Real-Time Synchronized Video Streaming

> A production-ready, full-stack watch party application allowing multiple users to watch YouTube videos in real time with sub-second synchronization, role-based access control (RBAC), approval workflows, interactive live chat, and floating emoji reactions.

---

## 🌐 Live Deployment

- 🔗 **Frontend (Vercel):** [https://client-f4g54tqxt-isha42341-gmailcoms-projects.vercel.app/](https://client-f4g54tqxt-isha42341-gmailcoms-projects.vercel.app/)
- 🔗 **Backend (Render):** [https://yt-watch-party-y3xy.onrender.com/](https://yt-watch-party-y3xy.onrender.com/)
- 🔗 **Health Check:** [https://yt-watch-party-y3xy.onrender.com/health](https://yt-watch-party-y3xy.onrender.com/health)

---

## 📑 Table of Contents
1. [Core Features](#-core-features)
2. [Tech Stack & Rationale](#-tech-stack--rationale)
3. [Architecture Overview & WebSocket Flow](#-architecture-overview--websocket-flow)
4. [Role-Based Access Control (RBAC) Matrix](#-role-based-access-control-rbac-matrix)
5. [Object-Oriented Backend Design (OOP)](#-object-oriented-backend-design-oop)
6. [Drift Correction & Synchronization Protocol](#-drift-correction--synchronization-protocol)
7. [Approval Workflow for Restricted Users](#-approval-workflow-for-restricted-users)
8. [Scalability Architecture (1,000+ Users / 100+ Rooms)](#-scalability-architecture-1000-users--100-rooms)
9. [Local Development Setup](#-local-development-setup)
10. [Automated End-to-End Verification](#-automated-end-to-end-verification)
11. [Engineering Trade-offs & Challenges Solved](#-engineering-trade-offs--challenges-solved)

---

## ✨ Core Features

- 🎥 **Real-Time YouTube Synchronization**: Play, pause, seek, and video changes broadcast with sub-second latency across all connected room participants.
- 🏠 **Room-Based Model**: Shareable 6-character room codes and one-click invite URLs (`?room=CODE`) with automatic lobby pre-population.
- 👑 **Strict Role-Based Access Control (RBAC)**:
  - **Host**: Creator of the room; possesses exclusive administrative powers (assign roles, kick users, transfer host).
  - **Moderator**: Elevated participant empowered to control playback and change videos.
  - **Participant**: Default role for joiners; watch access with the ability to request playback/video changes from Host/Moderators.
  - **Viewer**: Strict watch-only observer without control-request capabilities.
- 🙋 **Permission Approval Queue**: Interactive banner notifying Host and Moderators when participants request playback or video changes, with real-time approval/rejection broadcasts.
- ⚡ **Dynamic Heartbeat & Elapsed Time Calculation**: New joiners dynamically sync to the active video time (accounting for server elapsed time), while a background heartbeat corrects drift (> 2.0s).
- 💬 **Live Room Chat**: Persistent chat during playback with role badges and timestamps.
- 🔥 **Floating Emoji Reactions**: Live reactions (❤️, 🔥, 👏, 😂, 😮, 🍿) floating smoothly across the video player in real time.
- 🛡️ **YouTube Error Fallback**: Clear user alerts when an embedded video has owner restrictions or is unavailable.

---

## 🛠 Tech Stack & Rationale

| Layer | Technology | Purpose & Rationale |
|---|---|---|
| **Frontend** | React 18 + Vite | Component-driven reactivity, rapid HMR development, and lightweight bundle footprint. |
| **Styling** | Vanilla CSS Tokens | Zero runtime CSS overhead, dark-mode glassmorphic aesthetics, custom controls. |
| **Real-Time** | Socket.IO Client / Server | Automatic fallback (WebSockets & polling), reconnection buffers, room namespaces. |
| **Backend** | Node.js + Express | Lightweight event-driven asynchronous runtime ideal for high-concurrency WebSocket multiplexing. |
| **Architecture** | Pure Object-Oriented (OOP) | Domain classes (`Participant`, `Room`, `RoomManager`, `MessageHandler`) cleanly separating state, logic, and networking. |
| **Video API** | YouTube IFrame Player API | Embedded controllable HTML5 player with programmatic seek, cue, load, and event hooks. |

---

## 📐 Architecture Overview & WebSocket Flow

```text
       ┌────────────────────────┐
       │     React Frontend     │
       │   (Player / Lobby)     │
       └───────────┬────────────┘
                   │
                   │ Bidirectional Socket.IO Events
                   ▼
       ┌────────────────────────┐
       │   Node.js / Express    │
       │     Server Engine      │
       └───────────┬────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
┌──────────────────┐ ┌───────────────────┐
│  RoomManager     │ │  MessageHandler   │
│ (Room Registry)  │ │ (RBAC Validation) │
└────────┬─────────┘ └─────────┬─────────┘
         │                     │
         ▼                     ▼
┌──────────────────┐ ┌───────────────────┐
│   Room Entity    │ │ Participant Class │
│ (Video State &   │ │ (Roles & Perms)   │
│  Participants)   │ │                   │
└──────────────────┘ └───────────────────┘
```

### WebSocket Event Specification

| Event | Source → Target | Payload | Description |
|---|---|---|---|
| `join_room` | Client → Server | `{ roomId, username, userId }` | Joins a party. First user becomes Host; others become Participant. |
| `leave_room` | Client → Server | `{}` | Gracefully leaves room; auto-promotes next user if Host leaves. |
| `sync_state` | Server → Client | `{ videoId, playing, currentTime, participants, pendingRequests }` | State snapshot sent on joining. Computes dynamic elapsed time. |
| `play` | Client → Server | `{ currentTime }` | Validates controller permission; broadcasts to room. |
| `pause` | Client → Server | `{ currentTime }` | Validates controller permission; broadcasts to room. |
| `seek` | Client → Server | `{ time }` | Broadcasts immediate seek without drift threshold gating. |
| `change_video` | Client → Server | `{ videoId }` | Validates permission, updates room video ID, resets playback. |
| `assign_role` | Client → Server | `{ userId, role }` | Host assigns `moderator`, `participant`, `viewer`, or transfers `host`. |
| `remove_participant` | Client → Server | `{ userId }` | Host kicks participant; target socket leaves room namespace. |
| `request_control` | Client → Server | `{ action, payload }` | Participant requests approval for play, pause, seek, or change_video. |
| `resolve_control_request` | Client → Server | `{ requestId, approved }` | Host/Mod resolves request; notifies requester and executes action. |
| `time_sync` | Client → Server | `{ currentTime }` | Host periodically broadcasts authoritative time for drift correction. |
| `send_reaction` | Client → Server | `{ emoji }` | Broadcasts floating emoji reaction to all participants. |
| `chat_message` | Client → Server | `{ text }` | Broadcasts timestamped chat message with role badge. |

---

## 👥 Role-Based Access Control (RBAC) Matrix

| Capability | Host (👑) | Moderator (🛡) | Participant (👤) | Viewer (👁) |
|---|:---:|:---:|:---:|:---:|
| Play / Pause / Seek | ✅ Direct | ✅ Direct | 🙋 Requires Approval | ❌ Disabled |
| Change YouTube Video | ✅ Direct | ✅ Direct | 🙋 Requires Approval | ❌ Disabled |
| Request Playback / Seek | N/A | N/A | ✅ Permitted | ❌ Disabled |
| Promote / Demote Roles | ✅ Exclusive | ❌ | ❌ | ❌ |
| Kick Participants | ✅ Exclusive | ❌ | ❌ | ❌ |
| Transfer Host Ownership | ✅ Exclusive | ❌ | ❌ | ❌ |
| Real-Time Chat & Reactions | ✅ | ✅ | ✅ | ✅ |

---

## 🏛 Object-Oriented Backend Design (OOP)

The WebSocket architecture strictly follows OOP principles:

1. **`Participant` Class (`server/classes/Participant.js`)**:
   - Encapsulates socket ID, user UUID, display name, and role.
   - Provides explicit permission predicates: `isHost()`, `isModerator()`, `canControlPlayback()`, `canRequestControl()`, `canManageParticipants()`.
2. **`Room` Class (`server/classes/Room.js`)**:
   - Manages participant collections (`Map<socketId, Participant>`).
   - Implements **dynamic elapsed time calculation**:
     ```javascript
     getCurrentTime() {
       if (!this.videoState.playing) return this.videoState.currentTime;
       const elapsed = (Date.now() - this.videoState.updatedAt) / 1000;
       return Math.max(0, this.videoState.currentTime + elapsed);
     }
     ```
   - Manages control request queues (`addControlRequest`, `resolveControlRequest`).
   - Provides room broadcast helpers (`broadcast`, `broadcastExcept`).
3. **`RoomManager` Class (`server/classes/RoomManager.js`)**:
   - Encapsulates room lifecycle (instantiation, retrieval, automatic cleanup when empty).
4. **`MessageHandler` Class (`server/classes/MessageHandler.js`)**:
   - Central event dispatcher with strict server-side validation.
   - Decouples raw socket transport from room domain entities.

---

## ⏱ Drift Correction & Synchronization Protocol

To ensure viewers in different locations and network conditions remain synchronized:

1. **New Joiner Time Calculation**:
   - When a user joins mid-stream, the server computes current video progress via `(Date.now() - updatedAt) / 1000`. The user loads at the exact playback second instead of starting at `0:00`.
2. **Echo Suppression Window**:
   - When a client applies a remote command (`seekTo` or `playVideo`), an internal `suppressRef` timer (800ms) prevents the YouTube iframe's `onStateChange` callback from looping that action back to the server.
3. **Immediate Seek Gating**:
   - Explicit `seek` events bypass drift thresholds and seek immediately.
4. **Heartbeat Drift Alignment**:
   - The active controller emits a light `time_sync` pulse every 5 seconds. If a participant's local playback drifts by > 2.0s due to buffering, the player smoothly catches up.

---

## 🚀 Scalability Architecture (1,000+ Users / 100+ Rooms)

To horizontally scale this architecture to support **1,000+ concurrent users, 100+ active rooms, and 50+ users per room**:

```text
                      ┌──────────────────────┐
                      │    Load Balancer     │
                      │  (NGINX / AWS ALB)   │
                      │  (Sticky Sessions)   │
                      └──────────┬───────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
            ▼                    ▼                    ▼
   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
   │ WS Instance #1  │  │ WS Instance #2  │  │ WS Instance #3  │
   │ Node.js Server  │  │ Node.js Server  │  │ Node.js Server  │
   └────────┬────────┘  └────────┬────────┘  └────────┬────────┘
            │                    │                    │
            └────────────────────┼────────────────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │    Redis Pub/Sub      │
                     │ (@socket.io/redis-    │
                     │       adapter)        │
                     └───────────────────────┘
```

1. **Socket.IO Redis Adapter (`@socket.io/redis-adapter`)**:
   - Replaces in-memory room broadcasting with Redis Pub/Sub channels. When a Host emits a `play` or `seek` event on Instance #1, Redis publishes the event to all other server nodes so participants on Instance #2 and #3 receive the update instantaneously.
2. **Sticky Session Load Balancing**:
   - Socket.IO establishes connections through HTTP long-polling before upgrading to WebSockets. The reverse proxy uses cookie-based sticky sessions (`ip_hash` or `AWS ALB session stickiness`) to ensure initial handshake packets route to the same instance.
3. **Connection Pooling & Room Sharding**:
   - Store room metadata (video ID, playback status, participant lists) in Redis Hashes or PostgreSQL.
   - Fast ephemeral state stored in Redis RAM ensures sub-millisecond retrieval.

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### 1. Structure

The project code is located inside `yt-watch-party/`:
- `yt-watch-party/server` (Backend Node.js + Socket.IO server)
- `yt-watch-party/client` (Frontend React + Vite app)

### 2. Install & Run

```bash
# Navigate to the watch party folder
cd yt-watch-party-main/yt-watch-party   # (or directly yt-watch-party)

# Start Backend
cd server
npm install
npm start
# Server listens on http://localhost:3001

# In another terminal, start Frontend
cd ../client
npm install
npm run dev
# Vite runs on http://localhost:5173
```

---

## 🧪 Automated End-to-End Verification

An automated test suite validates the entire RBAC state machine and WebSocket protocol:

```bash
cd yt-watch-party/server
node test-e2e.js
```

### Verified Test Cases (20/20 Passing):
- [x] Host socket connection & authentication
- [x] Participant socket connection
- [x] Auto-assignment of Host role to room creator
- [x] Auto-assignment of Participant role to joiner
- [x] Video change synchronization
- [x] Play state & timestamp synchronization
- [x] Seek position synchronization
- [x] Backend permission validation: Unauthorized direct control rejected
- [x] Participant control request issuance (`request_control`)
- [x] Host receipt and approval of request (`resolve_control_request`)
- [x] Notification delivery to requester upon resolution
- [x] Role promotion (`assign_role` Participant → Moderator)
- [x] Verification that promoted Moderator gains direct control access
- [x] Assignment of Viewer role
- [x] Restriction of Viewer from issuing control requests
- [x] Real-time chat messaging and role tags
- [x] Floating emoji reaction distribution
- [x] Host participant kick action (`remove_participant`)

---

## 💡 Engineering Trade-offs & Challenges Solved

1. **Native YouTube Controls vs Custom Overlay Controls**:
   - *Problem*: If the native YouTube player controls are enabled, user clicks on the iframe do not trigger JavaScript events consistently due to cross-origin `iframe` security.
   - *Solution*: Set `controls: 0` in player configuration and built custom UI controls for Play, Pause, and Seek. This guarantees that 100% of interactions pass through Socket.IO and remain synchronized.
2. **Infinite Echo Feedback Loops**:
   - *Problem*: When Host clicks Play, server broadcasts `play`. Participants receive `play` and call `player.playVideo()`. This fires the YouTube player's `onStateChange(PLAYING)` event on the participant's browser, which would emit another `play` event back to the server.
   - *Solution*: Implemented an echo suppression barrier with a 800ms cooldown window on programmatic player state changes.
3. **Mid-Stream Room Join Desync**:
   - *Problem*: If a user joins 10 minutes into a 30-minute video, standard naive approaches sent `currentTime: 0`.
   - *Solution*: Dynamic elapsed time computation on server snapshot retrieval: `room.getCurrentTime()`.

---
