#ifndef MOVEGENERATOR_H
#define MOVEGENERATOR_H

#include "Board.h"
#include <vector>

namespace Chess {

class MoveGenerator {
public:
    static std::vector<Move> generateLegalMoves(const Board& board);
    static bool isSquareAttacked(const Board& board, Square sq, Color attackerColor);
    /** True if the side to move has their king attacked (used for checkmate/stalemate). */
    static bool isInCheck(const Board& board);
private:
    static void generatePseudoLegalMoves(const Board& board, std::vector<Move>& moves);
    /** Returns the square of the king of the given color, or SQ_NONE if not found. */
    static Square getKingSquare(const Board& board, Color color);
};

}

#endif // MOVEGENERATOR_H
