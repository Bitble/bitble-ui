<!--
@component

-->

<script lang="ts">
	import { Heading } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	let {
		pageTitle,
		pageSubtitle,
		tabsDefinition = [],
		children,
		snippetBreadcrumb,
		snippetPageActions,
		snippetCollapsedHeaderContent,
		snippetHeaderContent,
		snippetPageFooter,
		snippetPageTabs,
		..._props
	}: any = $props();

	let pageRoot: HTMLDivElement;
	let headerElement: HTMLDivElement;
	let pageBodyContainer: HTMLDivElement;

	let currentTabId = $state.raw(0);
	let maxHeightPageContentWrapper = $state.raw(700);
	let displayScrollBar = $state.raw(false);
	let shouldHideHeaderContentByScroll = $state.raw(false);
	let displayHeaderContentForcedStatus = $state.raw<'show' | 'hide' | undefined>(undefined);

	$effect(() => { switchTab(currentTabId) });

	export function decideToDisplayScrollBar() {
		maxHeightPageContentWrapper =
			window.innerHeight - (headerElement.getBoundingClientRect().y + headerElement.clientHeight);
		displayScrollBar = pageBodyContainer.scrollHeight > pageBodyContainer.clientHeight;
	}

	function switchTab(targetTabId: number) {
		if (!tabsDefinition.length) return;

		const tabElements = [...pageBodyContainer.querySelectorAll(`.tab-container`)];

		tabElements.forEach((tabElement) => {(tabElement as HTMLElement).hidden = true});
		(tabElements[targetTabId] as HTMLElement).hidden = false;
	}

	function styleTabSelector(id: number) {
		if (id === currentTabId) {
			return 'font-bold text-primary-700 border-b-4 border-primary-500 p-1 px-6';
		}

		return 'hover:text-primary-700 hover:cursor-pointer hover:underline rounded p-1 px-6';
	}

	function onScrollPageBody() {
		if (displayHeaderContentForcedStatus) return;

		if (pageBodyContainer.scrollTop > 10) {
			shouldHideHeaderContentByScroll = true;
			if (pageBodyContainer.scrollTop <= 100) {
				setTimeout(() => decideToDisplayScrollBar(), 10);
			}
		} else {
			shouldHideHeaderContentByScroll = false;
			decideToDisplayScrollBar();
		}
	}

	function onForceDisplayHeaderContent() {
		if (!displayHeaderContentForcedStatus) {
			displayHeaderContentForcedStatus = shouldHideHeaderContentByScroll ? 'show' : 'hide';
		} else {
			displayHeaderContentForcedStatus =
				displayHeaderContentForcedStatus === 'show' ? 'hide' : 'show';
		}
		setTimeout(() => decideToDisplayScrollBar(), 10);
	}

	function onTogglePinHeaderDisplay() {
		if (displayHeaderContentForcedStatus) {
			displayHeaderContentForcedStatus = undefined;
		} else {
			displayHeaderContentForcedStatus = shouldHideHeaderContentByScroll ? 'hide' : 'show';
		}
	}

	onMount(() => { decideToDisplayScrollBar() });
</script>

<div class="w-full" id="page-root" bind:this={pageRoot}>
	<!-- * SECTION: Header -->
	<div class="border-primary-500 relative w-full border-b bg-white shadow-md transition-all transition-discrete duration-500" bind:this={headerElement}>
		<div class="px-8 py-4">
			<!-- * SECTION: Heading and page actions -->
			<div class="flex w-full flex-row justify-between">
				<div class="flex flex-col gap-2">
					<div>
						<!-- * SLOT: breadcrumb (optional) -->
						 {#if snippetBreadcrumb}
							 {@render snippetBreadcrumb()}
						 {/if}
					</div>
					<div>
						<Heading tag="h1" class="text-primary-700 text-4xl">{pageTitle}</Heading>
						<p class='mt-1'>{pageSubtitle}</p>
					</div>
				</div>

				<div class="flex flex-col justify-start gap-4 pt-2">
					<div class="flex flex-row gap-2">
						<!-- * SLOT: page actions (optional) -->
						{#if snippetPageActions}
							{@render snippetPageActions(
									displayHeaderContentForcedStatus === 'hide' || shouldHideHeaderContentByScroll
							)}
						{/if}
					</div>
				</div>
			</div>

			<!-- * SLOT: collapsedHeaderContent (optional) -->
			{#if displayHeaderContentForcedStatus === 'hide' || shouldHideHeaderContentByScroll}
				{#if snippetCollapsedHeaderContent}
					{@render snippetCollapsedHeaderContent()}
				{/if}
			{/if}

			<!-- * SECTION: header content -->
			<div
				class="flex w-full flex-col gap-8 pt-8 pb-0"
				hidden={displayHeaderContentForcedStatus === 'hide' ||
					(displayHeaderContentForcedStatus !== 'show' && shouldHideHeaderContentByScroll)}
			>
				<!-- * SLOT: headerContent (optional) -->
				{@render snippetHeaderContent()}
			</div>
		</div>

		<!-- * SECTION: in-header tabs -->
		{#key tabsDefinition}
			{#if tabsDefinition.length > 0}
			<div class="border-primary-500 bg-primary-100 w-full border-t p-2 px-8 pb-0">
				<div class="flex flex-row items-baseline">
					{#key currentTabId}
						{#each tabsDefinition as tab, index}
							<button
								class={styleTabSelector(index)}
								onclick={() => {
									if (currentTabId != index) {
										currentTabId = index;
									}
								}}>{tab.title}</button
							>
						{/each}
					{/key}
				</div>
			</div>
			{/if}
		{/key}

		<!-- * SECTION: header bottom buttons (toggle collapsed & pin) -->
		<div class="absolute z-10" style="transform: translate(50%, 50%); bottom: 0; right: 50%">
			<button
				class="border-primary-500 hover:bg-primary-200 rounded border bg-white px-1 shadow-md transition-all duration-150"
				onclick={onForceDisplayHeaderContent}
			>
				{#if displayHeaderContentForcedStatus === 'show' || !shouldHideHeaderContentByScroll}
					<i class="bi bi-chevron-up"></i>
				{:else}
					<i class="bi bi-chevron-down"></i>
				{/if}
			</button>
			<button class="border-primary-500 hover:bg-primary-200 rounded border bg-white px-1 shadow-md transition-all duration-150" onclick={onTogglePinHeaderDisplay}>
				{#if displayHeaderContentForcedStatus}
					<i class="bi bi-pin-fill text-red-700"></i>
				{:else}
					<i class="bi bi-pin"></i>
				{/if}
			</button>
		</div>
	</div>

	<!-- * SECTION: Page Body -->
	<div
		bind:this={pageBodyContainer}
		class="z-[-100]! m-0 h-full w-full overflow-y-auto p-4"
		style="max-height: {maxHeightPageContentWrapper}px !important;"
		onscroll={onScrollPageBody}
	>
		<div class="relative h-full w-full rounded-md bg-white p-4">{@render children()}</div>
	</div>
</div>
