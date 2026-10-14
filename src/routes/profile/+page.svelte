<script lang="ts">
  /* ----------------------------------------------------
     ★ スマホ誤操作防止
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

  import { onMount } from 'svelte';
  onMount(() => {
    window.addEventListener("touchend", preventDoubleTapZoom, { passive: false });
    window.addEventListener("touchmove", preventPinchZoom, { passive: false });
    window.addEventListener("touchmove", preventPullToRefresh, { passive: false });
  });

  /* ----------------------------------------------------
     ★ matching ロジック
     ---------------------------------------------------- */

  import sprite from './profileImage.png';
  import bgImage from './bgImage.png';

  let managementNumber = $state(1);
  let username = $state("");
  let comment = $state("");
  let profileIndex = $state(0);

  let opponentName = "Haru";
  let opponentComment = "楽しく対戦しましょう！負けません！";
  let opponentIndex = 6;

  let firstPlayer = $state("me");

  let showOpponent = $state(false);
  let showMe = $state(false);

  const positions = [
    '0% 2%', '20% 2%', '40% 0.5%', '59.7% 2%', '80% 0.5%', '100% 2%',
    '0% 52%', '20% 53%', '40% 53%', '60% 53%', '80% 53%', '100% 53%',
    '1.75% 97.5%', '21% 99%', '40% 99%', '59.7% 99%', '79.5% 99%', '99% 99%'
  ];

  function preloadImage(src: string) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(true);
      img.onerror = () => reject(false);
    });
  }

  onMount(async () => {
    managementNumber = Number(localStorage.getItem('managementNumber') || 1);
    username = localStorage.getItem('username') || "";
    comment = localStorage.getItem('comment') || "";
    profileIndex = Number(localStorage.getItem('profileIndex') || 0);

    firstPlayer = localStorage.getItem("firstPlayer") || "me";

    if (managementNumber === 1) {
      window.location.href = "/play";
      return;
    }

    try {
      await Promise.all([
        preloadImage(sprite),
        preloadImage(bgImage)
      ]);

      setTimeout(() => { showOpponent = true; }, 200);
      setTimeout(() => { showMe = true; }, 600);

      setTimeout(() => {
        document.body.classList.add('fade-out');
        setTimeout(() => {
          window.location.href = '/play';
        }, 600);
      }, 3000);

    } catch (e) {
      window.location.href = "/play";
    }
  });

  const myBgColor = $derived(firstPlayer === "me" ? "#000" : "#fff");
  const opponentBgColor = $derived(firstPlayer === "opponent" ? "#000" : "#fff");
</script>

<div class="profile">
  <div class="screen">

    <img src={bgImage} alt="" class="background-image" />

    <!-- 相手プロフィール -->
    <div class={`card opponent ${showOpponent ? 'show' : ''}`}>

      {#if managementNumber === 4}
        <div class="item center-text">名前：{opponentName}</div>

        <div
          class="char-image center-img"
          style={`
            background-image: url(${sprite});
            background-position: ${positions[opponentIndex]};
            background-size: 600% 300%;
            background-color: ${opponentBgColor};
          `}
        ></div>

        <div class="item center-text">コメント：{opponentComment}</div>

      {:else if managementNumber === 2}
        <div class="item center-text">名前：{opponentName}</div>
        <div class="item center-text">コメント：{opponentComment}</div>

      {:else if managementNumber === 3}
        <div
          class="char-image center-img"
          style={`
            background-image: url(${sprite});
            background-position: ${positions[opponentIndex]};
            background-size: 600% 300%;
            background-color: ${opponentBgColor};
          `}
        ></div>
      {/if}

    </div>

    <!-- 自分プロフィール -->
    <div class={`card me ${showMe ? 'show' : ''}`}>

      {#if managementNumber === 4}
        <div class="item center-text">名前：{username}</div>

        <div
          class="char-image center-img"
          style={`
            background-image: url(${sprite});
            background-position: ${positions[profileIndex]};
            background-size: 600% 300%;
            background-color: ${myBgColor};
          `}
        ></div>

        <div class="item center-text">コメント：{comment}</div>

      {:else if managementNumber === 2}
        <div class="item center-text">名前：{username}</div>
        <div class="item center-text">コメント：{comment}</div>

      {:else if managementNumber === 3}
        <div
          class="char-image center-img"
          style={`
            background-image: url(${sprite});
            background-position: ${positions[profileIndex]};
            background-size: 600% 300%;
            background-color: ${myBgColor};
          `}
        ></div>
      {/if}

    </div>

  </div>
</div>

<style>
  :global(html),
  :global(body) {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
    background: #000;
  }

  :global(body.fade-out) {
    animation: fadeOut 0.6s forwards;
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  /* ★ 画面全体 */
  .profile {
    width: 100vw;
    height: 100svh;
    background: #000;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* ★ 画面比率を固定しつつレスポンシブ */
  .screen {
    position: relative;
    width: min(100vw, 66.6667svh);
    aspect-ratio: 2 / 3;
  }

  .background-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none;
  }

  /* ★ プロフィールカード（レスポンシブ） */
  .card {
    position: absolute;
    width: 80%;
    height: clamp(26%, 30svh, 34%);
    padding: clamp(12px, 3vw, 20px);
    border-radius: 14px;
    backdrop-filter: blur(6px);
    font-size: clamp(14px, 2.5vw, 32px);
    opacity: 0;
    transition: opacity 0.6s ease;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .opponent {
    top: 25%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 80, 80, 0.18);
    border: 1px solid rgba(255, 120, 120, 0.45);
    color: #ffdede;
    z-index: 1;
  }

  .me {
    bottom: 25%;
    left: 50%;
    transform: translate(-50%, 50%);
    background: rgba(80, 160, 255, 0.18);
    border: 1px solid rgba(120, 180, 255, 0.45);
    color: #e0ecff;
    z-index: 2;
  }

  .show {
    opacity: 1;
  }

  .item.center-text {
    font-size: clamp(14px, 2.5vw, 32px);
    margin: 6px 0;
  }

  /* ★ キャラ画像（完全レスポンシブ） */
  .char-image {
    height: clamp(90px, 18vw, 300px);
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    background-repeat: no-repeat;
    margin: clamp(8px, 2vw, 16px) 0;
  }

  .center-img {
    margin: 10px auto;
  }
</style>
