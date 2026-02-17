#ifndef ENGINE_H
#define ENGINE_H

#include "Board.h"
#include <vector>

namespace Chess {

struct AnalysisResult {
    Move bestMove;
    double evaluation;
    int depth;
    std::vector<std::pair<Move, double>> topMoves;
};

class Engine {
public:
    static AnalysisResult analyze(const Board& board, int depth);

private:
    static double minimax(Board& board, int depth, double alpha, double beta, bool maximizingPlayer);
    static double evaluate(const Board& board);
};

}

#endif // ENGINE_H
