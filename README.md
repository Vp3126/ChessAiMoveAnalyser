# Real-Time Chess AI Analyzer

A full-stack chess analysis system featuring a custom C++ engine and a MERN stack web interface.

## System Architecture
- **Frontend**: React (Vite) with `react-chessboard` and Socket.io client.
- **Backend**: Node.js/Express with MongoDB and Socket.io server.
- **Engine**: Custom C++ implementation with Minimax search and Alpha-Beta pruning.

## Features
- **Real-Time Analysis**: Instant evaluations after every move.
- **AI Best Move**: Suggests the optimal move based on the current position.
- **Move History**: Complete tracking of moves made during the game.
- **Evaluation Bar**: Visual representation of the advantage.
- **User Dashboard**: Save and review past games.

## Prerequisites
- Node.js (v16+)
- MongoDB (Atlas or local)
- C++ Compiler (g++ recommended)

## Setup and Installation

### 1. Compile the C++ Engine
```bash
cd engine-cpp
g++ -O3 -I./include src/*.cpp -o engine.exe
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create .env and add:
# PORT=5000
# MONGODB_URI=your_mongodb_uri
# JWT_SECRET=your_secret
# ENGINE_PATH=../engine-cpp/engine.exe
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## How it Works
1. User makes a move on the React board.
2. The move is sent to the Node.js server via Socket.io.
3. Node.js spawns the C++ engine CLI with the current FEN.
4. C++ engine performs minimax search and returns analysis JSON.
5. Node.js parses the JSON and emits it back to the client.
6. React updates the UI with the best move and evaluation.
