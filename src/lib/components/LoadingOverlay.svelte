
<!-- convert the code above to svelte 5 component use Flowbite Svelte -->
<script lang="ts">
	import { blur } from 'svelte/transition';
	import type { LoadingOverlayProps } from './LoadingOverlay';
	import { Accordion, AccordionItem, Button, Card, Heading, Kbd, Modal, Spinner } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	// This component is used to replace onMount if you want a overlay to make sure everything is loaded properly before showing the page and user can start interacting with it.

	let {
		isLoading = $bindable<boolean>(true),
		loadingMessage = $bindable<string>('Initializing and retrieving data. Please wait...'),
		error = $bindable<Error>(),
		runningPromise = async () => {},
	}: LoadingOverlayProps = $props();

	onMount(() => {
		try {
			runningPromise()?.then(_ => isLoading = false).catch(e => {error = e; console.warn(e)});
		} catch (e) {
			error = e as Error;
			console.warn(e);
		}
	});
</script>

{#if isLoading && !error}
<div
	class="fixed z-[1000] min-w-full! min-h-full! bg-gray-300/30"
	style="backdrop-filter: blur(5px)"
	out:blur={{duration: 250}}
>
	<div
		class="absolute w-fit gap-8 rounded-lg bg-white p-8 px-12 shadow-2xl! border border-gray-300"
		style="top: 45%; left: 40%; transform: translate(-50%, -50%);"
	>
		<div class="flex flex-row gap-8 items-center" >
			<Spinner size='10' />
			<p class='no-wrap!' style="white-space: nowrap;">{loadingMessage}</p>
		</div>


	</div>
</div>
{/if}

{#if error}
<div
	class="fixed z-[1000] min-w-full! min-h-full! bg-gray-300/30"
	style="backdrop-filter: blur(5px)"
	transition:blur={{duration: 250}}
>
	<div
		class="absolute w-fit"
		style="top: 45%; left: 40%; transform: translate(-50%, -50%);"
	>
		<Card padding='none' class='flex flex-col border-2 border-gray-300 shadow-2xl min-w-[500px]'>
			<!-- * SECTION: header -->
			<div class='p-4 border-b border-gray-300'>
				<Heading tag="h4" color='text-red-500'> <i class="bi bi-x-circle-fill mr-2"></i> Something was wrong</Heading>
			</div>
			<!-- * SECTION: content -->
			<div class='p-4'>
				<div class="mx-4 mb-6">
					<p class="mb-2">
						It seems like there was a problem during initialization and data retrieval process, please try reloading the page.
					</p>
					<p>If error still persist, please contact to our support team.</p>
				</div>
				<div class="w-full m-0">
					<Accordion>
						<AccordionItem paddingDefault='px-4 py-2' open>
							<div slot="header">
								<strong>Error Information</strong>
							</div>
							<div class='w-full! min-w-full! mt-2'>
								<code class="min-w-full! text-red-700 text-wrap text-sm"><strong>{error}</strong></code><br>
								<code class="min-w-full! text-red-700 text-wrap text-sm">{@html JSON.stringify(error, null, 2).replaceAll("\n", "<br>").replaceAll(" ", "&nbsp;")}</code>
							</div>
							<p class="mt-6">
								<small class="text-gray-500">Don't see this helpful? Please check the console output using <Kbd class="px-2 py-1.5">F12</Kbd></small>
							</p>
						</AccordionItem>
					</Accordion>
				</div>
			</div>
			<!-- * SECTION: footer -->
			<div class="p-4 border-t border-gray-300 text-right">
				<Button color='alternative' onclick={() => window.location.href = 'mailto:support@example.com'}>
					<i class="bi bi-headset mr-2"></i>
					Contact Support
				</Button>
				<Button color='red' onclick={() => window.location.reload()}>
					<i class="bi bi-arrow-clockwise mr-2"></i>
					Reload the page
				</Button>
			</div>
		</Card>
	</div>
</div>
{/if}

<style>
	.panel {
		min-width: 600px;
		width: 600px;
	}

	div#loading-panel>div {
		margin-bottom: 2.5rem;
	}
</style>