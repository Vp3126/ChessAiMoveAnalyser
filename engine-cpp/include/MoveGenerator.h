#ifndef MOVEGENERATOR_H
#define MOVEGENERATOR_H

#include "Board.h"
#include <vector>

namespace Chess {

class MoveGenerator {
public:
    static std::vector<Move> generateLegalMoves(const Board& board);
    static bool isSquareAttacked(const Board& board, Square sq, Color attackerColor);
private:
    static void generatePseudoLegalMoves(const Board& board, std::vector<Move>& moves);
};

}

#endif // MOVEGENERATOR_H
