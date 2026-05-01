<script lang="ts">
  type Photo = { src: string; alt: string; title: string };

  let { photos }: { photos: Photo[] } = $props();
  let active = $state<number | null>(null);

  function open(i: number) { active = i; }
  function close() { active = null; }
</script>

<div class="grid">
  {#each photos as photo, i}
    <button class="tile" onclick={() => open(i)} aria-label={photo.title}>
      <img src={photo.src} alt={photo.alt} loading="lazy" />
      <span class="caption">{photo.title}</span>
    </button>
  {/each}
</div>

{#if active !== null}
  <div class="lightbox" role="dialog" onclick={close}>
    <img src={photos[active].src} alt={photos[active].alt} />
  </div>
{/if}

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.75rem;
  }
  .tile {
    all: unset;
    cursor: pointer;
    position: relative;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    border-radius: 4px;
    background: #111;
  }
  .tile img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 400ms ease;
  }
  .tile:hover img { transform: scale(1.04); }
  .caption {
    position: absolute;
    inset: auto 0 0 0;
    padding: 0.5rem 0.75rem;
    color: #fff;
    font-size: 0.85rem;
    background: linear-gradient(transparent, rgba(0,0,0,0.6));
  }
  .lightbox {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.92);
    display: grid;
    place-items: center;
    cursor: zoom-out;
    z-index: 10;
  }
  .lightbox img { max-width: 92vw; max-height: 92vh; }
</style>
