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
  import bgImage from "../play/bgImage.png";

  onMount(() => {
    window.addEventListener("touchend", preventDoubleTapZoom, { passive: false });
    window.addEventListener("touchmove", preventPinchZoom, { passive: false });
    window.addEventListener("touchmove", preventPullToRefresh, { passive: false });
  });

  /* ----------------------------------------------------
     ★ 実験前アンケートURL（管理番号で切替）
     ---------------------------------------------------- */
  let surveyUrl = "";

  $effect(() => {
    const num = Number(localStorage.getItem("managementNumber") ?? 1);
    const urls = {
      1: "https://forms.gle/7JHAw4mfboDtQ82y6",
      2: "https://forms.gle/Q6w6H1k7opTq3GVw6",
      3: "https://forms.gle/wbwpy4Sehg5uNy128",
      4: "https://forms.gle/Q6w6H1k7opTq3GVw6"
    };
    surveyUrl = urls[num];
  });

  function goNext() {
    window.location.href = "/setting";
  }
</script>

<svelte:head>
  <title>実験説明</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no" />
</svelte:head>

<div class="exp-page">
  <img src={bgImage} alt="" class="background-image" />

  <div class="exp-box">
    <h2>実験の説明</h2>

    <p class="desc">
      この実験では、<strong>ブラウザ上で動く 6×6 オセロ対戦ゲーム</strong>をプレイしていただきます。<br>
      対戦前に表示されるプロフィール情報が、<strong>対戦の楽しさ・集中しやすさ・継続意欲</strong>にどのような影響を与えるかを調べる研究です。
    </p>

    <h3>実験の流れ</h3>
    <ul class="flow">
      <li>① 実験前アンケートに回答</li>
      <li>② プロフィール設定（名前・コメント・画像）</li>
      <li>③ 対戦相手のプロフィール表示</li>
      <li>④ オセロ対戦（複数回）</li>
      <li>⑤ 対戦後アンケート</li>
    </ul>

    <h3>注意事項</h3>
    <ul class="notes">
      <li>勝敗は実験の目的ではありません。感じたまま回答してください。</li>
      <li>途中で中断したくなった場合はいつでも終了できます。</li>
      <li>スマホでの操作に最適化されています。</li>
    </ul>

    <a href={surveyUrl} class="survey-btn" target="_blank" rel="noopener noreferrer">
      実験前アンケートに回答する
    </a>

    <button class="next-btn" on:click={goNext}>
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
    background: #000;
  }

  .exp-page {
    width: 100vw;
    height: 100vh;
    position: relative;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .background-image {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none;
    z-index: 0;
  }

  .exp-box {
    position: relative;
    z-index: 1;
    width: 90%;
    max-width: 420px;
    background: rgba(0,0,0,0.55);
    padding: 20px;
    border-radius: 12px;
    backdrop-filter: blur(6px);
    text-align: left;
  }

  h2 {
    text-align: center;
    margin-bottom: 12px;
  }

  .desc {
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 18px;
  }

  h3 {
    margin-top: 14px;
    margin-bottom: 6px;
    font-size: 16px;
  }

  .flow, .notes {
    font-size: 14px;
    line-height: 1.5;
    padding-left: 18px;
  }

  .survey-btn {
    display: block;
    margin: 20px auto 10px;
    padding: 12px;
    width: 100%;
    background: #4af;
    color: #000;
    text-align: center;
    border-radius: 10px;
    text-decoration: none;
    font-size: 18px;
  }

  .next-btn {
    width: 100%;
    padding: 12px;
    background: #aaa;
    color: #000;
    border-radius: 10px;
    font-size: 18px;
    border: none;
    margin-top: 10px;
  }
</style>
