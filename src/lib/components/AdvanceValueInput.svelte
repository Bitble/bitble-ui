<script lang="ts">
	import { Button, Heading, Helper, Input, Label, Modal, Tooltip } from "flowbite-svelte";
	import { onMount } from "svelte";
	import type { AdvanceFormFieldProps, AdvanceFormFieldStates } from "./AdvanceFormField";

	let {
		label,
		name,
		errors,
		selectableValues = $bindable([]),
		disabled = $bindable(false),
		value = $bindable(''),
		fieldMessage = $bindable(''),
		required = false,
		readonly = false,
		icon = '',
		hint = '',
		placeholder = '',
		type = 'text',
		labelPosition = 'top',
		onchange,
		..._props
	}: AdvanceFormFieldProps = $props();

	let componentRoot: HTMLDivElement;

	let fieldState: AdvanceFormFieldStates = $state();
	let showValueHelperDialog: boolean = $state.raw(false);

	let inputClass = $derived(`block w-full disabled:cursor-not-allowed disabled:opacity-50 rtl:text-right ${
		icon ? 'pl-8!' : 'pl-2!'
	}`);

	$effect(() => {
		if (errors) {
			fieldMessage = (errors[name] ?? [''])[0];
			fieldState = 'error';
		} else {
			fieldState = 'valid';
		}
	})

	export function focus() {
		componentRoot?.querySelector(`#form_${name}`)?.focus();
	}

	function onSelectValue() {
		value = 'selected value';
		showValueHelperDialog = false;
	}

	function onKeyDown(event: KeyboardEvent) {
		if (event.key === 'F4') {
			showValueHelperDialog = true;
		}
	}

	function _onchange(event: Event) {
		if (onchange) onchange(event);
  }

	onMount(() => {})

</script>

<div bind:this={componentRoot} class="mb-4">
	<Label>
		<div class='w-full flex justify-between items-end px-1'>
			<!-- * SECTION: Label -->
			<div class='mb-1'>
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
					 <i id="form_hint_{name}" class='bi bi-question-circle text-primary-500 font-extrabold text-lg'></i>
					 <Tooltip triggeredBy="#form_hint_{name}" trigger="hover">{hint}</Tooltip>
					 <Tooltip triggeredBy="#form_hint_{name}" trigger="focus">{hint}</Tooltip>
				{/if}
			</div>
		</div>

		<Input
			bind:value
			defaultClass={inputClass}
			id="form_{name}"
			name={name}
			onkeydown={onKeyDown}
			onchange={_onchange}
			{type}
			{placeholder}
			{required}
			{readonly}
			{..._props}
		>
			<span slot="left">
				{#if icon} <i class="bi {icon}"></i> {/if}
			</span>

			<!-- * SECTION: Validation indicator / functional buttons -->
			<div slot='right' class='flex flex-row items-center'>
				<!-- {#if showValueHelperButton} -->
				 {#if String(value).length > 0}
					 <button aria-label='Clear value' onclick={(e) => { e.preventDefault(); value = ''; }}>
						<i class="bi bi-x" style="zoom: 2;"></i>
					 </button>
				 {/if}
					<button
						aria-label='Open value helper'
						class='p-1 border border-gray-300  hover:border-gray-500 py-0.5 rounded-sm hover:shadow-sm hover:bg-gray-200'
						title='Open value helper (F4)'
						onclick={(e) => { e.preventDefault(); showValueHelperDialog = true }}
					>
						<i class="bi bi-binoculars"></i>
					</button>
				<!-- {/if} -->
			</div>

		</Input>

		<!-- * SECTION: fieldMessage -->
		{#if fieldState === 'error' || fieldState === 'warned'}
			<Helper class="mt-2 block w-full" color={fieldState === 'error' ? 'red' : undefined}>
				<span class="font-medium">{fieldMessage}</span>
			</Helper>
		{/if}

	</Label>
</div>

<Modal bind:open={showValueHelperDialog} size="md" dismissable={true} shadow={true} >
	<div slot="header">
		<Heading tag="h5">Value Helper</Heading>
		<div>

		</div>
	</div>

	<div>

	</div>

	<div class="w-full text-right" slot="footer">
		<div class="text-right">
			<Button color="alternative" size="sm" onclick={() => {showValueHelperDialog = false; value=''}}
				>Clear</Button
			>
			<Button color="alternative" size="sm" onclick={() => (showValueHelperDialog = false)}
				>Cancel</Button
			>
			<Button on:click={() => onSelectValue()} size="sm">Select</Button>
		</div>
	</div>
</Modal>
