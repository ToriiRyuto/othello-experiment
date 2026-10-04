<script>
  import homeScene from './homescene.png';

  let managementNumber = $state(1);

  function selectManagementNumber(number) {
    managementNumber = Number(number);
    localStorage.setItem('managementNumber', String(number));
    console.log(`管理番号を ${number} に変更しました`);
  }
</script>

<svelte:head>
  <title>オセロAI対戦</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

<div class="home fade-in">
  <div class="screen">
    <img
      src={homeScene}
      alt="6×6 オセロ対戦ゲーム"
      class="background-image"
    />

    <!-- 管理番号ボタン 1〜4 -->
    <button
      class={`management-button management-1 ${managementNumber === 1 ? 'selected' : ''}`}
      onclick={() => selectManagementNumber(1)}
      aria-label="管理番号1"
    ></button>

    <button
      class={`management-button management-2 ${managementNumber === 2 ? 'selected' : ''}`}
      onclick={() => selectManagementNumber(2)}
      aria-label="管理番号2"
    ></button>

    <button
      class={`management-button management-3 ${managementNumber === 3 ? 'selected' : ''}`}
      onclick={() => selectManagementNumber(3)}
      aria-label="管理番号3"
    ></button>

    <button
      class={`management-button management-4 ${managementNumber === 4 ? 'selected' : ''}`}
      onclick={() => selectManagementNumber(4)}
      aria-label="管理番号4"
    ></button>

    <!-- 対戦開始ボタン -->
    <a
      href="/matching"
      class="start-button"
      aria-label="対戦開始"
    ></a>
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
  }

  :global(body) {
    background: #000;
  }

  .fade-in {
    animation: fadeIn 1.2s ease forwards;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .home {
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
  }

  .background-image {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: contain;
    user-select: none;
    pointer-events: none;
  }

  .management-button,
  .start-button {
    position: absolute;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    z-index: 10;
  }

  /* ★ 管理番号ボタン位置（微調整済み） */
  .management-1 {
    left: 17.6%;
    top: 77.1%;
    width: 16.9%;
    height: 6.5%;
  }

  .management-2 {
    left: 35.9%;
    top: 77.1%;
    width: 14.8%;
    height: 6.5%;
  }

  .management-3 {
    left: 52.1%;
    top: 77.1%;
    width: 14.4%;
    height: 6.5%;
  }

  .management-4 {
    left: 67.8%;
    top: 77.1%;
    width: 14.6%;
    height: 6.5%;
  }

  .management-button.selected {
    outline: 2px solid #f0c75e;
    outline-offset: -2px;
    border-radius: 8px;
    box-shadow:
      0 0 8px rgba(240, 199, 94, 0.9),
      0 0 18px rgba(240, 199, 94, 0.6);
    background: rgba(255, 255, 255, 0.05);
  }

  .management-button:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .start-button {
    left: 15.5%;
    top: 85.4%;
    width: 69%;
    height: 9.6%;
    border-radius: 30px;
  }

  .start-button:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .start-button:active {
    background: rgba(0, 0, 0, 0.12);
  }
</style>
