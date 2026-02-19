# Chess AI Move Analyser

Full‑stack chess analysis platform built with a **custom C++ engine** and a **MERN (MongoDB, Express, React, Node.js) stack** UI.

It shows best moves, evaluation bar, human‑readable explanations, and saves game history for later review.

---

## Tech Stack

- **Frontend**: React + Vite, `react-chessboard`, `chess.js`, `socket.io-client`, TailwindCSS.
- **Backend**: Node.js, Express, Socket.io, Mongoose/MongoDB, JWT auth.
- **Engine**: Custom C++ engine (minimax + alpha–beta pruning), called via CLI from Node.

---

## Requirements

- **Node.js**: v18+ recommended  
- **npm**: bundled with Node  
- **MongoDB**: local instance or MongoDB Atlas connection string  
- **C++ compiler**: `g++` (for building the engine binary)  
- **Git**: for cloning / deploying  

---

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ChessAiMoveAnalyser.git
cd ChessAiMoveAnalyser
```

### 2. Build the C++ engine

```bash
cd engine-cpp
g++ -O3 -I./include src/*.cpp -o engine.exe   # Windows
# or
g++ -O3 -I./include src/*.cpp -o engine       # Linux / Render
```

> Note: keep track of the final binary name and path; you will point `ENGINE_PATH` to this in your environment variables.

### 3. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```bash
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
# Windows development example:
ENGINE_PATH=../engine-cpp/engine.exe
```

Start the backend:

```bash
npm start
```

### 4. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open the app in your browser (Vite default): `http://localhost:5173`

---

## How It Works (High‑Level Flow)

1. User makes a move on the React chessboard.
2. Frontend sends the FEN and move details to the Node backend via Socket.io.
3. Backend calls the C++ engine CLI (using `ENGINE_PATH`) with the current FEN and search depth.
4. Engine runs minimax + alpha–beta pruning and prints JSON with:
   - best move (in UCI),
   - evaluation score,
   - depth,
   - top candidate moves.
5. Backend parses this JSON and emits an `analysis` event back to the client.
6. Frontend:
   - converts UCI to SAN notation,
   - shows human‑readable explanation (e.g. “Knight captures on f7 (check)”),
   - updates evaluation bar and move history,
   - enforces rules like “only king moves allowed when in check”.

---

## Render Deployment

This repo includes a `render.yaml` file so you can deploy **backend** and **frontend** to Render with one click.

### 1. Push code to GitHub

Make sure your latest code is pushed to a GitHub repo (for example `ChessAiMoveAnalyser`).

### 2. What `render.yaml` does

`render.yaml` defines two services:

- **`chess-ai-backend`**  
  - Type: `web` (Node)  
  - Root: `backend/`  
  - `buildCommand`: `npm install`  
  - `startCommand`: `npm start`  

- **`chess-ai-frontend`**  
  - Type: `web` with `env: static` (static site)  
  - Root: `frontend/`  
  - `buildCommand`: `npm install && npm run build`  
  - `staticPublishPath`: `dist`  

### 3. Create services on Render

1. Go to Render dashboard → **New +** → **Blueprint**.  
2. Select your GitHub repo that contains this project.  
3. Render will read `render.yaml` and propose:
   - one Node web service for the backend,
   - one static site for the frontend.  
4. Confirm both services.

### 4. Configure environment variables on Render

For the **backend service** (`chess-ai-backend`), in the **Environment** tab set:

- `PORT` = `5000` (already in `render.yaml`, can keep as is).  
- `MONGODB_URI` = your MongoDB Atlas URI.  
- `JWT_SECRET` = secure random string.  
- `ENGINE_PATH` = path to the engine binary inside the Render container, for example:

```bash
/opt/render/project/src/engine-cpp/engine
```

You must also make sure the engine binary exists in that path:

1. In the root of the repo, commit the C++ source (`engine-cpp/...`) – already present.  
2. During deploy, Render will run inside the repo root.  
   - Option A (simplest): change your backend build command on Render to also compile the engine:  
     `npm install && cd ../engine-cpp && g++ -O3 -I./include src/*.cpp -o engine && cd ../backend`  
   - Option B: pre‑build the Linux binary locally and commit it (not ideal, but possible).

> Important: do **not** commit `.env` files or secrets – `render.yaml` is safe, but `.env` stays local.

### 5. Frontend → Backend URL

By default the frontend talks to `http://localhost:5000` in development.  
In production on Render, you may want to point the Socket.io client to your backend Render URL, e.g.:

```js
// GameRoom.jsx
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
socketRef.current = io(BACKEND_URL);
```

and set `VITE_BACKEND_URL` as an environment variable on the **frontend** static site in Render.

---

## Scripts Summary

- **Backend**
  - `npm start` – start Express + Socket.io server.

- **Frontend**
  - `npm run dev` – Vite dev server.  
  - `npm run build` – build production static files.  
  - `npm run preview` – preview production build locally.

---

## Notes

- `.env` files and `node_modules` are ignored via `.gitignore` and should not be committed.  
- Engine compilation and `ENGINE_PATH` must be correct for the target OS:
  - `engine.exe` on Windows,
  - `engine` on Linux/Render with the matching path in env vars.  

