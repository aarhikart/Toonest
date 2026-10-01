import { Chess } from 'chess.js';
import { ChessDifficulty, BotMoveResult } from './types';

// Standard piece values in centipawns
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tables (White perspective; flipped for Black)
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
];

const ROOK_TABLE = [
   0,  0,  0,  0,  0,  0,  0,  0,
   5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
   0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_MIDGAME_TABLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20
];

function getPstScore(pieceType: string, squareIndex: number, isWhite: boolean): number {
  const idx = isWhite ? squareIndex : 63 - squareIndex;
  switch (pieceType) {
    case 'p': return PAWN_TABLE[idx] || 0;
    case 'n': return KNIGHT_TABLE[idx] || 0;
    case 'b': return BISHOP_TABLE[idx] || 0;
    case 'r': return ROOK_TABLE[idx] || 0;
    case 'q': return QUEEN_TABLE[idx] || 0;
    case 'k': return KING_MIDGAME_TABLE[idx] || 0;
    default: return 0;
  }
}

function evaluatePosition(game: Chess): number {
  if (game.isCheckmate()) {
    return -99999;
  }
  if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial()) {
    return 0;
  }

  let whiteScore = 0;
  let blackScore = 0;

  const board = game.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const baseValue = PIECE_VALUES[piece.type] || 0;
      const squareIdx = r * 8 + c;
      const pst = getPstScore(piece.type, squareIdx, piece.color === 'w');

      if (piece.color === 'w') {
        whiteScore += baseValue + pst;
      } else {
        blackScore += baseValue + pst;
      }
    }
  }

  const turn = game.turn();
  const evaluation = whiteScore - blackScore;
  return turn === 'w' ? evaluation : -evaluation;
}

function orderMoves(moves: any[]): any[] {
  return moves.slice().sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (a.captured) {
      scoreA += (PIECE_VALUES[a.captured] || 100) * 10 - (PIECE_VALUES[a.piece] || 100);
    }
    if (b.captured) {
      scoreB += (PIECE_VALUES[b.captured] || 100) * 10 - (PIECE_VALUES[b.piece] || 100);
    }
    if (a.promotion) scoreA += 800;
    if (b.promotion) scoreB += 800;
    return scoreB - scoreA;
  });
}

function quiescence(game: Chess, alpha: number, beta: number, maxDepth = 3): number {
  const standPat = evaluatePosition(game);
  if (standPat >= beta) return beta;
  if (alpha < standPat) alpha = standPat;
  if (maxDepth <= 0) return alpha;

  const legalMoves = game.moves({ verbose: true }) as any[];
  const captureMoves = orderMoves(legalMoves.filter((m) => m.captured || m.promotion));

  for (const move of captureMoves) {
    game.move(move);
    const score = -quiescence(game, -beta, -alpha, maxDepth - 1);
    game.undo();

    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }
  return alpha;
}

function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isQuiescenceEnabled: boolean
): number {
  if (depth <= 0) {
    return isQuiescenceEnabled ? quiescence(game, alpha, beta) : evaluatePosition(game);
  }

  if (game.isGameOver()) {
    return evaluatePosition(game);
  }

  const legalMoves = game.moves({ verbose: true }) as any[];
  const orderedMoves = orderMoves(legalMoves);

  for (const move of orderedMoves) {
    game.move(move);
    const evalScore = -minimax(game, depth - 1, -beta, -alpha, isQuiescenceEnabled);
    game.undo();

    if (evalScore >= beta) return beta;
    if (evalScore > alpha) alpha = evalScore;
  }
  return alpha;
}

export async function getBestBotMove(
  fen: string,
  difficulty: ChessDifficulty
): Promise<BotMoveResult | null> {
  const game = new Chess(fen);
  if (game.isGameOver()) return null;

  const legalMoves = game.moves({ verbose: true }) as any[];
  if (legalMoves.length === 0) return null;

  // Subtle natural thinking delay
  await new Promise((resolve) => setTimeout(resolve, 350 + Math.random() * 250));

  if (difficulty === 'beginner') {
    if (Math.random() < 0.45) {
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      return {
        from: randomMove.from,
        to: randomMove.to,
        promotion: randomMove.promotion || undefined,
        evaluation: 0,
      };
    }
    let bestVal = -Infinity;
    let chosen = legalMoves[0];
    for (const move of legalMoves) {
      game.move(move);
      const val = -evaluatePosition(game);
      game.undo();
      if (val > bestVal) {
        bestVal = val;
        chosen = move;
      }
    }
    return {
      from: chosen.from,
      to: chosen.to,
      promotion: chosen.promotion || undefined,
      evaluation: bestVal,
    };
  }

  if (difficulty === 'easy') {
    if (Math.random() < 0.15) {
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      return {
        from: randomMove.from,
        to: randomMove.to,
        promotion: randomMove.promotion || undefined,
      };
    }
    let bestVal = -Infinity;
    let chosen = legalMoves[0];
    const ordered = orderMoves(legalMoves);
    for (const move of ordered) {
      game.move(move);
      const val = -minimax(game, 1, -Infinity, Infinity, false);
      game.undo();
      if (val > bestVal) {
        bestVal = val;
        chosen = move;
      }
    }
    return {
      from: chosen.from,
      to: chosen.to,
      promotion: chosen.promotion || undefined,
      evaluation: bestVal,
    };
  }

  const depth = difficulty === 'medium' ? 3 : 4;
  const useQuiescence = difficulty === 'hard' || difficulty === 'expert';

  let alpha = -Infinity;
  const beta = Infinity;
  let bestMoves: any[] = [];
  let bestScore = -Infinity;

  const ordered = orderMoves(legalMoves);

  for (const move of ordered) {
    game.move(move);
    const score = -minimax(game, depth - 1, -beta, -alpha, useQuiescence);
    game.undo();

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
      alpha = score;
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }

  const selectedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)] || ordered[0];

  return {
    from: selectedMove.from,
    to: selectedMove.to,
    promotion: selectedMove.promotion || undefined,
    evaluation: bestScore,
  };
}
