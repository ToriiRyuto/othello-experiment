<script lang="ts">
  /* ----------------------------------------------------
     ★ スマホ誤操作防止（ズーム・スクロール・リロード防止）
     ---------------------------------------------------- */
  let lastTap = 0;
  const preventDoubleTapZoom = (e: TouchEvent) => {
    const now = Date.now();
    if (now - lastTap < 300) e.preventDefault();
    lastTap = now;
  };

  const preventPinchZoom = (e: TouchEvent) => {
    if (e.touches.length > 1) e.preventDefault();
  };

  let lastTouchY = 0;
  const preventPullToRefresh = (e: TouchEvent) => {
    const touchY = e.touches[0].clientY;
    if (window.scrollY === 0 && touchY > lastTouchY) e.preventDefault();
    lastTouchY = touchY;
  };

  import { onMount } from "svelte";

  onMount(() => {
    window.addEventListener("touchend", preventDoubleTapZoom, { passive: false });
    window.addEventListener("touchmove", preventPinchZoom, { passive: false });
    window.addEventListener("touchmove", preventPullToRefresh, { passive: false });
  });

  /* ----------------------------------------------------
     ★ 実験前アンケートURL（固定）
     ---------------------------------------------------- */
  const surveyUrl = "https://forms.gle/737UrM4WAjXPzrQX7";

  function goNext() {
    window.location.href = "/setting";
  }
</script>

<svelte:head>
  <title>実験説明</title>
  <meta name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no, orientation=portrait" />
</svelte:head>

<div class="exp-page">

  <!-- ★ 画面上部メッセージ -->
  <div class="top-message">
    はじめに実験説明資料を確認してください
  </div>

  <div class="exp-box">

    <!-- ★ 1番：説明資料 -->
    <a
      href="https://drive.google.com/file/d/1_hAIdOGv3PaUZZjMRuTblD4tXwHCKg3Y/view?usp=sharing"
      class="doc-btn"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span class="num">1</span>
      実験説明資料を開く
    </a>

    <!-- ★ 2番：アンケート -->
    <a href={surveyUrl} class="survey-btn" target="_blank" rel="noopener noreferrer">
      <span class="num">2</span>
      実験前アンケートに回答する
    </a>

    <!-- ★ 3番：次へ -->
    <button class="next-btn" on:click={goNext}>
      <span class="num">3</span>
      次へ（プロフィール設定）
    </button>

  </div>
</div>

<style>
  /* スマホ誤操作防止 */
  html, body {
    overflow: hidden;
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
  }

  .exp-page {
    width: 100vw;
    height: 100vh;
    background: #fff; /* ★ 軽いグレー背景 */
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding-top: 20px;
  }

  /* ★ 上部メッセージ */
  .top-message {
    color: #000;
    font-size: 18px;
    margin-bottom: 20px;
    font-weight: bold;
    text-align: center;
  }

  .exp-box {
    width: 90%;
    max-width: 420px;
    background: rgba(0, 0, 0, 0.2); /* ★ 白背景に合わせて白 */
    padding: 20px;
    border-radius: 12px;
    text-align: center;
    box-sizing: border-box;
    border: 1px solid #ccc; /* 薄い枠で見やすく */
  }

  .exp-box * {
    box-sizing: border-box;
  }

  /* ★ 見えやすい番号（黒背景＋白文字） */
  .num {
    display: inline-block;
    background: #000;   /* ★ 黒背景に変更 */
    color: #fff;        /* ★ 白文字で視認性UP */
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-size: 14px;
    font-weight: bold;
    line-height: 22px;
    margin-right: 8px;
  }

  .doc-btn,
  .survey-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin: 10px auto;
    padding: 14px;
    width: 100%;
    border-radius: 10px;
    text-decoration: none;
    font-size: 18px;
  }

  .doc-btn {
    background: #eee;
    color: #000;
  }

  .survey-btn {
    background: #4af;
    color: #000;
  }

  .next-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    padding: 14px;
    background: #aaa;
    color: #000;
    border-radius: 10px;
    font-size: 18px;
    border: none;
    margin-top: 14px;
  }
</style>
