const EngineService = require('../services/EngineService');
const Game = require('../models/Game');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('✅ Client connected:', socket.id);

        socket.on('move', async (data) => {
            console.log('📥 Move received:', data.move?.san || 'unknown');
            const { gameId, fen, move } = data;

            try {
                const depth = 3;
                const result = await EngineService.analyze(fen, depth);
                const analysis = {
                    bestMove: result.bestMove || '',
                    evaluation: result.evaluation ?? 0,
                    depth: result.depth ?? depth,
                    pv: (result.topMoves || []).map(m => m.move)
                };

                console.log('✅ Engine analysis:', analysis.bestMove, 'eval:', analysis.evaluation);

                socket.emit('analysis', {
                    fen,
                    analysis,
                    move
                });

                if (gameId) {
                    await Game.findByIdAndUpdate(gameId, {
                        $push: {
                            moves: {
                                from: move.from,
                                to: move.to,
                                fen: fen,
                                evaluation: analysis.evaluation
                            }
                        }
                    });
                }
            } catch (err) {
                console.error('❌ Analysis error:', err);
                socket.emit('error', { message: err.message || 'Analysis error' });
            }
        });

        socket.on('disconnect', () => {
            console.log('❌ Client disconnected:', socket.id);
        });
    });
};
