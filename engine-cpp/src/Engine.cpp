#include "Engine.h"
#include "MoveGenerator.h"
#include <algorithm>
#include <limits>

namespace Chess {

const double INF = std::numeric_limits<double>::infinity();

AnalysisResult Engine::analyze(const Board& board, int depth) {
    auto moves = MoveGenerator::generateLegalMoves(board);
    AnalysisResult result;
    result.depth = depth;
    result.bestMove = Move();
    result.evaluation = (board.getTurn() == WHITE) ? -INF : INF;

    if (moves.empty()) {
        if (MoveGenerator::isInCheck(board))
            result.evaluation = (board.getTurn() == WHITE) ? -INF : INF;
        else
            result.evaluation = 0;
        return result;
    }

    auto movePriority = [&board](const Move& m) {
        int p = 0;
        if (board.getPiece(m.to).type != EMPTY) p += 2;
        if (m.promotion != EMPTY) p += 1;
        return p;
    };
    std::sort(moves.begin(), moves.end(), [&board, &movePriority](const Move& a, const Move& b) {
        return movePriority(a) > movePriority(b);
    });

    std::vector<std::pair<Move, double>> scoredMoves;

    for (const auto& move : moves) {
        Board nextBoard = board;
        nextBoard.makeMove(move);
        double score = minimax(nextBoard, depth - 1, -INF, INF, board.getTurn() == BLACK);
        
        scoredMoves.push_back({move, score});

        if (board.getTurn() == WHITE) {
            if (score > result.evaluation) {
                result.evaluation = score;
                result.bestMove = move;
            }
        } else {
            if (score < result.evaluation) {
                result.evaluation = score;
                result.bestMove = move;
            }
        }
    }

    std::sort(scoredMoves.begin(), scoredMoves.end(), [board](const auto& a, const auto& b) {
        return (board.getTurn() == WHITE) ? (a.second > b.second) : (a.second < b.second);
    });

    for (size_t i = 0; i < std::min(scoredMoves.size(), (size_t)3); ++i) {
        result.topMoves.push_back(scoredMoves[i]);
    }

    return result;
}

double Engine::minimax(Board& board, int depth, double alpha, double beta, bool maximizingPlayer) {
    if (depth == 0) {
        return evaluate(board);
    }

    auto moves = MoveGenerator::generateLegalMoves(board);
    if (moves.empty()) {
        if (MoveGenerator::isInCheck(board))
            return maximizingPlayer ? -INF : INF;
        return 0;
    }

    if (maximizingPlayer) {
        double maxEval = -INF;
        for (const auto& move : moves) {
            Board next = board;
            next.makeMove(move);
            double eval = minimax(next, depth - 1, alpha, beta, false);
            maxEval = std::max(maxEval, eval);
            alpha = std::max(alpha, eval);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        double minEval = INF;
        for (const auto& move : moves) {
            Board next = board;
            next.makeMove(move);
            double eval = minimax(next, depth - 1, alpha, beta, true);
            minEval = std::min(minEval, eval);
            beta = std::min(beta, eval);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

double Engine::evaluate(const Board& board) {
    double score = 0;
    for (int i = 0; i < 64; ++i) {
        Piece p = board.getPiece((Square)i);
        double val = 0;
        switch (p.type) {
            case PAWN: val = 1.0; break;
            case KNIGHT: val = 3.0; break;
            case BISHOP: val = 3.0; break;
            case ROOK: val = 5.0; break;
            case QUEEN: val = 9.0; break;
            case KING: val = 1000.0; break;
            default: val = 0;
        }
        
        // Piece activity (very simple: central control)
        int r = i / 8, c = i % 8;
        double activity = 0;
        if (r >= 2 && r <= 5 && c >= 2 && c <= 5) activity = 0.1;
        
        if (p.color == WHITE) score += (val + activity);
        else if (p.color == BLACK) score -= (val + activity);
    }
    return score;
}

}
