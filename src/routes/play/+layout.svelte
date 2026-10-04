<script lang="ts">
  import { screen } from '$lib/gameState';
  import { goto } from '$app/navigation';

  // 結果画面に入ったら resultinfo に遷移
  $effect(() => {
    if ($screen === 'result') {
      goto('/resultinfo');
    }
  });
</script>

<slot />

<style>
  /* 必要最低限だけ残す（画面切り替えはしない） */
  :global(body) {
    margin: 0;
    padding: 0;
    background: #000;
  }
</style>
