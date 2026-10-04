<script lang="ts">
  import sprite from './profileImage.png';
  import bgImage from './bgImage.png';

  let username = $state("");
  let comment = $state("");
  let selected = $state(0);

  const isValid = $derived(
    username.length > 0 &&
    username.length <= 10 &&
    comment.length > 0 &&
    comment.length <= 30
  );

  const positions = [
    '0% 2%', '20% 2%', '40% 0.5%', '59.7% 2%', '80% 0.5%', '100% 2%',
    '0% 52%', '20% 53%', '40% 53%', '60% 53%', '80% 53%', '100% 53%',
    '1.75% 97.5%', '21% 99%', '40% 99%', '59.7% 99%', '79.5% 99%', '99% 99%'
  ];

  const save = () => {
    if (!isValid) return;
    
    document.body.classList.add('fade-out');

    setTimeout(() => {
      localStorage.setItem('username', username);
      localStorage.setItem('comment', comment);
      localStorage.setItem('profileIndex', selected);
      window.location.href = '/home';
    }, 600);
  };
</script>

<div class="page">
  <div class="screen">
    <img src={bgImage} alt="" class="background-image" />

    <div class="form">
      <div class="label">ユーザー名（10文字以内）</div>
      <input
        class="input"
        bind:value={username}
        placeholder="ユーザー名"
      />

      <div class="label">一言コメント（30文字以内）</div>
      <input
        class="input"
        bind:value={comment}
        placeholder="オセロ初心者です。よろしくお願いします！"
      />

      <div class="label">プロフィール画像</div>

      <div class="slider">
        <div class="slider-inner">
          {#each positions as pos, i}
            <div
              class="item {selected === i ? 'selected' : ''}"
              on:click={() => (selected = i)}
              style={`
                background-image: url(${sprite});
                background-position: ${pos};
                background-size: ${i >= 12 ? '660% 330%' : '600% 300%'};
                background-color: ${
                  ((Math.floor(i / 6) + (i % 6)) % 2 === 0)
                    ? '#f5f5f5'
                    : '#0a0a0a'
                };
              `}
            ></div>
          {/each}
        </div>
      </div>

      <button
        class="save {isValid ? 'active' : ''}"
        disabled={!isValid}
        on:click={save}
      >
        保存してホームへ
      </button>
    </div>
  </div>
</div>

<style>
  /* ★ 背景を黒にして暗転フェードアウトを成立させる */
  :global(html) {
    background: #000;
  }

  /* ★ body.fade-out にフェードアウトを適用（global） */
  :global(body.fade-out) {
    animation: fadeOut 0.6s forwards;
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  .page {
    width: 100vw;
    height: 100svh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #000;
    overflow: hidden;
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
    pointer-events: none;
  }

  .form {
    position: absolute;
    top: 5%;
    left: 5%;
    width: 90%;
    height: 90%;
    display: flex;
    flex-direction: column;
    color: #fff;
  }

  .label {
    font-size: 14px;
    margin-top: 12px;
  }

  .input {
    width: 100%;
    padding: 8px;
    border-radius: 6px;
    border: none;
    font-size: 14px;
  }

  .slider {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 10px;
    margin-top: 12px;
    -webkit-overflow-scrolling: touch;
  }

  .slider-inner {
    display: grid;
    grid-template-columns: repeat(6, 80px);
    grid-template-rows: repeat(3, 80px);
    gap: 12px;
    width: max-content;
  }

  .item {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-repeat: no-repeat;
    cursor: pointer;
    box-sizing: border-box;
    border: 3px solid transparent;
  }

  .item.selected {
    border-color: #4af;
  }

  .save {
    margin-top: 20px;
    width: 100%;
    padding: 12px;
    font-size: 16px;
    border: none;
    border-radius: 8px;
    background: #555;
    color: #000;
    cursor: pointer;
  }

  .save.active {
    background: #4af;
    cursor: pointer;
  }
</style>
