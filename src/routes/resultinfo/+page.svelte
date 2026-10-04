<script lang="ts">
  import sprite from '../play/profileImage.png';
  import bgImage from '../play/bgImage.png';
  import { gameResult } from '$lib/gameState';
  import { goto } from '$app/navigation';

  let managementNumber = $state(1);

  let oppName = $state("");
  let oppComment = $state("");
  let oppIndex = $state(0);

  let myName = $state("");
  let myComment = $state("");
  let myIndex = $state(0);

  let firstPlayer = $state("me");

  const positions = [
    '0% 2%', '20% 2%', '40% 0.5%', '59.7% 2%', '80% 0.5%', '100% 2%',
    '0% 52%', '20% 53%', '40% 53%', '60% 53%', '80% 53%', '100% 53%',
    '1.75% 97.5%', '21% 99%', '40% 99%', '59.7% 99%', '79.5% 99%', '99% 99%'
  ];

  // ★ localStorage 読み込み
  $effect(() => {
    if (typeof localStorage !== "undefined") {
      managementNumber = Number(localStorage.getItem("managementNumber") ?? 1);

      myName = localStorage.getItem("username") ?? "";
      myComment = localStorage.getItem("comment") ?? "";
      myIndex = Number(localStorage.getItem("profileIndex") ?? 0);

      firstPlayer = localStorage.getItem("firstPlayer") ?? "me";
      console.log(`先攻は ${firstPlayer === "me" ? "自分" : "相手"} です`);

      // 相手プロフィール（固定）
      oppName = "Haru";
      oppComment = "勝負が好きなので負けません！";
      oppIndex = 6;
    }
  });

  function goNext() {
    goto('/resultnext');
  }

  // ★ 駒を枚数分生成（折り返し強化）
  function discs(count: number, color: "black" | "white") {
    const perRow = 18; // ← 1段に並べる枚数を増やした（32pxでも収まる）
    return Array.from({ length: count }, (_, i) => ({
      color,
      row: Math.floor(i / perRow),
      offset: (i % perRow) * 14  // ← 駒サイズ32pxに合わせて調整
    }));
  }
</script>

<div class="resultinfo-page" on:click={goNext}>
  <img src={bgImage} alt="" class="background-image" />

  <div class="resultinfo">

    <!-- 勝敗 -->
    <div class="result-banner { $gameResult.winner }">
      {#if $gameResult.winner === 'YouWin'}
        🎉 You Win!! 🎉
      {:else if $gameResult.winner === 'YouLose'}
        💥 You Lose... 💥
      {:else}
        🔵 Draw 🔵
      {/if}
    </div>

    <!-- 相手プロフィールカード -->
    <div class="profile-card opponent-card
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

      {:else if managementNumber === 2}
        <div class="name center">名前：{oppName}</div>
        <div class="comment center">{oppComment}</div>

      {:else if managementNumber === 1}
        <div class="name center">相手</div>
      {/if}
    </div>

    <!-- 上：相手の駒 -->
    <div class="disc-stack">
    {#if firstPlayer === "me"}
        <!-- 自分が先攻 → 相手は白 -->
        <span class="score-text">{$gameResult.white}</span>
        {#each discs($gameResult.white, "white") as d}
        <div class="disc {d.color}" style={`transform: translate(${d.offset}px, ${d.row * 26}px);`}></div>
        {/each}
    {:else}
        <!-- 自分が後攻 → 相手は黒 -->
        <span class="score-text">{$gameResult.black}</span>
        {#each discs($gameResult.black, "black") as d}
        <div class="disc {d.color}" style={`transform: translate(${d.offset}px, ${d.row * 26}px);`}></div>
        {/each}
    {/if}
    </div>

    <!-- 下：自分の駒 -->
    <div class="disc-stack">
    {#if firstPlayer === "me"}
        <!-- 自分が先攻 → 自分は黒 -->
        <span class="score-text">{$gameResult.black}</span>
        {#each discs($gameResult.black, "black") as d}
        <div class="disc {d.color}" style={`transform: translate(${d.offset}px, ${d.row * 26}px);`}></div>
        {/each}
    {:else}
        <!-- 自分が後攻 → 自分は白 -->
        <span class="score-text">{$gameResult.white}</span>
        {#each discs($gameResult.white, "white") as d}
        <div class="disc {d.color}" style={`transform: translate(${d.offset}px, ${d.row * 26}px);`}></div>
        {/each}
    {/if}
    </div>

    <!-- 自分プロフィールカード -->
    <div class="profile-card me-card
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

      {:else if managementNumber === 2}
        <div class="name center">名前：{myName}</div>
        <div class="comment center">{myComment}</div>

      {:else if managementNumber === 1}
        <div class="name center">自分</div>
      {/if}
    </div>

  </div>

  <div class="next-hint">タップして次へ</div>
</div>

<style>
  .resultinfo-page {
    width: 100vw;
    min-height: 100vh;
    background: #000;
    position: relative;
    overflow: hidden;
    color: #fff;
  }

  .background-image {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none;
    z-index: 0;
  }

  .resultinfo {
    position: relative;
    z-index: 1;
    padding: 20px;
    max-width: 420px;
    margin: 0 auto;
    text-align: center;
  }

  .result-banner {
    font-size: 32px;
    font-weight: bold;
    padding: 16px;
    margin-top: 70px;
    margin-bottom: 20px;
    border-radius: 12px;
    animation: glow 2s infinite alternate;
  }

  .YouWin { color: #ffd700; border: 2px solid #ffd700; box-shadow: 0 0 20px #ffd700; }
  .YouLose { color: #ff5050; border: 2px solid #ff5050; box-shadow: 0 0 20px #ff5050; }
  .Draw { color: #4abaff; border: 2px solid #4abaff; box-shadow: 0 0 20px #4abaff; }

  .profile-card {
    width: 90%;
    height: 80px;
    margin: 20px auto;
    padding: 12px 16px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .opponent-card {
    background: rgba(255, 80, 80, 0.25);
    border: 1px solid rgba(255, 120, 120, 0.4);
  }

  .me-card {
    background: rgba(80, 160, 255, 0.25);
    border: 1px solid rgba(120, 180, 255, 0.4);
  }

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

  .profile-card.m1 {
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .icon.big {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background-repeat: no-repeat;
  }

  .icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-repeat: no-repeat;
  }

  .text-block {
    display: flex;
    flex-direction: column;
    text-align: left;
  }

  /* 駒スタック（折り返し強化） */
  .disc-stack {
    width: 100%;
    max-width: 340px;
    margin: 14px auto;
    position: relative;
    height: 60px; /* ← 1段下げ＋段数増加に対応 */
  }

  .disc {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    position: absolute;
    left: 50px; /* 数字の左にスペース */
  }

  .disc.black {
    background: black;
    border: 3px solid #333;
  }

  .disc.white {
    background: white;
    border: 3px solid #ccc;
  }

  .score-text {
    position: absolute;
    left: 0;
    top: 16px;
    transform: translateY(-50%);
    font-size: 22px;
    font-weight: bold;
    width: 40px;
    text-align: center;
  }

  .next-hint {
    position: absolute;
    bottom: 12%;
    width: 100%;
    text-align: center;
    font-size: 18px;
    opacity: 0.8;
  }

  @keyframes glow {
    from { transform: scale(1); }
    to { transform: scale(1.05); }
  }
</style>
