// worker.ts
import { alphabeta, exploreCount, pruneCount } from './oracle';
import type { Bitboard, Disc } from './board';

let stopFlagInternal = false;

onmessage = (event) => {
  const { blackBits, whiteBits, player, maxDepth, timeLimit, stop, moveCount } = event.data as {
    blackBits: bigint;
    whiteBits: bigint;
    player: Disc;
    maxDepth: number;
    timeLimit: number;
    stop?: boolean;
    moveCount: number;
  };

  if (stop) {
    stopFlagInternal = true;
    console.log('探索強制終了');
    return;
  }

  stopFlagInternal = false;

  const startTime = performance.now();
  let bestMoveSoFar: [number, number] | null = null;

  const stopFlag = () => stopFlagInternal;

  const bb: Bitboard = { black: blackBits, white: whiteBits };

  // 反復深化
  for (let depth = 1; depth <= maxDepth; depth++) {
    console.log(`探索深さ: ${depth}`);

    const result = alphabeta(
      bb,
      player,
      moveCount,
      depth,
      -Infinity,
      Infinity,
      true,
      stopFlag
    );
    console.log(Math.round(result.score*100)/100, result.move);

    if (result.move !== null) {
      bestMoveSoFar = result.move;
    }

    const elapsed = performance.now() - startTime;
    if (elapsed >= timeLimit || stopFlagInternal) {
      break;
    }
  }

  postMessage({
    move: bestMoveSoFar,
    explore: exploreCount,
    prune: pruneCount
  });
};
