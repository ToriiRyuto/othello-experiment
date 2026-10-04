export type Bitboard = {
  black: bigint;
  white: bigint;
};

export type Disc = 'black' | 'white';

export const BOARD_SIZE = 6;
export const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;
export const BOARD_MASK = (1n << BigInt(CELL_COUNT)) - 1n;

export const getTurn = (moveCount: number): Disc =>
  moveCount % 2 === 0 ? 'black' : 'white';

// 座標 → ビット
export const posToBit = (x: number, y: number): bigint => {
  const idx = BigInt(y * BOARD_SIZE + x);
  return 1n << idx;
};

// 初期配置（黒先攻）
export const initBitboard = (): Bitboard => {
  let black = 0n;
  let white = 0n;

  // 6x6 の中央4マス
  black |= posToBit(2, 3);
  black |= posToBit(3, 2);
  white |= posToBit(2, 2);
  white |= posToBit(3, 3);

  return { black, white };
};

// popcount
export const popcount = (v: bigint): number => {
  let c = 0;
  let x = v;
  while (x) {
    x &= x - 1n;
    c++;
  }
  return c;
};

export const countDiscsBit = (bb: Bitboard) => ({
  black: popcount(bb.black),
  white: popcount(bb.white),
});

// シフト（境界チェックは呼び出し側で）
export const shift = (bits: bigint, dir: bigint): bigint => {
  if (dir > 0n) return bits << dir;
  else return bits >> -dir;
};

// 方向定義（6x6）
export const DIRS: bigint[] = [
  1n,   // 右
  -1n,  // 左
  6n,   // 下
  -6n,  // 上
  7n,   // 右下
  -7n,  // 左上
  5n,   // 左下
  -5n,  // 右上
];

// 合法手生成（簡易版：境界は盤面外ビットをマスクしておく前提）
const LEFTRIGHT_MASK = 0b011110_011110_011110_011110_011110_011110n;
const TOPBOTTOM_MASK = 0b000000_111111_111111_111111_111111_000000n;
const CENTER_MASK    = 0b000000_011110_011110_011110_011110_000000n;

export const getPlaceableBits = (bb: Bitboard, turn: Disc): bigint => {
  const my = turn === 'black' ? bb.black : bb.white;
  const opp = turn === 'black' ? bb.white : bb.black;
  const empty = ~(my | opp);

  let moves = 0n;

  for (const dir of DIRS) {
    let x = opp;
    if (dir === 1n || dir === -1n) x &= LEFTRIGHT_MASK;
    if (dir === 6n || dir === -6n) x &= TOPBOTTOM_MASK;
    if (dir === 7n || dir === -7n || dir === 5n || dir === -5n) x &= CENTER_MASK;

    x &= shift(my, dir);
    if (dir === 1n || dir === -1n) x &= LEFTRIGHT_MASK;
    if (dir === 6n || dir === -6n) x &= TOPBOTTOM_MASK;
    if (dir === 7n || dir === -7n || dir === 5n || dir === -5n) x &= CENTER_MASK;
    let mask = shift(x, dir);
    while (x !== 0n) {
      x = opp & shift(x, dir);
      if (dir === 1n || dir === -1n) x &= LEFTRIGHT_MASK;
      if (dir === 6n || dir === -6n) x &= TOPBOTTOM_MASK;
      if (dir === 7n || dir === -7n || dir === 5n || dir === -5n) x &= CENTER_MASK;
      mask |= shift(x, dir);
    }
    moves |= mask & empty;
  }
  return moves & BOARD_MASK;
};

// 合法手一覧（ビット → [x,y]）
export const bitsToCoords = (bits: bigint): [number, number][] => {
  const res: [number, number][] = [];
  let b = bits;
  while (b) {
    const lsb = b & -b;
    let idx = 0;
    let t = lsb;
    while (t > 1n) {
      t >>= 1n;
      idx++;
    }
    const y = Math.floor(idx / BOARD_SIZE);
    const x = idx % BOARD_SIZE;
    res.push([x, y]);
    b &= b - 1n;
  }
  return res;
};

// 石を置いて裏返し（アニメーション対応版）
export const applyMoveBit = (
  bb: Bitboard,
  x: number,
  y: number,
  turn: Disc
): { newBB: Bitboard; flipped: [number, number][] } => {
  const my = turn === 'black' ? bb.black : bb.white;
  const opp = turn === 'black' ? bb.white : bb.black;
  const moveMask = posToBit(x, y);

  let flips = 0n;
  const flippedCoords: [number, number][] = [];

  for (const dir of DIRS) {
    let cur = shift(moveMask, dir) & BOARD_MASK;

    if (dir === 1n || dir === -1n) cur &= LEFTRIGHT_MASK;
    else if (dir === 6n || dir === -6n) cur &= TOPBOTTOM_MASK;
    else cur &= CENTER_MASK;

    let line = 0n;

    while (cur && (cur & opp)) {
      line |= cur;

      cur = shift(cur, dir) & BOARD_MASK;
      let tmp = cur;

      if (dir === 1n || dir === -1n) tmp &= LEFTRIGHT_MASK;
      else if (dir === 6n || dir === -6n) tmp &= TOPBOTTOM_MASK;
      else tmp &= CENTER_MASK;

      if (tmp === 0n) break;
    }

    if (cur === 0n) continue;

    if (cur && (cur & my)) {
      flips |= line;
    }
  }

  // flips のビットを座標に変換
  let b = flips;
  while (b) {
    const lsb = b & -b;
    let idx = 0;
    let t = lsb;
    while (t > 1n) {
      t >>= 1n;
      idx++;
    }
    const fy = Math.floor(idx / BOARD_SIZE);
    const fx = idx % BOARD_SIZE;
    flippedCoords.push([fx, fy]);
    b &= b - 1n;
  }

  const newMy = my | moveMask | flips;
  const newOpp = opp & ~flips;

  const newBB =
    turn === 'black'
      ? { black: newMy, white: newOpp }
      : { black: newOpp, white: newMy };

  return { newBB, flipped: flippedCoords };
};
