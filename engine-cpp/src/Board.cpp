#include "Board.h"
#include <sstream>
#include <cctype>

namespace Chess {

std::string Move::toString() const {
    if (from == SQ_NONE || to == SQ_NONE) return "none";
    auto sqToString = [](Square sq) {
        std::string s = "";
        s += (char)('a' + (sq % 8));
        s += (char)('1' + (sq / 8));
        return s;
    };
    std::string moveStr = sqToString(from) + sqToString(to);
    if (promotion != EMPTY) {
        if (promotion == QUEEN) moveStr += 'q';
        else if (promotion == ROOK) moveStr += 'r';
        else if (promotion == BISHOP) moveStr += 'b';
        else if (promotion == KNIGHT) moveStr += 'n';
    }
    return moveStr;
}

Board::Board() {
    clear();
}

void Board::clear() {
    for (int i = 0; i < 64; ++i) squares[i] = Piece();
    turn = WHITE;
    canCastleWK = canCastleWQ = canCastleBK = canCastleBQ = false;
    enPassantSquare = SQ_NONE;
    halfMoveClock = 0;
    fullMoveNumber = 1;
}

void Board::parseFEN(const std::string& fen) {
    clear();
    std::stringstream ss(fen);
    std::string boardPart, turnPart, castlePart, epPart, halfPart, fullPart;
    ss >> boardPart >> turnPart >> castlePart >> epPart >> halfPart >> fullPart;

    int r = 7, c = 0;
    for (char ch : boardPart) {
        if (ch == '/') {
            r--;
            c = 0;
        } else if (isdigit(ch)) {
            c += (ch - '0');
        } else {
            if (c < 8 && r >= 0) {
                Square sq = (Square)(r * 8 + c);
                Color color = isupper(ch) ? WHITE : BLACK;
                char lower = tolower(ch);
                PieceType type = EMPTY;
                if (lower == 'p') type = PAWN;
                else if (lower == 'n') type = KNIGHT;
                else if (lower == 'b') type = BISHOP;
                else if (lower == 'r') type = ROOK;
                else if (lower == 'q') type = QUEEN;
                else if (lower == 'k') type = KING;
                squares[sq] = Piece(type, color);
            }
            c++;
        }
    }

    turn = (turnPart == "w") ? WHITE : BLACK;

    for (char ch : castlePart) {
        if (ch == 'K') canCastleWK = true;
        else if (ch == 'Q') canCastleWQ = true;
        else if (ch == 'k') canCastleBK = true;
        else if (ch == 'q') canCastleBQ = true;
    }

    if (epPart != "-") {
        int ec = epPart[0] - 'a';
        int er = epPart[1] - '1';
        enPassantSquare = (Square)(er * 8 + ec);
    }

    if (!halfPart.empty()) halfMoveClock = std::stoi(halfPart);
    if (!fullPart.empty()) fullMoveNumber = std::stoi(fullPart);
}

std::string Board::toFEN() const {
    std::stringstream fen;
    for (int r = 7; r >= 0; --r) {
        int emptyCount = 0;
        for (int c = 0; c < 8; ++c) {
            Piece p = squares[r * 8 + c];
            if (p.type == EMPTY) {
                emptyCount++;
            } else {
                if (emptyCount > 0) {
                    fen << emptyCount;
                    emptyCount = 0;
                }
                char ch;
                if (p.type == PAWN) ch = 'p';
                else if (p.type == KNIGHT) ch = 'n';
                else if (p.type == BISHOP) ch = 'b';
                else if (p.type == ROOK) ch = 'r';
                else if (p.type == QUEEN) ch = 'q';
                else if (p.type == KING) ch = 'k';
                if (p.color == WHITE) ch = toupper(ch);
                fen << ch;
            }
        }
        if (emptyCount > 0) fen << emptyCount;
        if (r > 0) fen << '/';
    }

    fen << " " << (turn == WHITE ? "w" : "b") << " ";
    
    std::string castle = "";
    if (canCastleWK) castle += 'K';
    if (canCastleWQ) castle += 'Q';
    if (canCastleBK) castle += 'k';
    if (canCastleBQ) castle += 'q';
    fen << (castle.empty() ? "-" : castle) << " ";

    if (enPassantSquare == SQ_NONE) {
        fen << "-";
    } else {
        fen << (char)('a' + (enPassantSquare % 8));
        fen << (char)('1' + (enPassantSquare / 8));
    }

    fen << " " << halfMoveClock << " " << fullMoveNumber;
    return fen.str();
}

void Board::makeMove(const Move& move) {
    Piece p = squares[move.from];
    Piece captured(EMPTY, NONE);

    // Capture: record before overwriting (for castling rights and half-move clock)
    if (p.type == PAWN && move.to == enPassantSquare) {
        int capSq = (turn == WHITE) ? (move.to - 8) : (move.to + 8);
        captured = squares[capSq];
        squares[capSq] = Piece(EMPTY, NONE);
    } else {
        captured = squares[move.to];
    }

    // Revoke castling when a rook is captured on its starting square
    if (captured.type == ROOK) {
        if (captured.color == WHITE) {
            if (move.to == A1) canCastleWQ = false;
            if (move.to == H1) canCastleWK = false;
        } else {
            if (move.to == A8) canCastleBQ = false;
            if (move.to == H8) canCastleBK = false;
        }
    }

    // Handle Castling
    if (p.type == KING) {
        if (move.from == E1) {
            if (move.to == G1) { // White King Side
                squares[F1] = squares[H1];
                squares[H1] = Piece(EMPTY, NONE);
            } else if (move.to == C1) { // White Queen Side
                squares[D1] = squares[A1];
                squares[A1] = Piece(EMPTY, NONE);
            }
            canCastleWK = canCastleWQ = false;
        } else if (move.from == E8) {
            if (move.to == G8) { // Black King Side
                squares[F8] = squares[H8];
                squares[H8] = Piece(EMPTY, NONE);
            } else if (move.to == C8) { // Black Queen Side
                squares[D8] = squares[A8];
                squares[A8] = Piece(EMPTY, NONE);
            }
            canCastleBK = canCastleBQ = false;
        }
    }

    // Update Castling Rights for Rook moves (moving from corner)
    if (move.from == A1) canCastleWQ = false;
    if (move.from == H1) canCastleWK = false;
    if (move.from == A8) canCastleBQ = false;
    if (move.from == H8) canCastleBK = false;

    // Move piece
    squares[move.to] = p;
    squares[move.from] = Piece(EMPTY, NONE);

    // Promotion
    if (move.promotion != EMPTY) {
        squares[move.to].type = move.promotion;
    }

    // Update En Passant Square
    enPassantSquare = SQ_NONE;
    if (p.type == PAWN && std::abs((int)move.to - (int)move.from) == 16) {
        enPassantSquare = (Square)((move.from + move.to) / 2);
    }

    // Half-move clock: reset on pawn move or capture, else increment (50-move rule)
    if (p.type == PAWN || captured.type != EMPTY)
        halfMoveClock = 0;
    else
        halfMoveClock++;

    if (turn == BLACK) fullMoveNumber++;
    turn = (turn == WHITE) ? BLACK : WHITE;
}

}
