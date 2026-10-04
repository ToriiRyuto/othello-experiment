export type Move = number; // 0〜35、または -1（pass）
export type Moves = Move[];

export const toMove = (x: number, y: number): Move => y * 6 + x;

export const fromMove = (move: Move) => ({
  x: move % 6,
  y: Math.floor(move / 6),
});

export const addMove = (moves: Moves, move: Move): Moves => [...moves, move];

export const passMove: Move = -1;