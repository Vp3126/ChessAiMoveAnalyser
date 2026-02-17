#ifndef BOARD_H
#define BOARD_H

#include <vector>
#include <string>
#include "Constants.h"

namespace Chess {

struct Piece {
    PieceType type;
    Color color;

    Piece() : type(EMPTY), color(NONE) {}
    Piece(PieceType t, Color c) : type(t), color(c) {}
};

struct Move {
    Square from;
    Square to;
    PieceType promotion;

    Move() : from(SQ_NONE), to(SQ_NONE), promotion(EMPTY) {}
    Move(Square f, Square t, PieceType p = EMPTY) : from(f), to(t), promotion(p) {}

    std::string toString() const;
    bool operator==(const Move& other) const {
        return from == other.from && to == other.to && promotion == other.promotion;
    }
};

class Board {
public:
    Board();
    void parseFEN(const std::string& fen);
    std::string toFEN() const;
    void makeMove(const Move& move);

    Piece getPiece(Square sq) const { return squares[sq]; }
    Color getTurn() const { return turn; }
    
    // Game state flags
    bool canCastleWK, canCastleWQ, canCastleBK, canCastleBQ;
    Square enPassantSquare;
    int halfMoveClock;
    int fullMoveNumber;

private:
    Piece squares[64];
    Color turn;

    void clear();
};

}

#endif // BOARD_H
