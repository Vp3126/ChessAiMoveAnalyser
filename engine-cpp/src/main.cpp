#include <iostream>
#include <string>
#include <vector>
#include "Board.h"
#include "Engine.h"

using namespace Chess;

int main(int argc, char* argv[]) {
    std::string fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    int depth = 4;

    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--fen" && i + 1 < argc) {
            fen = argv[++i];
        } else if (arg == "--depth" && i + 1 < argc) {
            depth = std::stoi(argv[++i]);
        }
    }

    Board board;
    board.parseFEN(fen);

    AnalysisResult result = Engine::analyze(board, depth);

    // Manual JSON Output
    std::cout << "{" << std::endl;
    std::cout << "  \"bestMove\": \"" << result.bestMove.toString() << "\"," << std::endl;
    std::cout << "  \"evaluation\": " << result.evaluation << "," << std::endl;
    std::cout << "  \"depth\": " << result.depth << "," << std::endl;
    std::cout << "  \"topMoves\": [" << std::endl;
    for (size_t i = 0; i < result.topMoves.size(); ++i) {
        std::cout << "    {\"move\": \"" << result.topMoves[i].first.toString() << "\", \"score\": " << result.topMoves[i].second << "}";
        if (i < result.topMoves.size() - 1) std::cout << ",";
        std::cout << std::endl;
    }
    std::cout << "  ]" << std::endl;
    std::cout << "}" << std::endl;

    return 0;
}
