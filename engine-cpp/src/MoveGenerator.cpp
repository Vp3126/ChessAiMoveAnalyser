#include "MoveGenerator.h"
#include <algorithm>

namespace Chess {

// Helper to check if a square is on board
bool onBoard(int r, int c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
}

void MoveGenerator::generatePseudoLegalMoves(const Board& board, std::vector<Move>& moves) {
    Color us = board.getTurn();
    Color them = (us == WHITE) ? BLACK : WHITE;

    for (int i = 0; i < 64; ++i) {
        Square sq = (Square)i;
        Piece p = board.getPiece(sq);
        if (p.color != us) continue;

        int r = i / 8;
        int c = i % 8;

        if (p.type == PAWN) {
            int dir = (us == WHITE) ? 1 : -1;
            // Single push
            int nr = r + dir;
            if (onBoard(nr, c) && board.getPiece((Square)(nr * 8 + c)).type == EMPTY) {
                if (nr == 0 || nr == 7) {
                    moves.push_back(Move(sq, (Square)(nr * 8 + c), QUEEN));
                    moves.push_back(Move(sq, (Square)(nr * 8 + c), ROOK));
                    moves.push_back(Move(sq, (Square)(nr * 8 + c), BISHOP));
                    moves.push_back(Move(sq, (Square)(nr * 8 + c), KNIGHT));
                } else {
                    moves.push_back(Move(sq, (Square)(nr * 8 + c)));
                    // Double push
                    if ((us == WHITE && r == 1) || (us == BLACK && r == 6)) {
                        int nnr = r + 2 * dir;
                        if (board.getPiece((Square)(nnr * 8 + c)).type == EMPTY) {
                            moves.push_back(Move(sq, (Square)(nnr * 8 + c)));
                        }
                    }
                }
            }
            // Captures
            for (int dc : {-1, 1}) {
                int nc = c + dc;
                if (onBoard(nr, nc)) {
                    Square target = (Square)(nr * 8 + nc);
                    Piece tp = board.getPiece(target);
                    if (tp.color == them) {
                        if (nr == 0 || nr == 7) {
                            moves.push_back(Move(sq, target, QUEEN));
                            moves.push_back(Move(sq, target, ROOK));
                            moves.push_back(Move(sq, target, BISHOP));
                            moves.push_back(Move(sq, target, KNIGHT));
                        } else {
                            moves.push_back(Move(sq, target));
                        }
                    } else if (target == board.enPassantSquare) {
                        moves.push_back(Move(sq, target));
                    }
                }
            }
        } else if (p.type == KNIGHT) {
            static int dr[] = {2, 2, 1, 1, -1, -1, -2, -2};
            static int dc[] = {1, -1, 2, -2, 2, -2, 1, -1};
            for (int k = 0; k < 8; ++k) {
                int nr = r + dr[k], nc = c + dc[k];
                if (onBoard(nr, nc)) {
                    Square target = (Square)(nr * 8 + nc);
                    if (board.getPiece(target).color != us) {
                        moves.push_back(Move(sq, target));
                    }
                }
            }
        } else if (p.type == KING) {
            static int dr[] = {1, 1, 1, 0, 0, -1, -1, -1};
            static int dc[] = {1, 0, -1, 1, -1, 1, 0, -1};
            for (int k = 0; k < 8; ++k) {
                int nr = r + dr[k], nc = c + dc[k];
                if (onBoard(nr, nc)) {
                    Square target = (Square)(nr * 8 + nc);
                    if (board.getPiece(target).color != us) {
                        moves.push_back(Move(sq, target));
                    }
                }
            }
            // Castling: squares empty, king not in check, and no square the king crosses or lands on is attacked
            if (us == WHITE) {
                if (board.canCastleWK && board.getPiece(F1).type == EMPTY && board.getPiece(G1).type == EMPTY
                    && !isSquareAttacked(board, E1, them) && !isSquareAttacked(board, F1, them) && !isSquareAttacked(board, G1, them)) {
                    moves.push_back(Move(E1, G1));
                }
                if (board.canCastleWQ && board.getPiece(D1).type == EMPTY && board.getPiece(C1).type == EMPTY && board.getPiece(B1).type == EMPTY
                    && !isSquareAttacked(board, E1, them) && !isSquareAttacked(board, D1, them) && !isSquareAttacked(board, C1, them)) {
                    moves.push_back(Move(E1, C1));
                }
            } else {
                if (board.canCastleBK && board.getPiece(F8).type == EMPTY && board.getPiece(G8).type == EMPTY
                    && !isSquareAttacked(board, E8, them) && !isSquareAttacked(board, F8, them) && !isSquareAttacked(board, G8, them)) {
                    moves.push_back(Move(E8, G8));
                }
                if (board.canCastleBQ && board.getPiece(D8).type == EMPTY && board.getPiece(C8).type == EMPTY && board.getPiece(B8).type == EMPTY
                    && !isSquareAttacked(board, E8, them) && !isSquareAttacked(board, D8, them) && !isSquareAttacked(board, C8, them)) {
                    moves.push_back(Move(E8, C8));
                }
            }
        } else {
            // Sliding pieces: Rook, Bishop, Queen
            static int r_dr[] = {1, -1, 0, 0};
            static int r_dc[] = {0, 0, 1, -1};
            static int b_dr[] = {1, 1, -1, -1};
            static int b_dc[] = {1, -1, 1, -1};

            int start = 0, end = 0;
            const int* dr_ptr, *dc_ptr;

            if (p.type == ROOK) { dr_ptr = r_dr; dc_ptr = r_dc; end = 4; }
            else if (p.type == BISHOP) { dr_ptr = b_dr; dc_ptr = b_dc; end = 4; }
            else if (p.type == QUEEN) { dr_ptr = r_dr; dc_ptr = r_dc; end = 8; /* using Queen trick below */ }

            if (p.type == QUEEN) {
                for (int k = 0; k < 8; ++k) {
                    int qr[] = {1, -1, 0, 0, 1, 1, -1, -1};
                    int qc[] = {0, 0, 1, -1, 1, -1, 1, -1};
                    int nr = r + qr[k], nc = c + qc[k];
                    while (onBoard(nr, nc)) {
                        Square target = (Square)(nr * 8 + nc);
                        if (board.getPiece(target).type == EMPTY) {
                            moves.push_back(Move(sq, target));
                        } else {
                            if (board.getPiece(target).color == them) moves.push_back(Move(sq, target));
                            break;
                        }
                        nr += qr[k]; nc += qc[k];
                    }
                }
            } else {
                for (int k = 0; k < end; ++k) {
                    int nr = r + dr_ptr[k], nc = c + dc_ptr[k];
                    while (onBoard(nr, nc)) {
                        Square target = (Square)(nr * 8 + nc);
                        if (board.getPiece(target).type == EMPTY) {
                            moves.push_back(Move(sq, target));
                        } else {
                            if (board.getPiece(target).color == them) moves.push_back(Move(sq, target));
                            break;
                        }
                        nr += dr_ptr[k]; nc += dc_ptr[k];
                    }
                }
            }
        }
    }
}

bool MoveGenerator::isSquareAttacked(const Board& board, Square sq, Color attackerColor) {
    int r = sq / 8, c = sq % 8;
    // Knight
    static int ndr[] = {2, 2, 1, 1, -1, -1, -2, -2};
    static int ndc[] = {1, -1, 2, -2, 2, -2, 1, -1};
    for (int k = 0; k < 8; ++k) {
        int nr = r + ndr[k], nc = c + ndc[k];
        if (onBoard(nr, nc)) {
            Piece p = board.getPiece((Square)(nr * 8 + nc));
            if (p.type == KNIGHT && p.color == attackerColor) return true;
        }
    }
    // King
    static int kdr[] = {1, 1, 1, 0, 0, -1, -1, -1};
    static int kdc[] = {1, 0, -1, 1, -1, 1, 0, -1};
    for (int k = 0; k < 8; ++k) {
        int nr = r + kdr[k], nc = c + kdc[k];
        if (onBoard(nr, nc)) {
            Piece p = board.getPiece((Square)(nr * 8 + nc));
            if (p.type == KING && p.color == attackerColor) return true;
        }
    }
    // Pawn
    int pdir = (attackerColor == WHITE) ? -1 : 1;
    for (int dc : {-1, 1}) {
        int nr = r + pdir, nc = c + dc;
        if (onBoard(nr, nc)) {
            Piece p = board.getPiece((Square)(nr * 8 + nc));
            if (p.type == PAWN && p.color == attackerColor) return true;
        }
    }
    // Sliders
    int qr[] = {1, -1, 0, 0, 1, 1, -1, -1};
    int qc[] = {0, 0, 1, -1, 1, -1, 1, -1};
    for (int k = 0; k < 8; ++k) {
        int nr = r + qr[k], nc = c + qc[k];
        while (onBoard(nr, nc)) {
            Piece p = board.getPiece((Square)(nr * 8 + nc));
            if (p.type != EMPTY) {
                if (p.color == attackerColor) {
                    if (k < 4) { // Orthogonal
                        if (p.type == ROOK || p.type == QUEEN) return true;
                    } else { // Diagonal
                        if (p.type == BISHOP || p.type == QUEEN) return true;
                    }
                }
                break;
            }
            nr += qr[k]; nc += qc[k];
        }
    }
    return false;
}

Square MoveGenerator::getKingSquare(const Board& board, Color color) {
    for (int i = 0; i < 64; ++i) {
        Piece p = board.getPiece((Square)i);
        if (p.type == KING && p.color == color) return (Square)i;
    }
    return SQ_NONE;
}

bool MoveGenerator::isInCheck(const Board& board) {
    Color us = board.getTurn();
    Color them = (us == WHITE) ? BLACK : WHITE;
    Square kingSq = getKingSquare(board, us);
    return (kingSq != SQ_NONE && isSquareAttacked(board, kingSq, them));
}

std::vector<Move> MoveGenerator::generateLegalMoves(const Board& board) {
    std::vector<Move> pseudo;
    generatePseudoLegalMoves(board, pseudo);
    std::vector<Move> legal;
    legal.reserve(pseudo.size());
    Color us = board.getTurn();
    for (const Move& move : pseudo) {
        Board copy = board;
        copy.makeMove(move);
        // After makeMove, turn switched to opponent. King we must not be in check is the one that just moved.
        Color movedSide = (copy.getTurn() == WHITE) ? BLACK : WHITE;
        Square kingSq = getKingSquare(copy, movedSide);
        if (kingSq != SQ_NONE && !isSquareAttacked(copy, kingSq, copy.getTurn()))
            legal.push_back(move);
    }
    return legal;
}

}
