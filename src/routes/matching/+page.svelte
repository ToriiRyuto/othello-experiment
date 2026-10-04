<script lang="ts">
  /* ----------------------------------------------------
     ★ スマホ誤操作防止（ズーム・スクロール・リロード防止）
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
     ★ ここから元の matching ロジック
     ---------------------------------------------------- */

  import { onMount as onMount2 } from 'svelte';
  import bgImage from './bgImage.png';

  let managementNumber = $state(1);

  onMount2(() => {
    const stored = localStorage.getItem('managementNumber');
    if (stored !== null && stored !== '') {
      managementNumber = Number(stored);
    } else {
      managementNumber = 1;
    }

    const wait = 5000 + Math.random() * 10000;
    console.log(`マッチング中... ${wait}ms 後に遷移します`);

    const timer = setTimeout(() => {
      document.body.classList.add('fade-out');

      setTimeout(() => {
        window.location.href = '/profile';
      }, 600);
    }, wait);

    return () => clearTimeout(timer);
  });
</script>

<svelte:head>
  <title>マッチング中</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no" />
</svelte:head>

<div
  class="matching"
  style={`background-image: url(${bgImage}); background-size: contain; background-repeat: no-repeat; background-position: center;`}
>
  <div class="screen">
    <div class="management">
      管理番号：{managementNumber}
    </div>

    <div class="title">
      対戦相手を探しています
    </div>

    <div class="loader">
      {#each Array(8) as _, i (i)}
        <div class="dot dot-{i + 1}">
          <div class="disc">
            <div class="front"></div>
            <div class="back"></div>
          </div>
        </div>
      {/each}
    </div>

    <div class="message">
      マッチング中...
    </div>
  </div>
</div>

<style>
  /* ★ スマホ誤操作防止 */
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
  }

  /* ★ フェードアウトアニメーション */
  :global(.fade-out) {
    animation: fadeOut 0.6s forwards;
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  .matching {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .screen {
    position: relative;
    width: min(100vw, 66.6667vh);
    height: min(100vh, 150vw);
    aspect-ratio: 2 / 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }

  .management {
    position: absolute;
    top: 15%;
    font-size: 14px;
    color: #ccc;
  }

  .title {
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    text-align: center;
    white-space: nowrap;
  }

  .loader {
    position: relative;
    width: 28%;
    aspect-ratio: 1;
    margin-top: 12%;
  }

  .dot {
    position: absolute;
    width: 14%;
    height: 14%;
    left: 43%;
    top: 43%;
  }

  .dot-1 { transform: rotate(0deg) translateY(-310%); }
  .dot-2 { transform: rotate(45deg) translateY(-310%); }
  .dot-3 { transform: rotate(90deg) translateY(-310%); }
  .dot-4 { transform: rotate(135deg) translateY(-310%); }
  .dot-5 { transform: rotate(180deg) translateY(-310%); }
  .dot-6 { transform: rotate(225deg) translateY(-310%); }
  .dot-7 { transform: rotate(270deg) translateY(-310%); }
  .dot-8 { transform: rotate(315deg) translateY(-310%); }

  .disc {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    animation: flip16 16s ease-in-out infinite;
  }

  .front,
  .back {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    backface-visibility: hidden;
  }

  .front {
    background: #111;
  }

  .back {
    background: #fff;
    border: 2px solid #111;
    transform: rotateY(180deg);
  }

  .dot-1 .disc { animation-delay: 0s; }
  .dot-2 .disc { animation-delay: 0.3s; }
  .dot-3 .disc { animation-delay: 0.6s; }
  .dot-4 .disc { animation-delay: 0.9s; }
  .dot-5 .disc { animation-delay: 1.2s; }
  .dot-6 .disc { animation-delay: 1.5s; }
  .dot-7 .disc { animation-delay: 1.8s; }
  .dot-8 .disc { animation-delay: 2.1s; }

  @keyframes flip16 {
    0%  { transform: rotateY(0deg); }
    14% { transform: rotateY(180deg); }
    28% { transform: rotateY(360deg); }
    42% { transform: rotateY(540deg); }
    56% { transform: rotateY(720deg); }
    70% { transform: rotateY(900deg); }
    84% { transform: rotateY(1080deg); }
    96% { transform: rotateY(1260deg); }
  }

  .message {
    margin-top: 10%;
    font-size: 14px;
    color: #ccc;
  }
</style>
