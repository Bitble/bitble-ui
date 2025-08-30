<script lang="ts">
	import { Card, Spinner } from "flowbite-svelte";

  let {
    figure,
    title,
    active = false,
    loading = false,
    subtitle = undefined,
    icon = undefined,
    onclick = undefined
  } = $props();

  const getTileClass = () => {
    const baseClass = 'h-32 w-52 p-2 shadow-lg! relative overflow-hidden! bg-white';
    return baseClass + (!onclick ? '' : 'cursor-pointer hover:outline-sky-500! outline-2 outline-transparent');
  }

</script>

<Card class='{getTileClass()} {loading || figure === undefined ? 'animate-pulse' : ''} {onclick && active ? 'outline-sky-300' : ''}' {onclick}>
  {#if icon}
    <div class="absolute bottom-[-22px] right-[-10px] opacity-50 z-0!">
      <div style="transform: rotate(-30deg);">
        <i class="bi {icon} text-sky-200!" style="zoom: 5;"></i>
      </div>
    </div>
  {/if}
  <div class="flex h-full w-full flex-col justify-between">
    {#if loading || figure === undefined}
      <Spinner size='10'/>
    {:else}
      <strong class="text-primary-500 text-4xl">{figure ?? '-'}</strong>
    {/if}
    <div>
      <p class="m-0" style="line-height: 1">{title ?? '-'}</p>
      {#if subtitle}
        <small class="text-gray-400">{subtitle}</small>
      {/if}
    </div>
  </div>
</Card>