<script lang="ts">
  import bgImage from '../play/bgImage.png';

  let logString = $state('');
  let surveyUrl = $state("");

  // ★ ログ読み込み
  $effect(() => {
    if (typeof localStorage === "undefined") return;

    const saved = localStorage.getItem("moveLogs");
    const first = localStorage.getItem("firstPlayer");

    const myColor = first === "me" ? "B" : "W";

    if (saved) {
      const parsed = JSON.parse(saved);
      const colLetter = ["A","B","C","D","E","F"];

      const moves = parsed
        .map((l: any) => `${colLetter[l.x]}${l.y + 1}`)
        .join("");

      logString = `${myColor}|${moves}`;
    } else {
      logString = "";
    }

    // ★ アンケートURL
    const num = Number(localStorage.getItem("managementNumber") ?? 1);
    const surveyUrls = {
      1: "https://forms.gle/7JHAw4mfboDtQ82y6",
      2: "https://forms.gle/Q6w6H1k7opTq3GVw6",
      3: "https://forms.gle/wbwpy4Sehg5uNy128",
      4: "https://forms.gle/Q6w6H1k7opTq3GVw6"
    };
    surveyUrl = surveyUrls[num];
  });
</script>

<div class="resultnext-page">
  <img src={bgImage} alt="" class="background-image" />

  <div class="resultnext">

    <h2>対戦ログ</h2>
    <p>コピーしてアンケートに貼り付けてください</p>

    <div class="log-box" on:click={(e) => {
      const range = document.createRange();
      range.selectNodeContents(e.currentTarget);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }}>
      {logString}
    </div>

    <a href={surveyUrl} class="survey-link" target="_blank" rel="noopener noreferrer">
      アンケートに回答する
    </a>

    <h4>アンケートを終えたら下のボタンから<br>ホームに戻ってください</h4>

    <a href="/home" class="home-button">
      ホームに戻る
    </a>

  </div>
</div>

<style>
  .resultnext-page {
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

  .resultnext {
    position: relative;
    z-index: 1;
    padding: 20px;
    max-width: 420px;
    margin: 0 auto;
    text-align: center;
  }

  h2 {
    font-size: 26px;
    margin-bottom: 10px;
  }

  .log-box {
    margin-top: 10px;
    padding: 12px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 8px;
    font-size: 14px;
    word-break: break-all;
    cursor: pointer;
    user-select: text;
  }

  .survey-link {
    display: block;
    margin-top: 20px;
    padding: 12px;
    background: #4af;
    color: #000;
    text-align: center;
    border-radius: 10px;
    text-decoration: none;
    font-size: 18px;
  }
  
  .home-button {
    display: block;
    margin-top: 20px;
    padding: 12px;
    background: #aaa;
    color: #000;
    text-align: center;
    border-radius: 10px;
    text-decoration: none;
    font-size: 18px;
  }
</style>
