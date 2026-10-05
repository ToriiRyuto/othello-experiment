<script lang="ts">
  /* ----------------------------------------------------
     ★ スマホ誤操作防止（ダブルタップ拡大・ピンチズーム・
        プルダウンリロード防止）
     ---------------------------------------------------- */
  let lastTap = 0;
  const preventDoubleTapZoom = (e: TouchEvent) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      e.preventDefault();
    }
    lastTap = now;
  };

  const preventPinchZoom = (e: TouchEvent) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  };

  let lastTouchY = 0;
  const preventPullToRefresh = (e: TouchEvent) => {
    const touchY = e.touches[0].clientY;
    const scrollY = window.scrollY;

    if (scrollY === 0 && touchY > lastTouchY) {
      e.preventDefault();
    }
    lastTouchY = touchY;
  };

  import { onMount } from 'svelte';
  onMount(() => {
    window.addEventListener("touchend", preventDoubleTapZoom, { passive: false });
    window.addEventListener("touchmove", preventPinchZoom, { passive: false });
    window.addEventListener("touchmove", preventPullToRefresh, { passive: false });
  });

  /* ----------------------------------------------------
     ★ ここから元の play ロジック
     ---------------------------------------------------- */

  import { writable, get } from 'svelte/store';
  import type { Bitboard, Disc } from '$lib/board';
  import {
    getTurn,
    initBitboard,
    posToBit,
    bitsToCoords,
    getPlaceableBits,
    applyMoveBit,
    countDiscsBit,
    BOARD_SIZE
  } from '$lib/board';
  import { playerTimeLeft, playerTimerId, aiTimeLeft, aiTimerId, finishGame } from '$lib/gameState';
  import sprite from './profileImage.png';
  import bgImage from './bgImage.png';

  type MoveLog = {
    turn: 'black' | 'white';
    x: number;
    y: number;
    board: string;
  };
  let moveLogs: MoveLog[] = [];

  let myName = $state("");
  let myComment = $state("");
  let myIndex = $state(0);

  let oppName = $state("");
  let oppComment = $state("");
  let oppIndex = $state(0);

  let managementNumber = $state(1);

  let firstPlayer = $state("me");

  const positions = [
    '0% 2%', '20% 2%', '40% 0.5%', '59.7% 2%', '80% 0.5%', '100% 2%',
    '0% 52%', '20% 53%', '40% 53%', '60% 53%', '80% 53%', '100% 53%',
    '1.75% 97.5%', '21% 99%', '40% 99%', '59.7% 99%', '79.5% 99%', '99% 99%'
  ];

  function boardToString(bb: Bitboard): string {
    let s = "";
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const mask = posToBit(x, y);
        if (bb.black & mask) s += "B";
        else if (bb.white & mask) s += "W";
        else s += ".";
      }
      s += "\n";
    }
    return s;
  }

  type Cell = {
    kind: 'black' | 'white' | 'empty';
    state: { kind: 'none' | 'placeable' };
    animating: boolean;
  };

  let worker: Worker;
  const aiPlayer: Disc = Math.random() < 0.5 ? 'black' : 'white';

  const bitboard = writable<Bitboard>(initBitboard());
  const moveCount = writable<number>(0);
  const boardView = writable<Cell[][]>(createBoardView(get(bitboard)));

  onMount(() => {
    managementNumber = Number(localStorage.getItem("managementNumber") ?? 1);

    myName = localStorage.getItem("username") ?? "";
    myComment = localStorage.getItem("comment") ?? "";
    myIndex = Number(localStorage.getItem("profileIndex") ?? 0);

    if (aiPlayer === "black") {
      firstPlayer = "opponent";
    } else {
      firstPlayer = "me";
    }
    localStorage.setItem("firstPlayer", firstPlayer);

    if (managementNumber === 1) {
      oppName = "Haru";
      oppComment = "";
      oppIndex = 6;
    }
    if (managementNumber === 2) {
      oppName = "Haru";
      oppComment = "勝負が好きなので負けません！";
      oppIndex = 6;
    }
    if (managementNumber === 3) {
      oppName = "";
      oppComment = "";
      oppIndex = 6;
    }
    if (managementNumber === 4) {
      oppName = "Haru";
      oppComment = "勝負が好きなので負けません！";
      oppIndex = 6;
    }

    worker = new Worker(new URL('$lib/worker.ts', import.meta.url), { type: 'module' });

    worker.onmessage = async (event) => {
      const { move, explore, prune } = event.data;

      const id = get(aiTimerId);
      if (id !== null) {
        clearInterval(id);
        aiTimerId.set(null);
      }

      if (!move) return;

      const [x, y] = move;
      const bb = get(bitboard);
      const { newBB, flipped } = applyMoveBit(bb, x, y, aiPlayer);

      boardView.update(rows => {
        rows[y][x].kind = aiPlayer;
        return rows;
      });

      moveCount.update(c => c + 1);

      await animateFlip(flipped);

      bitboard.set(newBB);

      moveLogs.push({
        turn: aiPlayer,
        x,
        y,
        board: boardToString(newBB)
      });
      localStorage.setItem("moveLogs", JSON.stringify(moveLogs));
    };

    bitboard.subscribe((bb) => {
      const count = get(moveCount);
      const turn = getTurn(count);

      const blackMoves = getPlaceableBits(bb, 'black');
      const whiteMoves = getPlaceableBits(bb, 'white');
      const discs = countDiscsBit(bb);
      const total = discs.black + discs.white;

      if (total === BOARD_SIZE * BOARD_SIZE || (blackMoves === 0n && whiteMoves === 0n)) {
        localStorage.setItem("moveLogs", JSON.stringify(moveLogs));

        let winnerColor: Disc | 'draw';
        if (discs.black > discs.white) winnerColor = 'black';
        else if (discs.white > discs.black) winnerColor = 'white';
        else winnerColor = 'draw';

        let result: 'YouWin' | 'YouLose' | 'Draw';
        if (winnerColor === 'draw') result = 'Draw';
        else if (winnerColor !== aiPlayer) result = 'YouWin';
        else result = 'YouLose';

        finishGame({
          black: discs.black,
          white: discs.white,
          winner: result
        });
        return;
      }

      const placeBits = getPlaceableBits(bb, turn);
      const hasMove = placeBits !== 0n;

      if (!hasMove) {
        moveCount.update(c => c + 1);
        bitboard.set(get(bitboard));
        return;
      }

      boardView.set(createBoardView(bb));

      if (turn !== aiPlayer) {
        startPlayerTimer();
      } else {
        startAITimer();

        let dynamicDepth = 1;
        if (count < 2) dynamicDepth = 1;
        else if (count < 10) dynamicDepth = 10;
        else if (count < 16) dynamicDepth = 12;
        else dynamicDepth = 14;

        worker.postMessage({
          blackBits: bb.black,
          whiteBits: bb.white,
          player: aiPlayer,
          maxDepth: dynamicDepth,
          timeLimit: 15000,
          moveCount: count
        });
      }
    });
  });

  function createBoardView(bb: Bitboard): Cell[][] {
    let old: Cell[][] | null = null;
    try {
      old = get(boardView);
    } catch {
      old = null;
    }

    const rows: Cell[][] = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < BOARD_SIZE; x++) {
        const mask = posToBit(x, y);
        let kind: 'black' | 'white' | 'empty' = 'empty';
        if (bb.black & mask) kind = 'black';
        else if (bb.white & mask) kind = 'white';

        row.push({
          kind,
          state: { kind: 'none' },
          animating: old?.[y]?.[x]?.animating ?? false
        });
      }
      rows.push(row);
    }

    const turn = getTurn(get(moveCount));
    if (turn !== aiPlayer) {
      const placeBits = getPlaceableBits(bb, turn);
      const coords = bitsToCoords(placeBits);
      for (const [x, y] of coords) {
        rows[y][x].state = { kind: 'placeable' };
      }
    }
    return rows;
  }

  async function animateFlip(flipped: [number, number][]) {
    for (const [x, y] of flipped) {
      boardView.update(rows => {
        const newRows = rows.map(r => r.map(c => ({ ...c })));
        newRows[y][x].animating = true;
        return newRows;
      });

      await new Promise(r => setTimeout(r, 400));

      boardView.update(rows => {
        const newRows = rows.map(r => r.map(c => ({ ...c })));
        const cell = newRows[y][x];
        cell.kind = cell.kind === 'black' ? 'white' : 'black';
        return newRows;
      });

      await new Promise<void>(resolve => {
        requestAnimationFrame(() => resolve());
      });

      boardView.update(rows => {
        const newRows = rows.map(r => r.map(c => ({ ...c })));
        newRows[y][x].animating = false;
        return newRows;
      });
    }
    await new Promise(r => setTimeout(r, 500));
  }

  function startPlayerTimer() {
    const id = get(playerTimerId);
    if (id !== null) {
      clearInterval(id);
      playerTimerId.set(null);
    }

    playerTimeLeft.set(30);

    const newId = setInterval(() => {
      playerTimeLeft.update(t => {
        if (t <= 0.1) {
          clearInterval(newId);
          playerTimerId.set(null);
          return 0;
        }
        return t - 0.1;
      });
    }, 100);

    playerTimerId.set(newId);
  }

  function startAITimer() {
    const id = get(aiTimerId);
    if (id !== null) {
      clearInterval(id);
      aiTimerId.set(null);
    }

    aiTimeLeft.set(20);

    const newId = setInterval(() => {
      aiTimeLeft.update(t => {
        if (t <= 0.1) {
          clearInterval(newId);
          aiTimerId.set(null);
          worker.postMessage({ stop: true });
          return 0;
        }
        return t - 0.1;
      });
    }, 100);

    aiTimerId.set(newId);
  }

  const handleClick = async (x: number, y: number) => {
    const turn = getTurn(get(moveCount));
    if (turn === aiPlayer) return;

    const bb = get(bitboard);
    const placeBits = getPlaceableBits(bb, turn);
    const mask = posToBit(x, y);

    if (!(placeBits & mask)) return;

    const { newBB, flipped } = applyMoveBit(bb, x, y, turn);

    boardView.update(rows => {
      rows[y][x].kind = turn;
      return rows;
    });

    moveCount.update(c => c + 1);

    await animateFlip(flipped);

    bitboard.set(newBB);

    moveLogs.push({
      turn,
      x,
      y,
      board: boardToString(newBB)
    });
    localStorage.setItem("moveLogs", JSON.stringify(moveLogs));
  };
</script>

<style>
  /* ★ スマホ誤操作防止（ズーム・スクロール・選択禁止） */
  html, body {
    overflow: hidden;
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
  }

  .page {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #000;
  }

  .screen {
    position: relative;
    width: min(100vw, 66.6667vh);
    height: min(100vh, 150vw);
    aspect-ratio: 2 / 3;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #000;
  }

  .background-image {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none;
    user-select: none;
  }

  .game-area {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .board-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    aspect-ratio: 1 / 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .board {
    display: grid;
    grid-template-columns: repeat(6, 50px);
    grid-template-rows: repeat(6, 50px);
    gap: 0;
    border: 4px solid black;
  }

  .cell {
    width: 50px;
    height: 50px;
    background: #0a7f00;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    color: white;
    font-size: 20px;
    border: 1.5px solid black;
    box-sizing: border-box;
  }

  .disc {
    height: 40px;
    width: 40px;
    border-radius: 50%;
    transition: transform 0.4s ease;
    transform: scaleX(1);
  }

  .disc.animating {
    transform: scaleX(0);
  }

  .black {
    background: black;
  }

  .white {
    background: white;
  }

  .placeable {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
  }

  .timer-bar {
    position: absolute;
    left: 5%;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 300px;
    border: 2px solid rgba(255, 255, 0, 0.5);
    background: rgba(255, 255, 0, 0.2);
    display: flex;
    flex-direction: column-reverse;
  }

  .timer-fill {
    width: 100%;
    transition: height 0.2s linear;
  }

  /* プロフィールカード（共通） */
  .profile-card {
    position: absolute;
    width: 90%;
    height: 80px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 16px;
    border-radius: 10px;
    color: #fff;
    backdrop-filter: blur(6px);

    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* 管理番号4専用 */
  .profile-card.m4 {
    justify-content: flex-start;
    padding-left: 16px;
  }

  .profile-card.m4 .row {
    justify-content: flex-start;
  }

  .profile-card.m4 .icon.big {
    flex-shrink: 0;
  }

  /* 管理番号2専用 */
  .profile-card.m2 {
    flex-direction: column;
    justify-content: center;
  }

  .profile-card.m2 .name,
  .profile-card.m2 .comment {
    width: 100%;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    margin: 0;
    padding: 0;
  }

  .profile-card.m2 .comment {
    margin-top: 4px;
  }

  /* 管理番号1専用 */
  .profile-card.m1 {
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
  }

  /* 盤面に絶対かぶらない固定位置 */
  .opponent {
    top: 3%;
    background: rgba(255, 80, 80, 0.25);
    border: 1px solid rgba(255, 120, 120, 0.4);
  }

  .thinking {
    position: absolute;
    right: 10px;
    bottom: 6px;
    font-size: 13px;
    opacity: 0.85;
    color: #fff;
  }

  .me {
    bottom: 3%;
    background: rgba(80, 160, 255, 0.25);
    border: 1px solid rgba(120, 180, 255, 0.4);
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
  }

  .icon.big {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background-repeat: no-repeat;
    background-size: 600% 300%;
  }

  .icon {
    width: 80px;
    height: 80px;
    margin: 6px auto 0;
    border-radius: 50%;
    background-repeat: no-repeat;
    background-size: 600% 300%;
  }

  .text-block {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .name {
    font-size: 16px;
    font-weight: bold;
  }

  .comment {
    font-size: 13px;
    margin-top: 4px;
  }
</style>

<div class="page">
  <div class="screen">
    <img src={bgImage} alt="" class="background-image" />

    <!-- 相手プロフィール -->
    <div class="profile-card opponent
      {managementNumber === 4 ? 'm4' : ''}
      {managementNumber === 2 ? 'm2' : ''}
      {managementNumber === 1 ? 'm1' : ''}"
    >
      {#if managementNumber === 4}
        <div class="row">
          <div
            class="icon big"
            style={`
              background-image: url(${sprite});
              background-position: ${positions[oppIndex]};
              background-size: ${oppIndex >= 12 ? '660% 330%' : '600% 300%'};
              background-color: ${firstPlayer === "opponent" ? "#000" : "#fff"};
            `}
          ></div>

          <div class="text-block">
            <div class="name">名前：{oppName}</div>
            <div class="comment">コメント：{oppComment}</div>
          </div>
        </div>

      {:else if managementNumber === 2}
        <div class="name">名前：{oppName}</div>
        <div class="comment">{oppComment}</div>

      {:else if managementNumber === 3}
        <div
          class="icon"
          style={`
            background-image: url(${sprite});
            background-position: ${positions[oppIndex]};
            background-size: ${oppIndex >= 12 ? '660% 330%' : '600% 300%'};
            background-color: ${firstPlayer === "opponent" ? "#000" : "#fff"};
          `}
        ></div>

      {:else if managementNumber === 1}
        相手
      {/if}

      {#if getTurn($moveCount) === aiPlayer}
        <div class="thinking">考え中...</div>
      {/if}
    </div>

    <div class="game-area">
      {#if getTurn($moveCount) !== aiPlayer}
        <div class="timer-bar">
          <div
            class="timer-fill"
            style="
              height: {$playerTimeLeft * (100/30)}%;
              background: hsl({$playerTimeLeft * (120/30)}, 80%, 50%);
            "
          ></div>
        </div>
      {/if}

      <div class="board-wrapper">
        <div class="board">
          {#each $boardView as row, y (y)}
            {#each row as cell, x (`${y}-${x}`)}
              <button class="cell" onclick={() => handleClick(x, y)}>
                {#if cell.kind === 'black'}
                  <div class="disc black" class:animating={cell.animating}></div>
                {:else if cell.kind === 'white'}
                  <div class="disc white" class:animating={cell.animating}></div>
                {:else if cell.state.kind === 'placeable' && getTurn($moveCount) !== aiPlayer}
                  <div class="placeable"></div>
                {/if}
              </button>
            {/each}
          {/each}
        </div>
      </div>
    </div>

    <!-- 自分プロフィール -->
    <div class="profile-card me
      {managementNumber === 4 ? 'm4' : ''}
      {managementNumber === 2 ? 'm2' : ''}
      {managementNumber === 1 ? 'm1' : ''}"
    >
      {#if managementNumber === 4}
        <div class="row">
          <div
            class="icon big"
            style={`
              background-image: url(${sprite});
              background-position: ${positions[myIndex]};
              background-size: ${myIndex >= 12 ? '660% 330%' : '600% 300%'};
              background-color: ${firstPlayer === "me" ? "#000" : "#fff"};
            `}
          ></div>

          <div class="text-block">
            <div class="name">名前：{myName}</div>
            <div class="comment">コメント：{myComment}</div>
          </div>
        </div>

      {:else if managementNumber === 2}
        <div class="name">名前：{myName}</div>
        <div class="comment">{myComment}</div>

      {:else if managementNumber === 3}
        <div
          class="icon"
          style={`
            background-image: url(${sprite});
            background-position: ${positions[myIndex]};
            background-size: ${myIndex >= 12 ? '660% 330%' : '600% 300%'};
            background-color: ${firstPlayer === "me" ? "#000" : "#fff"};
          `}
        ></div>

      {:else if managementNumber === 1}
        自分
      {/if}
    </div>

  </div>
</div>
