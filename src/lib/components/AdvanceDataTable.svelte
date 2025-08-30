<script lang="ts">
	import {
		Button,
		ButtonGroup,
		Heading,
		Label,
		Modal,
		Pagination,
		RadioButton,
		Select,
		Spinner,
		TabItem,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Tabs
	} from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import type { ColumnDefinition, SortOption } from './AdvanceDataTable';
	import { Listgroup, ListgroupItem, Tooltip } from 'flowbite-svelte';

	let {
		data,
		columnDefinitions,
		title,

		loading = $bindable(false),
		startRow = $bindable(0),
		currentPage = $bindable(0),

		onChangeViewSettings = (viewSettings: any) => {
			console.log($state.snapshot(viewSettings));
		},

		freezeSelectColumn = true,
		freezeRowActionsColumn = true,

		cellHoverHighlight = true,
		showRowActions = true,
		selectable = false,

		dataMapper = (row: any) => row,

		snippetTableActions,
		snippetRowActions,
		snippetBulkActions
	} = $props();

	let registeredCellSnippets = Object.fromEntries(
		columnDefinitions.map((c) => [c.targetField, c.snippet])
	);
	let tableContainer: HTMLDivElement;

	let selections = $state<number[]>([]);
	let pages = $state<{ name: string; active: boolean }[]>([]);

	let tableViewSettings = $state({
		columnDefinitions: structuredClone(
			columnDefinitions.map((e: any) => ({ ...e, snippet: undefined }))
		),
		sortOptions: {} as any
	});

	let originalTableViewSettings: any;
	let tempTableViewSettings = $state<any>({});

	let showSettingsModal = $state.raw(false);
	let count = $state.raw<number | undefined>(3);
	let groupingField = $state.raw<string | undefined>(undefined);
	let sortableInstance = $state.raw<string | undefined>(undefined);

	let mappedData = $derived(data.map(dataMapper));

	$effect(() => {
		if (data) selections = [];
	});

	$effect(() => {
		if (!showSettingsModal) sortableInstance = undefined;
	});

	$effect(() => {
		if (tempTableViewSettings.sortOptions) console.log(tempTableViewSettings.sortOptions);
	});

	function onTriggerLazyLoad() {}

	function onPreviousPage(e: Event) {
		if (currentPage > 0) {
			currentPage--;
		}
	}

	function onNextPage(e: Event) {
		if (currentPage < pages.length - 1) {
			currentPage++;
			e.preventDefault();
		}
	}

	function onChangePage(e: Event) {
		const targetPage = parseInt((e.target as HTMLButtonElement).innerText);
		currentPage = targetPage - 1;
	}

	// function onFirstPage() {

	// }

	// function onLastPage() {

	// }

	function onLazyLoad() {}

	function onToggleSelection(index: number) {
		return () => {
			if (selections.includes(index)) {
				selections = selections.filter((selection) => selection !== index);
			} else {
				selections = [...selections, index];
			}
		};
	}

	function onToggleSelectAll() {
		if (selections.length === data.length) {
			selections = [];
		} else {
			selections = data.map((_, index) => index);
		}
	}

	function onPersistSettings() {
		tableViewSettings = $state.snapshot(tempTableViewSettings);
		showSettingsModal = false;
		onChangeViewSettings(tableViewSettings);
	}

	function onChangeSortOption(field: string) {
		console.log('called', field, tableViewSettings.sortOptions[field]);
		const currentSortOption = tableViewSettings.sortOptions[field];
		if (currentSortOption && currentSortOption === 1) {
			tableViewSettings.sortOptions[field] = -1;
		} else if (currentSortOption && currentSortOption === -1) {
			delete tableViewSettings.sortOptions[field];
		} else {
			tableViewSettings.sortOptions[field] = 1;
		}

		onChangeViewSettings(tableViewSettings);
	}

	function onAddSortOption() {
		const field = columnDefinitions
			.filter((c: ColumnDefinition) => c.sortable)
			.find(
				(c: ColumnDefinition) =>
					!Object.keys(tempTableViewSettings.sortOptions).includes(c.targetField)
			)?.targetField;

		console.log(Object.keys(tempTableViewSettings.sortOptions), field);

		tempTableViewSettings.sortOptions[field] = 1;

		console.log(tempTableViewSettings.sortOptions);
	}

	function onResetSettingsToOriginalVersion() {
		tableViewSettings = originalTableViewSettings;
	}

	function onToggleColumnVisibility(field: string) {
		const column = tempTableViewSettings.columnDefinitions.find(
			(column) => column.targetField === field
		);
		if (column) {
			column.hidden = !column.hidden;
		}
	}

	function onChangeSortOptionItem(e: Event, currentSortDirection: 1 | -1, index: number) {
		const target = e.target as HTMLSelectElement;
		const field = target.value;

		// 1. convert sorts object to array
		const sortsArray = Object.entries(tempTableViewSettings.sortOptions).map(([field, sort]) => ({
			field,
			sort
		}));
		// 2. replace the current sort option with the new one
		sortsArray[index] = { field, sort: currentSortDirection };
		// 3. convert the array back to object
		const newSortsObject = Object.fromEntries(sortsArray.map(({ field, sort }) => [field, sort]));

		tempTableViewSettings.sortOptions = newSortsObject;
	}

	// ! BUG: after sorting, it makes the table cell snippets not working
	// maybe snippet cannot be treated as valid element in JS obj
	function onOpenSettingModal() {
		showSettingsModal = true;
		tempTableViewSettings = $state.snapshot(tableViewSettings);
	}

	// TODO: hold shift to select with range

	onMount(async () => {
		// loading = true;
		originalTableViewSettings = $state.snapshot(tableViewSettings);

		setInterval(() => {
			if (!showSettingsModal) return;

			const columnDefinitionDragTable = document.getElementById('dragtable-column-definitions');

			if (!columnDefinitionDragTable) {
				sortableInstance = false;
			}

			if (columnDefinitionDragTable && sortableInstance !== 'column-definitions') {
				const e = window.Sortable.create(columnDefinitionDragTable, {
					swap: true,
					animation: 150,
					handle: '.draggable',
					ghostClass: 'sortable-ghost',
					swapClass: 'sortable-swap-highlight',
					onUpdate: ({ newIndex, oldIndex }) => {
						const e = columnDefinitions[newIndex];
						columnDefinitions[newIndex] = columnDefinitions[oldIndex];
						columnDefinitions[oldIndex] = e;
						console.log(columnDefinitions.map((c) => c.targetField));
					}
				});
				console.log('Drag table initialized: column definitions');
				sortableInstance = 'column-definitions';
				return;
			}

			const sortOptionDragTable = document.getElementById('dragtable-sort-options');

			if (!sortOptionDragTable) {
				sortableInstance = false;
				return;
			}

			if (sortOptionDragTable && sortableInstance !== 'sort-options') {
				const e = window.Sortable.create(sortOptionDragTable, {
					swap: true,
					animation: 150,
					handle: '.draggable',
					ghostClass: 'sortable-ghost',
					swapClass: 'sortable-swap-highlight',
					onUpdate: ({ newIndex, oldIndex }) => {
						const sortOptions = Object.entries(tempTableViewSettings.sortOptions);
						const t = sortOptions[newIndex];
						sortOptions[newIndex] = sortOptions[oldIndex];
						sortOptions[oldIndex] = t;
						tempTableViewSettings.sortOptions = Object.fromEntries(sortOptions);
					}
				});
				console.log('Drag table initialized: sort options');
				sortableInstance = 'sort-options';
			}
		}, 500);

		// const rowActionsHeader = document.querySelector('table-head-cell[role="row-actions-header"]');
		// const rowActions = document.querySelector('table-body-cell[role="row-actions"]');

		// if (rowActionsHeader && rowActions) {
		// 	rowActionsHeader.style.minWidth = rowActions.clientWidth + 'px';
		// 	console.log('set width', rowActions.clientWidth)
		// }
	});
</script>

<!-- * SECTION: Table container -->
<div class="relative" bind:this={tableContainer}>
	{#if loading}
		<div class="absolute top-0 left-0 z-[500] flex min-h-full! min-w-full! bg-gray-300/50">
			<div
				class="border-primary-300 absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 bg-white p-4 shadow-xl {tableContainer?.clientHeight >
				600
					? 'top-[150px]'
					: 'top-1/2'}"
			>
				<div class="m-4 my-2 flex flex-row items-center gap-8">
					<Spinner />
					<span>Retrieving data ...</span>
				</div>
			</div>
		</div>
	{/if}

	<!-- * SECTION: Table info -->
	<div class="mb-3 flex w-full flex-row items-center justify-between">
		<div>
			<Heading tag="h5">
				{title} <span class="ml-0.25">({data.length ?? 0})</span>
			</Heading>
		</div>
		<div class="flex flex-row gap-2">
			{#if snippetBulkActions && selections.length > 0}
				<div class="border-r border-gray-200 pr-2">
					{@render snippetBulkActions(selections)}
				</div>
			{/if}
			<div class="">
				{#if snippetTableActions}
					{@render snippetTableActions()}
				{/if}
			</div>
			<Button size="xs" color="alternative" title="Table settings" onclick={onOpenSettingModal}>
				<i class="bi bi-sliders"></i>
			</Button>
		</div>
	</div>

	<!-- * SECTION: Table body -->
	<div class="flex w-full! flex-row">
		<Table
			hoverable={true}
			class="w-full! max-w-full overflow-x-auto"
			divClass="relative overflow-x-auto w-full!"
		>
			<TableHead
				class="top-0 border-b-2 border-gray-300 bg-gray-100"
				style="position: sticky; top: 0;"
			>
				<!-- * TABLE HEAD: selectable column -->
				{#if selectable}
					<TableHeadCell
						class="sticky top-0 mx-0! w-fit! border-r border-gray-300 bg-gray-100 px-1! text-center"
						style="position: sticky; left: 0;"
					>
						<input
							type="checkbox"
							title="Select all"
							style="zoom: 1.25;"
							onclick={() => onToggleSelectAll()}
							checked={selections.length === data.length}
						/>
					</TableHeadCell>
				{/if}

				<!-- * TABLE HEAD: data item's fields -->
				{#each columnDefinitions as column, index}
					{#if !column.hidden}
						<TableHeadCell class="sticky top-0 border-r border-gray-300 pr-3!">
							<div class="flex flex-row items-center justify-between">
								<div class="text-nowrap">
									{#if column.biIcon}
										<i class="bi {column.biIcon} mr-1"></i>
									{/if}
									{column.label}
								</div>
								{#if column.sortable}
									{#key tableViewSettings.sortOptions}
										{@const currentSortDirection =
											tableViewSettings.sortOptions[column.targetField]}
										<div class="flex flex-row gap-2">
											<button
												class="rounded-md px-2 py-1"
												onclick={() => onChangeSortOption(column.targetField)}
												title={currentSortDirection === 1
													? 'Click to sort descending'
													: currentSortDirection === -1
														? 'Click to disable sort'
														: 'Click to sort ascending'}
												aria-label="Apply sort on: {column.targetField}"
											>
												<i
													class="bi {currentSortDirection === 1
														? 'bi-chevron-down'
														: currentSortDirection === -1
															? 'bi-chevron-up'
															: 'bi-chevron-expand'}"
												></i>
											</button>
										</div>
									{/key}
								{/if}
							</div>
						</TableHeadCell>
					{/if}
				{/each}

				<!-- * TABLE HEAD: row actions -->
				{#if showRowActions}
					<TableHeadCell
						class="bg-gray-100 p-0"
						role="row-actions-header"
						style="position: sticky; right: 0;"
					>
						<div class="border-l border-gray-300 p-2 py-6">
							<span class="sr-only"></span>
						</div>
					</TableHeadCell>
				{/if}
			</TableHead>

			<TableBody tableBodyClass="table-auto!">
				{#each data as item, i}
					<TableBodyRow
						class="hover:bg-primary-100! py-2! {selections.includes(i)
							? 'bg-primary-100 border-primary-500 border-b-2'
							: 'border-gray-300!'}"
					>
						<!-- * TABLE CELLS: selectable column -->
						{#if selectable}
							<TableBodyCell
								class="hover:bg-primary-200! mx-0! border-r border-b! border-gray-300 bg-white px-1! py-2! text-center {
									selections.includes(i) ? 'border-primary-500! bg-primary-100!' : ''}"
								style="position: sticky; left: 0;"
							>
								<input
									type="checkbox"
									style="zoom: 1.25;"
									checked={selections.includes(i)}
									onchange={onToggleSelection(i)}
								/>
							</TableBodyCell>
						{/if}

						<!-- * TABLE CELLS: data item's fields  -->
						{#each columnDefinitions as column}
							{#if !column.hidden}
								<TableBodyCell class="{cellHoverHighlight ? 'hover:bg-primary-200!' : ''} py-2!">
									{#if column.snippet}
										{@render column.snippet(item)}
									{:else}
										{(column.dataMapper
											? column.dataMapper(item[column.targetField])
											: item[column.targetField]) ?? ''}
									{/if}
								</TableBodyCell>
							{/if}
						{/each}

						<!-- * TABLE CELLS: row actions -->
						{#if showRowActions && snippetRowActions}
							<TableBodyCell
								class="hover:bg-primary-200! bg-white p-0! {selections.includes(i)
									? 'bg-primary-100 border-primary-500 border-b-2'
									: 'border-gray-300!'}"
								role="row-actions"
								style="position: sticky; right: 0;"
							>
								<div class="border-l border-gray-300 p-2 text-right">
									{@render snippetRowActions(item)}
								</div>
							</TableBodyCell>
						{/if}
					</TableBodyRow>
				{:else}
					<TableBodyRow>
						<TableBodyCell colspan={columnDefinitions.length + 2} class="text-center bg-gray-100">
							No data entry
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
	</div>

	<!-- * SECTION: Table footer & pagination -->
	<div class="flex w-full flex-row items-center justify-between">
		<div>
			{#if selections.length}
				<div class="pt-4">
					<strong>Selected: </strong>
					{selections.length}
				</div>
			{/if}
		</div>
		<div>
			{#if pages.length > 1}
				<Pagination
					{pages}
					activeClass="bg-primary-100 text-primary-700 font-bold"
					on:previous={onPreviousPage}
					on:next={onNextPage}
					on:click={onChangePage}
				>
					<svelte:fragment slot="prev">
						<i class="bi bi-chevron-left"></i>
					</svelte:fragment>
					<svelte:fragment slot="next">
						<i class="bi bi-chevron-right"></i>
					</svelte:fragment>
				</Pagination>
			{/if}
		</div>
	</div>
</div>

<!-- * SECTION: Table Settings modal -->
<Modal
	bind:open={showSettingsModal}
	outsideclose
	bodyClass="p-0! m-0! overflow-y-auto overscroll-contain"
>
	<div class="min-h-[50vh] w-full">
		<Heading tag="h5" class="p-4 pb-2">Table Settings</Heading>

		<Tabs tabStyle="underline" contentClass="bg-white! m-0! p-4!">
			<!-- * TAB: Table columns -->
			<TabItem open title="Table columns">
				<Table>
					<TableHead>
						<TableHeadCell class="m-0! max-w-10 p-0! pl-4! text-center">
							<i class="bi bi-eye"></i>
						</TableHeadCell>
						<TableHeadCell>Column</TableHeadCell>
						<TableHeadCell class="w-full">Target Field</TableHeadCell>
						<TableHeadCell class="m-0! p-0!"></TableHeadCell>
					</TableHead>
					<TableBody id="dragtable-column-definitions">
						{#each tempTableViewSettings.columnDefinitions as column}
							<TableBodyRow
								class="hover:bg-primary-100! draggable"
								data-target-field={column.targetField}
							>
								<TableBodyCell class="m-0! max-w-10 p-0! pl-4! text-center">
									<input
										type="checkbox"
										style="zoom: 1.15;"
										checked={!column.hidden}
										onchange={() => onToggleColumnVisibility(column.targetField)}
									/>
								</TableBodyCell>
								<TableBodyCell>{column.label}</TableBodyCell>
								<TableBodyCell class="w-full"><code>{column.targetField}</code></TableBodyCell>
								<TableBodyCell class="m-0! flex flex-row py-4! pr-4!">
									<!-- move top -->
									{#if tempTableViewSettings.columnDefinitions.length > 2}
										<button class="rounded-md px-2 py-1">
											<i class="bi bi-chevron-double-up"></i>
										</button>
									{/if}
									<!-- move up -->
									{#if tempTableViewSettings.columnDefinitions.length > 1}
										<button class="rounded-md px-2 py-1">
											<i class="bi bi-chevron-up"></i>
										</button>
										<!-- move down -->
										<button class="rounded-md px-2 py-1">
											<i class="bi bi-chevron-down"></i>
										</button>
									{/if}
									<!-- move bottom -->
									{#if tempTableViewSettings.columnDefinitions.length > 2}
										<button class="rounded-md px-2 py-1">
											<i class="bi bi-chevron-double-down"></i>
										</button>
									{/if}
								</TableBodyCell>
							</TableBodyRow>
						{/each}
					</TableBody>
				</Table>
			</TabItem>

			<!-- * TAB: Group by -->
			<TabItem
				title="Group by"
				disabled={columnDefinitions.filter((c: ColumnDefinition) => c.groupable).length === 0}
			>
				<div class="p-4">
					<Label>
						Group rows by column:
						<Select
							class="mt-2"
							items={[
								{ name: 'No grouping', value: undefined },
								...columnDefinitions
									.filter((c: ColumnDefinition) => c.groupable)
									.map((c: ColumnDefinition) => ({ name: c.label, value: c.targetField }))
							]}
							bind:value={groupingField}
							placeholder={undefined}
						/>
					</Label>
				</div>
			</TabItem>

			<!-- * TAB: Sort options -->
			<TabItem title="Sorts">
				<Table>
					<TableHead>
						<TableHeadCell class="no-wrap">Column</TableHeadCell>
						<TableHeadCell class="w-full">Direction</TableHeadCell>
						<TableHeadCell class="m-0! p-0!"></TableHeadCell>
					</TableHead>
					<TableBody id="dragtable-sort-options">
						<!-- {#key tempTableViewSettings.sortOptions} -->
							{#each Object.entries(tempTableViewSettings.sortOptions) as [field, sort], index}
								<TableBodyRow class="hover:bg-primary-100! draggable" data-target-field={field}>
									<TableBodyCell class="no-wrap">
										<Select
											onchange={(e) => onChangeSortOptionItem(e, sort, index)}
											class="mt-2 w-fit! min-w-[200px]"
											items={[
												// contains: current field and selectable fields
												...columnDefinitions
													.filter((c: ColumnDefinition) => c.targetField === field)
													.map((c: ColumnDefinition) => ({ name: c.label, value: c.targetField })),
												...columnDefinitions
													.filter((c: ColumnDefinition) => c.sortable)
													.filter(
														(c: ColumnDefinition) =>
															!Object.keys(tempTableViewSettings.sortOptions).includes(
																c.targetField
															)
													)
													.map((c: ColumnDefinition) => ({ name: c.label, value: c.targetField }))
											]}
											value={field}
										/>
									</TableBodyCell>
									<TableBodyCell class="w-full">
										<Listgroup horizontal active>
											<ListgroupItem
												current={tempTableViewSettings.sortOptions[field] === 1}
												onclick={() => (tempTableViewSettings.sortOptions[field] = 1)}
											>
												<i class="bi bi-sort-alpha-down" style="zoom: 1.35;"></i>
											</ListgroupItem>
											<ListgroupItem
												current={tempTableViewSettings.sortOptions[field] === -1}
												onclick={() => (tempTableViewSettings.sortOptions[field] = -1)}
											>
												<i class="bi bi-sort-alpha-down-alt" style="zoom: 1.35;"></i>
											</ListgroupItem>
										</Listgroup>
									</TableBodyCell>
									<TableBodyCell class="m-0! flex flex-row py-4! pr-4!">
										<!-- move top -->
										{#if tempTableViewSettings.sortOptions.length > 2}
											<button class="rounded-md px-2 py-1">
												<i class="bi bi-chevron-double-up"></i>
											</button>
										{/if}
										<!-- move up -->
										{#if tempTableViewSettings.sortOptions.length > 1}
											<button class="rounded-md px-2 py-1">
												<i class="bi bi-chevron-up"></i>
											</button>
											<!-- move down -->
											<button class="rounded-md px-2 py-1">
												<i class="bi bi-chevron-down"></i>
											</button>
										{/if}
										<!-- move bottom -->
										{#if tempTableViewSettings.sortOptions.length > 2}
											<button class="rounded-md px-2 py-1">
												<i class="bi bi-chevron-double-down"></i>
											</button>
										{/if}
										<button
											class="rounded-md px-2 py-1"
											aria-label="Remove sort option"
											onclick={() => delete tempTableViewSettings.sortOptions[field]}
										>
											<i class="bi bi-x" style="zoom: 1.25;"></i>
										</button>
									</TableBodyCell>
								</TableBodyRow>
							{/each}
						<!-- {/key} -->
					</TableBody>
				</Table>
				<div class="my-2 w-full">
					{#if Object.keys(tempTableViewSettings.sortOptions).length < columnDefinitions.filter((c: ColumnDefinition) => c.sortable).length}
						<Button color="alternative" size="sm" class="w-full" onclick={onAddSortOption}>
							Add sort
						</Button>
					{/if}
				</div>
			</TabItem>
		</Tabs>
	</div>

	{#snippet footer()}
		<div class="flex w-full flex-row items-center justify-between">
			<Button
				color="alternative"
				onclick={() => onResetSettingsToOriginalVersion()}
				size="sm"
				class="no-wrap">Reset Original</Button
			>
			<div class="text-right">
				<Button color="alternative" size="sm" onclick={() => (showSettingsModal = false)}
					>Discard</Button
				>
				<Button onclick={() => onPersistSettings()} size="sm">Save Settings</Button>
			</div>
		</div>
	{/snippet}
</Modal>
