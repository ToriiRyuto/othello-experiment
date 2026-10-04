import type { Bitboard, Disc } from './board';
import { countDiscsBit, getPlaceableBits, bitsToCoords, applyMoveBit, posToBit } from './board';

export let exploreCount = 0;
export let pruneCount = 0;

// 6x6用位置評価テーブル
const positionWeight = [
  [  50,   1,  3,  3,   1,  50 ],
  [   1,  -3,  5,  5,  -3,   1 ],
  [   3,   5,  0,  0,   5,   3 ],
  [   3,   5,  0,  0,   5,   3 ],
  [   1,  -3,  5,  5,  -3,   1 ],
  [  50,   1,  3,  3,   1,  50 ]
];

const getTurn = (moveCount: number): Disc =>
  moveCount % 2 === 0 ? 'black' : 'white';

// 石数評価
function discScore(bb: Bitboard, player: Disc) {
  const result = countDiscsBit(bb);
  return player === 'black'
    ? result.black - result.white
    : result.white - result.black;
}

// 着手可能数（mobility）
function mobilityScore(bb: Bitboard, player: Disc): number {
  const myMoves = bitsToCoords(getPlaceableBits(bb, player)).length;

  const opp = player === 'black' ? 'white' : 'black';
  const oppMoves = bitsToCoords(getPlaceableBits(bb, opp)).length;

  return myMoves - oppMoves;
}

// 囲い具合（周囲の空きマス数）
function surroundScore(bb: Bitboard, player: Disc): number {
  let score = 0;

  const myBits = player === 'black' ? bb.black : bb.white;

  for (let y = 0; y < 6; y++) {
    for (let x = 0; x < 6; x++) {
      const mask = posToBit(x, y);
      if (!(myBits & mask)) continue;

      let emptyAround = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= 6 || ny < 0 || ny >= 6) continue;

          const nmask = posToBit(nx, ny);
          const isEmpty = !(bb.black & nmask) && !(bb.white & nmask);
          if (isEmpty) emptyAround++;
        }
      }

      score -= emptyAround;
    }
  }

  return score;
}

// ★ 盤面全体の位置評価（探索先にも適用される）
function positionScore(bb: Bitboard, player: Disc): number {
  const myBits = player === 'black' ? bb.black : bb.white;
  let score = 0;

  for (let y = 0; y < 6; y++) {
    for (let x = 0; x < 6; x++) {
      const mask = posToBit(x, y);
      if (myBits & mask) {
        score += positionWeight[y][x];
      }
    }
  }

  return score;
}

// ★ 評価（位置評価も moveCount に応じて重みづけ）
export function evaluate(bb: Bitboard, moveCount: number, player: Disc): number {
  const disc = discScore(bb, player);
  const mobility = mobilityScore(bb, player);
  const surround = surroundScore(bb, player);
  const pos = positionScore(bb, player);
  const noise = (Math.random() - 0.5) * 3;

  if (moveCount <= 2) {
    return pos * 0.3 + noise;
  } else if (moveCount <= 18) {
    return disc * 1.0 + mobility * 1.5 + surround * 0.5 + pos * 0.0 + noise;
  } else if (moveCount <= 28) {
    const ideal = -4;
    const endgame = disc > 0
      ? -Math.abs(disc - ideal) * 2.0
      : -Math.abs(disc - ideal);

    return endgame + pos * 0.5;
  } else {
    return -Math.abs(disc) * 100;
  }
}

export const alphabeta = (
  bb: Bitboard,
  player: Disc,
  moveCount: number,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  stopFlag: () => boolean
): { score: number; move: [number, number] | null } => {

  if (stopFlag()) return { score: evaluate(bb, moveCount, player), move: null };

  exploreCount++;

  const turn = getTurn(moveCount);
  const placeableBits = getPlaceableBits(bb, turn);
  const placeables = bitsToCoords(placeableBits);

  if (depth === 0 || placeables.length === 0) {
    return { score: evaluate(bb, moveCount, player), move: null };
  }

  if (maximizing) {
    let bestScore = -Infinity;
    let bestMove: [number, number] | null = null;

    for (const [x, y] of placeables) {
      const { newBB } = applyMoveBit(bb, x, y, turn);
      const posScore = positionWeight[y][x]; // ★ 今打つ手の位置評価

      const result = alphabeta(
        newBB,
        player,
        moveCount + 1,
        depth - 1,
        alpha,
        beta,
        false,
        stopFlag
      );

      const totalScore = result.score + posScore; // ★ 常に加算する

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestMove = [x, y];
      }

      alpha = Math.max(alpha, bestScore);
      if (beta <= alpha) {
        pruneCount++;
        break;
      }
    }

    return { score: bestScore, move: bestMove };
  }

  else {
    let bestScore = Infinity;
    let bestMove: [number, number] | null = null;

    for (const [x, y] of placeables) {
      const { newBB } = applyMoveBit(bb, x, y, turn);
      const posScore = positionWeight[y][x];

      const result = alphabeta(
        newBB,
        player,
        moveCount + 1,
        depth - 1,
        alpha,
        beta,
        true,
        stopFlag
      );

      const totalScore = result.score - posScore;

      if (totalScore < bestScore) {
        bestScore = totalScore;
        bestMove = [x, y];
      }

      beta = Math.min(beta, bestScore);
      if (beta <= alpha) {
        pruneCount++;
        break;
      }
    }

    return { score: bestScore, move: bestMove };
  }
};
