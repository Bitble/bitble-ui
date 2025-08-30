<script lang="ts">
	import { P } from 'flowbite-svelte';
	import Toast from 'flowbite-svelte/Toast.svelte';
	import { sineInOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { getToastStore } from './stores/Toast';

	const toastStore = getToastStore();
	const toastClasses = 'min-w-[350px] m-2 w-full max-w-xs p-4 text-gray-500 shadow-md rounded-md border-2  dark:text-gray-400 dark:bg-gray-800 gap-3'

	let filteredToasts = $derived(Array.from($toastStore).slice(0, 5));
</script>

<div class="absolute" style="top: 0; right: 0; z-index: 1000 !important;">
	{#if filteredToasts.length > 0}
		{#each filteredToasts as t}
			<div in:fly={{easing: sineInOut, duration: 250, y: 50}} out:fly={{easing: sineInOut, duration: 500, x: -100}}>
				<Toast
					dismissable={true}
					color={t.color}
					transition={fly}
					params={{ x: 200 }}
					divClass='bg-white border-{t.color}-500 {toastClasses} min-w-[450px]!'
				>
					<i class="bi bi-check-circle-fill" slot="icon"></i>
					{#if t.title}
						 <P color='text-{t.color}-500' weight='bold'>{t.title}</P>
					{/if}
					<P>{t.message}</P>
					<!-- {#if t.action || !t.hideDismiss}
						<div class="toast-actions {cToastActions}">
							{#if t.action}<button class={buttonAction} on:click={() => onAction(i)}>{@html t.action.label}</button>{/if}
							{#if !t.hideDismiss}<button class={buttonDismiss} aria-label="Dismiss toast" on:click={() => toastStore.close(t.id)}
									>{buttonDismissLabel}</button
								>{/if}
						</div>
					{/if} -->
				</Toast>
			</div>
		{/each}
	{/if}
</div>

