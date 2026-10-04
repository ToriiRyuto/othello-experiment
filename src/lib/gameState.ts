import { writable } from 'svelte/store';

export type Screen = 'game' | 'result';

export const screen = writable<Screen>('game');

export const playerTimeLeft = writable<number>(30);
export const aiTimeLeft = writable<number>(20);

export const playerTimerId = writable<number | null>(null);
export const aiTimerId = writable<number | null>(null);

export type GameResult = {
  black: number;
  white: number;
  winner: 'YouWin' | 'YouLose' | 'Draw';
};

export const gameResult = writable<GameResult>({
  black: 0,
  white: 0,
  winner: 'Draw'
});

export const finishGame = (result: GameResult) => {
  gameResult.set(result);
  screen.set('result');
};

export const resetGame = () => {
  screen.set('game');
  gameResult.set({ black: 0, white: 0, winner: 'Draw' });
  playerTimeLeft.set(30);
  aiTimeLeft.set(20);
  playerTimerId.set(null);
  aiTimerId.set(null);
};
