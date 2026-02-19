import { useState, useEffect, useRef, useCallback } from 'react';
import { Chessboard, ChessboardDnDProvider } from 'react-chessboard';
import { Chess } from 'chess.js';
import io from 'socket.io-client';
import axios from 'axios';
import { Activity, Zap, RotateCcw, Cpu } from 'lucide-react';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const PIECE_NAMES = { p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King' };

const BACKEND_URL = (import.meta?.env?.VITE_BACKEND_URL || '').trim();

function getEvalDescription(score) {
    if (Math.abs(score) < 0.2) return 'Position is equal';
    if (score >= 3) return 'White is winning';
    if (score >= 1) return 'White is better';
    if (score <= -3) return 'Black is winning';
    if (score <= -1) return 'Black is better';
    return score > 0 ? 'White slightly better' : 'Black slightly better';
}

/** Convert engine UCI to SAN and get a short explanation for the move */
function getMoveDisplay(fen, uci) {
    if (!uci || typeof uci !== 'string' || uci.length < 4) return { san: uci || '', explanation: '' };
    try {
        const game = new Chess(fen);
        const from = uci.slice(0, 2).toLowerCase();
        const to = uci.slice(2, 4).toLowerCase();
        const promotion = uci.length >= 5 ? uci[4].toLowerCase() : undefined;
        const move = game.move({ from, to, promotion });
        if (!move) return { san: uci, explanation: '' };
        const piece = PIECE_NAMES[move.piece] || move.piece;
        let explanation = move.captured
            ? `${piece} captures on ${to}`
            : `${piece} to ${to}`;
        if (move.san.endsWith('#')) explanation += ' (checkmate)';
        else if (move.san.endsWith('+')) explanation += ' (check)';
        return { san: move.san, explanation };
    } catch {
        return { san: uci, explanation: '' };
    }
}

function GameRoom() {
    const gameRef = useRef(null);
    if (!gameRef.current) {
        gameRef.current = new Chess();
    }

    const [position, setPosition] = useState(START_FEN);
    const [moveHistory, setMoveHistory] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [evalScore, setEvalScore] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [boardReady, setBoardReady] = useState(false);

    const socketRef = useRef(null);
    const gameIdRef = useRef(null);

    useEffect(() => {
        const baseUrl = BACKEND_URL || 'http://localhost:5000';
        socketRef.current = io(baseUrl, {
            transports: ['websocket', 'polling']
        });
        socketRef.current.on('connect', () => setIsConnected(true));
        socketRef.current.on('analysis', (data) => {
            if (!data.analysis) return;
            setAnalysis(prev => {
                if (data.fen && gameRef.current && gameRef.current.fen() !== data.fen) return prev;
                return data.analysis;
            });
            setEvalScore(prev => {
                if (data.fen && gameRef.current && gameRef.current.fen() !== data.fen) return prev;
                return data.analysis.evaluation ?? 0;
            });
        });
        return () => socketRef.current?.disconnect();
    }, []);

    // Delay board mount to avoid react-chessboard Strict Mode / internal timeout reset (see GH #119)
    useEffect(() => {
        const t = setTimeout(() => setBoardReady(true), 150);
        return () => clearTimeout(t);
    }, []);

    const onPieceDrop = useCallback((sourceSquare, targetSquare, piece) => {
        try {
            const result = gameRef.current.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q'
            });
            if (!result) return false;

            const newFen = gameRef.current.fen();
            setPosition(newFen);
            setMoveHistory([...gameRef.current.history()]);
            setAnalysis(null);

            if (socketRef.current?.connected) {
                (async () => {
                    let gameId = gameIdRef.current;
                    const user = JSON.parse(localStorage.getItem('user') || 'null');
                    if (user?.token) {
                        if (!gameId) {
                            try {
                                const baseURL = BACKEND_URL || undefined; // use Vite proxy in dev
                                const res = await axios.post(
                                    `${baseURL ? baseURL : ''}/api/games`,
                                    {},
                                    { headers: { Authorization: `Bearer ${user.token}` } }
                                );
                                gameId = res.data._id;
                                gameIdRef.current = gameId;
                            } catch (e) {
                                console.error('Failed to create game for history', e);
                            }
                        }
                    }
                    socketRef.current.emit('move', { gameId: gameId || undefined, fen: newFen, move: result });
                })();
            }
            return true;
        } catch {
            return false;
        }
    }, []);

    const resetGame = useCallback(() => {
        gameRef.current.reset();
        gameIdRef.current = null;
        setPosition(START_FEN);
        setMoveHistory([]);
        setAnalysis(null);
        setEvalScore(0);
    }, []);

    return (
        <div className="flex flex-col xl:flex-row gap-8 max-w-7xl mx-auto px-4 py-4 min-h-[85vh]">
            <div className="flex-1 space-y-4">
                <div className="glass p-4 sm:p-6 shadow-2xl relative border-indigo-500/10 bg-slate-900/40">
                    <div className="absolute top-6 left-6 flex items-center gap-2 z-20 bg-slate-950/90 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 animate-pulse'}`}></div>
                        <span className="text-[10px] uppercase font-black text-white/90 tracking-widest">
                            {isConnected ? '✅ STABLE v11' : 'OFFLINE'}
                        </span>
                    </div>

                    <div className="max-w-[550px] mx-auto shadow-2xl border-4 border-slate-800 rounded-lg overflow-hidden bg-[#1e293b]" style={{ touchAction: 'none', minHeight: 500 }}>
                        {boardReady ? (
                            <ChessboardDnDProvider context={typeof window !== 'undefined' ? window : undefined}>
                                <Chessboard
                                    key="chessboard"
                                    position={position || START_FEN}
                                    onPieceDrop={onPieceDrop}
                                    boardWidth={500}
                                    arePiecesDraggable={true}
                                    customBoardStyle={{ borderRadius: '0px' }}
                                    customDarkSquareStyle={{ backgroundColor: '#1e293b' }}
                                    customLightSquareStyle={{ backgroundColor: '#475569' }}
                                />
                            </ChessboardDnDProvider>
                        ) : (
                            <div className="w-full h-[500px] flex items-center justify-center text-slate-500">Loading board…</div>
                        )}
                    </div>
                </div>

                <div className="glass p-6 border-indigo-500/10 shadow-xl bg-slate-900/40">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <Activity className="text-indigo-400" size={24} />
                            <div>
                                <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest text-left">Evaluation</h3>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-2xl font-mono font-black ${evalScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {evalScore > 0 ? '+' : ''}{evalScore.toFixed(2)}
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-medium text-slate-400">
                                        {getEvalDescription(evalScore)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button onClick={resetGame} className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl transition-all">
                            <RotateCcw size={20} />
                        </button>
                    </div>
                    <div className="relative h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                        <div
                            className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-1000 ease-in-out"
                            style={{ width: `${Math.min(Math.max(50 + (evalScore * 5), 5), 95)}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="w-full xl:w-[400px] flex flex-col gap-6">
                <div className="glass p-8 relative overflow-hidden bg-slate-900/40 border-indigo-500/20 min-h-[220px] flex flex-col items-center justify-center">
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                        <Zap className="text-indigo-400" size={16} fill="currentColor" />
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Analysis</h2>
                    </div>
                    <div className="absolute top-4 right-4">
                        {(() => {
                            const turn = gameRef.current?.turn?.() || 'w';
                            const isWhite = turn === 'w';
                            return (
                                <span
                                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.18em] border ${
                                        isWhite
                                            ? 'bg-emerald-500/10 border-emerald-400/60 text-emerald-300'
                                            : 'bg-sky-500/10 border-sky-400/60 text-sky-300'
                                    }`}
                                >
                                    {isWhite ? 'AI for White move' : 'AI for Black move'}
                                </span>
                            );
                        })()}
                    </div>

                    {analysis ? (() => {
                        const moveDisplay = getMoveDisplay(position || START_FEN, analysis.bestMove);
                        const turn = gameRef.current?.turn?.() || 'w';
                        const isWhite = turn === 'w';
                        return (
                        <div className="text-center space-y-2">
                            <div className={`text-7xl font-black uppercase tracking-tighter drop-shadow-2xl ${
                                isWhite ? 'text-emerald-100' : 'text-sky-100'
                            }`}>
                                {moveDisplay.san}
                            </div>
                            {moveDisplay.explanation && (
                                <p className="text-sm text-slate-400 max-w-[260px] mx-auto">
                                    {moveDisplay.explanation}
                                </p>
                            )}
                            <p className="text-xs text-slate-500">
                                {isWhite ? 'White to move · ' : 'Black to move · '}
                                {getEvalDescription(evalScore)}
                            </p>
                            <div className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">
                                DEPTH: {analysis.depth}
                            </div>
                            <div className="pt-2 border-t border-white/10 mt-2 text-[10px] text-slate-500 text-left max-w-[260px] mx-auto">
                                <span className="font-semibold text-slate-400">Notation:</span> N=Knight, B=Bishop, R=Rook, Q=Queen, K=King · x=capture · +=check · #=checkmate
                            </div>
                        </div>
                        );
                    })() : (
                        <div className="text-center opacity-20">
                            <Cpu size={48} className="mx-auto mb-4 animate-pulse text-indigo-500" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Make a move...</p>
                        </div>
                    )}
                </div>

                <div className="glass flex-1 flex flex-col shadow-xl min-h-[350px] border-white/5 bg-slate-900/40">
                    <header className="p-4 border-b border-white/5 flex items-center justify-between">
                        <h2 className="font-black text-white uppercase text-xs tracking-widest">Move History</h2>
                        <span className="text-[10px] text-indigo-500 font-black">{moveHistory.length} MOVES</span>
                    </header>
                    <div className="p-4 overflow-y-auto max-h-[400px]">
                        {moveHistory.length === 0 ? (
                            <p className="text-center text-slate-500 text-sm">No moves yet</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {moveHistory.map((move, i) => (
                                    <div key={i} className="bg-slate-950/40 p-2.5 rounded-lg text-[11px] font-mono font-bold text-center border border-white/5 text-slate-400">
                                        {Math.floor(i / 2) + 1}. {move}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GameRoom;
