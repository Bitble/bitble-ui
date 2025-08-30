<script lang="ts">
	import { CloseButton, DropdownGroup, DropdownHeader, search } from 'flowbite-svelte';
	import {
		Badge,
		Button,
		Checkbox,
		Dropdown,
		Heading,
		Helper,
		Input,
		Label,
		Search,
		Tooltip
	} from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import type { AdvanceMultiSelectProps, OptionItem } from './AdvanceMultiSelect';

	let {
		label,
		name,
		options,
		title,
		fieldMessage = $bindable(''),
		selections = $bindable([]),
		clearable = true,
		disabled = false,
		loading = false,
		readonly = false,
		required = false,
		hint = '',
		placeholder = '',
		popupOption = 'dropdown', // simple, dropdown, modal, advance modal
		initialSelectedValues = [],
		// validators = [],
		onchange,
		..._props
	}: AdvanceMultiSelectProps = $props();

	let componentRoot: HTMLDivElement;
	let badgeContainerElement: HTMLDivElement;
	let inputWrapperElement: HTMLDivElement;
	let leftDiv: HTMLDivElement;

	let showDropdown = $state.raw<boolean>(false);
	let showAdvanceOptions = $state.raw<boolean>(false);
	let isBadgeContainerOverflow = $state.raw<boolean>(false);
	let searchValue = $state.raw<string>('');
	let ghostText = $state.raw<string>('');

	let paddingLeft = $state.raw(10);
	let activeIndex = $state.raw(0);
	let maxWidthBadgeContainer = $state.raw(200);

	let selectedValues = $state<string[]>(initialSelectedValues);
	let selectedValuesInDropDown = $state<string[]>(initialSelectedValues);

	$effect(() => {
		selections = options.filter((option) => selectedValues.includes(option.value));
		isBadgeContainerOverflow = false;

		setTimeout(() => {
			console.log(`[LOG / AdvanceMultiSelect]\n${name}:`, badgeContainerElement?.scrollWidth, maxWidthBadgeContainer);
			isBadgeContainerOverflow = badgeContainerElement?.scrollWidth >= maxWidthBadgeContainer;
			selectedValuesInDropDown = selections.map((selection) => selection.value);
		}, 10);
		setTimeout(() => { paddingLeft = (!selectedValues.length) ? 10 : leftDiv?.clientWidth + 16; }, 20);
	});

	export function select(values: string[]) {
		selections = options.filter((option) => values.includes(option.value));
		selectedValuesInDropDown = values;
	}

	export function focus() {
		componentRoot?.querySelector(`#form_${name}`)?.focus();
	}

	function removeSelectedValue(removeValue: string) {
		if (disabled) return;
		selectedValues = selectedValues.filter((o) => o !== removeValue);
		selectedValuesInDropDown = [...selectedValues];
	}

	function onArrowDown(event: KeyboardEvent) {
		event.preventDefault();
		event.stopPropagation();
		if (document.activeElement?.type === `text` || document.activeElement?.type === `search` ) {
			componentRoot?.querySelector(`input[data-index='0']`)?.focus();
			componentRoot?.querySelector(`input[data-index='0']`)?.scrollIntoView({ behavior: 'smooth' });
		} else if (document.activeElement?.type === 'checkbox') {
			activeIndex = (activeIndex + 1) % options.length;
			componentRoot?.querySelector(`input[data-index='${activeIndex}']`)?.focus();
			componentRoot?.querySelector(`input[data-index='${activeIndex}']`)?.scrollIntoView({ behavior: 'smooth' });
		}
	}

	function onArrowUp() {
		activeIndex = activeIndex === 0 ? options.length - 1 : (activeIndex - 1) % options.length;
		componentRoot?.querySelector(`input[data-index='${activeIndex}']`).focus();
	}


	function onkeyup(event: KeyboardEvent) {
		if (!searchValue) {
			ghostText = '';
		}
		const elements = componentRoot.querySelectorAll(`input[type='checkbox']`);
		const itemValue = elements.item(0)?.dataset?.itemValue;
		if (itemValue && searchValue) {
			const substring: string = itemValue.substring(String(itemValue).toLocaleLowerCase().indexOf(searchValue.toLocaleLowerCase()), itemValue.length)
			ghostText = substring.slice(searchValue.length, substring.length).toLocaleLowerCase();
		} else {
			ghostText = '';
		}
	}

	function onkeydown(event: KeyboardEvent) {
		if (disabled) return;
		if (!searchValue) {
			ghostText = '';
		}
		if (!searchValue && event.code === 'Backspace' && selectedValues.length > 0) {
			removeSelectedValue(selectedValues[selectedValues.length - 1]);
			return;
		} else if (searchValue && (event.code === 'Enter' || event.key === 'ArrowRight')) {
			onkeydownSearch(event);
			return;
		}
		switch (event.key) {
			// case 'Tab':
				// onArrowDown(event);
				// break;
			// case "Enter":
			// case " ":
			// 	handleToggleActiveItem();
			// 	break;
			case 'ArrowDown': onArrowDown(event); break;
			// case 'ArrowUp':
			// 	handleArrowUpDown(-1);
			// 	break;
			// default:
			// 	return;
		}
	}

	function onkeydownSearch(event: KeyboardEvent) {
		if (searchValue && (event.code === 'Enter' || event.key === 'ArrowRight')) {
			ghostText = '';
			const elements = componentRoot.querySelectorAll(`input[type='checkbox']`);

			selectedValues = [...selectedValues, elements.item(0).dataset.itemValue];
			selectedValuesInDropDown = [...selectedValues];

			searchValue = '';
		}
	}

	function onNavigateFocusItem(event: KeyboardEvent) {
		if (disabled) return;
		switch (event.key) {
			case 'ArrowDown': onArrowDown(event); break;
			case 'ArrowUp': onArrowUp(); break;
		}
	}

	function onselect() {
		selectedValues = [...selectedValuesInDropDown];
		searchValue = '';
		setTimeout(() => { showDropdown = false; }, 10);
	}

	function onSelectAll() {
		selectedValuesInDropDown = options.map((item) => item.value);
	}

	function onSelectInvert() {
		selectedValuesInDropDown = options
			.filter((item) => !selectedValuesInDropDown.includes(item.value))
			.map((item) => item.value);
	}

	function isMatched(searchValue: string, option: OptionItem) {
		const loweredSearchValue = searchValue.toLowerCase();
		return (
			String(option.name).toLowerCase().includes(loweredSearchValue) ||
			String(option.value).toLowerCase().includes(loweredSearchValue) ||
			String(option.description).toLowerCase().includes(loweredSearchValue)
		);
	}

	function onchangeCheckbox(event: Event) {
		const checked = event?.currentTarget?.checked;
		const optionValue = event?.currentTarget?.dataset?.itemValue;

		if (!checked) {
			selectedValuesInDropDown = selectedValuesInDropDown.filter((item) => item !== optionValue);
		} else {
			selectedValuesInDropDown = [...selectedValuesInDropDown, optionValue];
		}

		if (popupOption === 'simple') selectedValues = [...selectedValuesInDropDown];
		focus();
	}

	onMount(async () => {
		maxWidthBadgeContainer = inputWrapperElement.clientWidth * 0.7;
	});
</script>

<div bind:this={componentRoot}>
	<Label class="static">
		<!-- * SECTION: Input -->
		<div class="flex w-full items-end justify-between px-1">
			<!-- * SECTION: Label -->
			<div class="mb-1">
				{#if label}
					<strong>
						{label}:
						{#if readonly}
							<i class="bi bi-eye"></i>
						{:else if required}
							<span class="text-red-500">*</span>
						{/if}
					</strong>
				{/if}
			</div>
			<!-- * SECTION: Hint  -->
			<div>
				{#if hint}
					<i id="form_hint_{name}" class="bi bi-question-circle text-primary-500 text-lg font-extrabold"></i>
					<Tooltip triggeredBy="#form_hint_{name}" trigger="hover">{hint}</Tooltip>
					<Tooltip triggeredBy="#form_hint_{name}" trigger="click">{hint}</Tooltip>
				{/if}
			</div>
		</div>

		<div class="input-wrapper relative" bind:this={inputWrapperElement}>
			<div id="ghost-text" class="absolute top-[11px] w-full h-full z-50 text-gray-500" style="left: {paddingLeft}px !important">
				<span class='opacity-0'>{searchValue + ''}</span>{ghostText}
			</div>
			<Input
				class="block w-full disabled:cursor-not-allowed disabled:opacity-50 rtl:text-right"
				style="padding-left: {paddingLeft}px"
				autocomplete="off"
				id="form_{name}"
				{required}
				{placeholder}
				{disabled}
				{..._props}
				onclick={() => { showDropdown = true; }}
				onfocus={() => { showDropdown = true; }}
				onfocusin={() => { showDropdown = true; }}
				{onkeydown}
				{onkeyup}
				tabindex={0}
				role="listbox"
				bind:value={searchValue}
			>
				<!-- * SECTION: selected items -->
				{#snippet left()}
					<div bind:this={leftDiv} class='overflow-hidden' style="max-width: {maxWidthBadgeContainer}px;">
						{#if isBadgeContainerOverflow}
							<span class="text-sm text-sky-600">{selections.length} selected</span>
						{/if}
						<div class="flex flex-row gap-2 text-nowrap" bind:this={badgeContainerElement} hidden={isBadgeContainerOverflow}>
							{#each selections as selectedItem}
								<Badge border>{selectedItem.name}</Badge>
							{/each}
						</div>
					</div>
				{/snippet}
	
				<!-- * SECTION: clear & toggle dropdown -->
				{#snippet right()}
					<div class="flex items-center">
						{#if clearable && selectedValues.length > 0}
							<CloseButton
								onclick={() => {
									selectedValues = [];
									selectedValuesInDropDown = [];
								}}
							/>
						{/if}
						<button aria-label="Toggle dropdown" onclick={() => { showDropdown = true; }}>
							<i class="bi bi-chevron-down"></i>
						</button>
					</div>
				{/snippet}
			</Input>
		</div>

		<Dropdown
			class="z-[1000]! text-sm shadow-xl border border-gray-200 {popupOption === 'simple' ? 'h-fit' : ''}"
			style="min-width: {inputWrapperElement?.clientWidth ?? 350}px"
			isOpen={showDropdown}
			onkeydown={onNavigateFocusItem}
		>
			<div class="flex flex-col justify-between">
				<DropdownHeader class="border-b border-gray-300" style={popupOption === 'simple' ? 'display:none' : ''}>
					{#if popupOption === 'dropdown'}
						<div>
							<div class="mb-2 flex items-center justify-between">
								<Heading tag="h5">{title} <small>({options.length})</small></Heading>
								<!-- <Button color="alternative" size="xs" title="Show all in dialog">
									<i class="bi bi-file-spreadsheet text-primary-700"></i>
									<span class="ml-2">Open in dialog</span>
								</Button> -->
							</div>
							<div class="flex flex-row gap-2">
								<Search size="sm" bind:value={searchValue} onkeydown={onkeydownSearch} />
								<Button
									size="xs"
									color="alternative"
									title="Show advance options"
									onclick={() => (showAdvanceOptions = !showAdvanceOptions)}
								>
									<i class="bi {showAdvanceOptions ? 'bi-x' : 'bi-three-dots-vertical'}"></i>
								</Button>
							</div>
						</div>

						<!-- * SECTION: advance options -->
						{#if showAdvanceOptions}
							<div class="mt-1 pt-2 flex items-center justify-between gap-2">
								<div>
									<Button size="xs" color="alternative" onclick={onSelectAll}>Select All</Button>
									<Button size="xs" color="alternative" onclick={() => { selectedValuesInDropDown = []; }}>Reset</Button>
								</div>
								<Button size="xs" color="alternative" onclick={onSelectInvert}>Select Invert</Button>
							</div>
						{/if}
					{/if}
				</DropdownHeader>

				<!-- * SECTION: dropdown options -->
				<DropdownGroup class='h-fit'>
					<div class="p-1 py-0 max-h-[450px] overflow-y-auto">
						{#each options as option, index}
							{#key selectedValuesInDropDown}
								{@const checked = selectedValuesInDropDown.includes(option.value)}
								{#if !searchValue || isMatched(searchValue, option)}
									<li
										class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600 {checked
											? 'bg-primary-100 border-primary-500 hover:bg-primary-200! border-l-4'
											: ''} list-none"
									>
										<Checkbox
											{checked}
											onchange={onchangeCheckbox}
											onclick={onchangeCheckbox}
											data-index={index}
											data-item-value={option.value}
										>
											{option.name}
										</Checkbox>
										<Helper class="ps-6">{option.description}</Helper>
									</li>
								{/if}
							{/key}
						{/each}
					</div>
				</DropdownGroup>

				<!-- * SECTION: dropdown footer -->
				<div
					class="flex items-center justify-center border-t border-gray-300 p-2"
					style={popupOption === 'simple' ? 'display:none' : ''}
				>
					{#if popupOption === 'dropdown'}
						<div class="ml-2 grow">
							Selected: <strong>{selectedValuesInDropDown.length}</strong>
						</div>
						<div class="flex gap-2">
							<Button
								size="xs"
								color="alternative"
								onclick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									showDropdown = false;
								}}>Cancel</Button
							>
							<Button size="xs" onclick={onselect}>Select</Button>
						</div>
					{/if}
				</div>
			</div>
		</Dropdown>
	</Label>
</div>
