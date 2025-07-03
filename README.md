# Chess Online (Next.js + Socket.IO)

A modern, full-stack chess game supporting both local and online multiplayer, built with Next.js (React), TypeScript, and Socket.IO. Play with a friend on the same device or remotely in real time!

---

## Features
- ♟️ **Two-player chess**: Play locally or online with room codes
- 🎨 **Modern, responsive UI**: Works on desktop and mobile
- 🏁 **Game over detection**: Checkmate, draw, and winner announcement
- 🔊 **Sound effects**: Move, capture, and checkmate sounds
- 🖼️ **Emoji chess pieces**: Fun and clear visuals
- 🌈 **Dynamic backgrounds**: Animated and color-by-turn
- ♻️ **Restart & flip board**: Easy controls for both players
- ⚡ **Real-time online play**: Powered by Socket.IO backend

---

## Tech Stack
- **Frontend**: Next.js (React), TypeScript, CSS-in-JS
- **Backend**: Node.js, Socket.IO
- **Chess logic**: [chess.js](https://github.com/jhlywa/chess.js)

---

## Directory Structure
```
project/
  apps/
    web/      # Next.js frontend
      app/
      components/
      public/
      sounds/
      ...
    server/   # Socket.IO backend
      server.js
      ...
  README.md
```

---

## Getting Started (Development)

### 1. **Clone the repository**
```bash
git clone <your-repo-url>
cd project
```

### 2. **Install dependencies**
```bash
npm install --prefix apps/web
npm install --prefix apps/server
```

### 3. **Set up environment variables**

#### Frontend (`apps/web/.env`):
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

#### Backend (`apps/server/.env`):
```
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

### 4. **Run the backend server**
```bash
cd apps/server
node server.js
```

### 5. **Run the frontend (Next.js) app**
```bash
cd ../../apps/web
npm run dev
```

### 6. **Open your browser**
Go to [http://localhost:3000](http://localhost:3000)

---

## Online Play
- Select **Online Play** and enter a room code to play with a friend in real time.
- Share the room code with your friend so they can join the same game.

---

## Production/Deployment
- Set up `.env.production` files in both `apps/web` and `apps/server` with your production URLs.
- Deploy the frontend (Next.js) to [Vercel](https://vercel.com/), [Netlify](https://netlify.com/), etc.
- Deploy the backend (Socket.IO) to [Render](https://render.com/), [Railway](https://railway.app/), [Heroku](https://heroku.com/), etc.
- Make sure CORS and URLs are set correctly in your environment variables.

---

## Customization
- **Chessboard UI**: Edit `apps/web/components/Chessboard.tsx`
- **Sounds**: Place new sound files in `apps/web/public/sounds/`
- **Backend logic**: Edit `apps/server/server.js`

---

## Credits
- Chess logic: [chess.js](https://github.com/jhlywa/chess.js)
- Socket.IO: [socket.io](https://socket.io/)
- UI/UX: Custom, inspired by modern chess apps

---

## License
MIT (or specify your license) 
