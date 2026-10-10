# 🎬 Watchora — Watch Together, Anywhere

**Watchora** is a real-time YouTube Watch Party web application that lets friends watch videos together from anywhere. Users can create or join rooms, watch videos in sync, and chat with each other while enjoying their favorite content.

The goal is to make watching videos online more interactive, social, and fun.

## ✨ Features

- 🎥 **Synchronized Video Playback** — Watch YouTube videos together with synchronized playback.
- 🏠 **Create Watch Rooms** — Create rooms for private watch parties.
- 🔗 **Join with Room ID** — Invite friends to join a room using a unique room code.
- 💬 **Real-Time Chat** — Chat with other participants during the watch party.
- 👥 **Multi-User Support** — Watch videos together with multiple participants.
- ⚡ **Real-Time Communication** — Socket.IO enables instant communication between users.
- 🎨 **Cinematic User Interface** — Enjoy a movie-inspired interface designed for an engaging viewing experience.
- 📱 **Responsive Design** — Access the application across different screen sizes.

## 🛠️ Tech Stack

**Frontend**
- React.js
- Vite
- JavaScript
- HTML5
- CSS3

**Backend**
- Node.js
- Express.js
- Socket.IO

**Video Platform**
- YouTube embedded player

**Deployment**
- Vercel — Frontend
- Render — Backend

## 📂 Project Structure

```text
watchora/
├── client/                 # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Node.js backend
│   ├── package.json
│   └── server.js
│
└── README.md
```

*Note: The structure above is illustrative. Adjust it to match your actual repository.*

## 🚀 Getting Started

Follow these steps to run Watchora locally.

### Prerequisites

- Node.js and npm installed
- Git installed
- A modern web browser

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd yt-watch-party
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your repository's actual URL.

### 2. Set Up the Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory if your backend uses environment variables.

Example:

```env
PORT=5000
```

Start the backend:

```bash
npm start
```

If your `package.json` uses a different start script, use the corresponding command.

### 3. Set Up the Frontend

Open another terminal:

```bash
cd client
npm install
```

Create a `.env` file inside the `client` directory:

```env
VITE_SERVER_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

### 4. Open Watchora

Open the local URL shown in your terminal, usually:

```text
http://localhost:5173
```

Make sure the backend is running before joining a watch room.

## 🌐 Deployment

### Frontend — Vercel

1. Import your GitHub repository into Vercel.
2. Set the frontend root directory to `client`.
3. Add the environment variable:

   ```env
   VITE_SERVER_URL=https://YOUR_BACKEND_URL
   ```

4. Deploy the project.

### Backend — Render

1. Create a new Web Service on Render.
2. Connect your GitHub repository.
3. Set the root directory to `server`.
4. Configure the build command:

   ```bash
   npm install
   ```

5. Configure the start command according to your backend's `package.json`, commonly:

   ```bash
   npm start
   ```

6. Deploy the backend and use its public URL as `VITE_SERVER_URL` in Vercel.

**Important:** Configure Socket.IO and CORS to allow connections from your deployed frontend domain. Replace example URLs with your actual deployment URLs.

## 🎯 How It Works

1. Open Watchora in your browser.
2. Create a watch room or join an existing room.
3. Share the room ID with your friends.
4. Add or open a supported YouTube video.
5. Watch together with synchronized playback and real-time chat.

*The exact workflow depends on the features implemented in the current version.*

## 🔮 Future Enhancements

- 🎞️ Personalized movie and video collections
- 😀 Interactive reactions and emojis
- 📋 Watch history and favorite videos
- 🎨 More cinematic themes and animations
- 🔐 User authentication and personalized profiles

## 🎓 Project Purpose

Watchora is a web development project focused on real-time communication, synchronized media playback, and collaborative online experiences. It demonstrates the integration of a modern React frontend with a Node.js backend and WebSocket-based communication.

## 🤝 Contributing

Contributions, suggestions, and feature ideas are welcome!

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push the branch.
5. Open a pull request.


**Made with ❤️ for watching together, from anywhere.**

🎬 **Watchora — Your videos. Your people. Your watch party.**
