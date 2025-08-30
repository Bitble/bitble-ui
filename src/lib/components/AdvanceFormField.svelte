<script lang="ts">
	import { Helper, Input, Label, Tooltip } from "flowbite-svelte";
	import { getContext, onMount } from "svelte";
	import type { AdvanceFormFieldProps, AdvanceFormFieldStates } from "./AdvanceFormField";
	import { VALIDATORS } from "./utils/BitbleValidators";

	let {
		label,
		name,
		disabled = $bindable(false),
		value = $bindable(''),
		fieldMessage = $bindable(''),
		clearable = true,
		required = false,
		readonly = false,
		selectWhenFocused = false,
		icon = '',
		hint = '',
		placeholder = '',
		type = 'text',
		labelPosition = 'top',
		validators = [],
		oninput,
		..._props
	}: AdvanceFormFieldProps = $props();

	let componentRoot: HTMLDivElement;

	let fieldState: AdvanceFormFieldStates = $state();
	
	let formObject = getContext('formObject');
	let contextualError = $derived((formObject as any)?.errors?.[name]);
	let contextualWarning = $derived((formObject as any)?.warnings?.[name]);

	let errorMessage = $state(contextualError ?? '');
	let warningMessage = $state(contextualWarning ?? '');

	$effect(() => {
		if (contextualError && errorMessage !== contextualError) {
			errorMessage = contextualError;
		}

		if (contextualWarning && warningMessage !== contextualWarning) {
			warningMessage = contextualWarning;
		}
	})

	let inputClass = $derived(`
		block w-full disabled:cursor-not-allowed disabled:opacity-50 rtl:text-right
		${icon ? 'pl-8!' : 'pl-2!'}
		${errorMessage ? 'border-red-500! border-2' : ''}
		${warningMessage ? 'border-yellow-500! border-2' : ''}
	`.trim());

	// export function focus() {
	// 	componentRoot?.querySelector(`#form_${name}`)?.focus();
	// }

	function onfocus() {
		if (selectWhenFocused) {
			componentRoot?.querySelector(`#form_${name}`)?.select();
		}
	}

	function validate() {
		errorMessage = null;
		if ((formObject as any)?.errors?.[name]) {
			delete (formObject as any).errors[name];
		}

		if (required && !value) {
			errorMessage = 'This field is required';
			if (formObject && (formObject as any).errors) {
				(formObject as any).errors[name] = errorMessage;
			}
			return;
		}

		if (validators.length > 0) {
			for (const validator of validators) {
				const result = validator(value);
				if (result !== true) {
					errorMessage = result;
				}
			}
			// errorMessage = contextualError ?? '';
		}

		console.log(`[LOG/validate] ${name}:`, errorMessage, contextualError);
	}

	function onfocusout() {
		validate();
	}

	function _oninput(event: Event) {
		validate();
		if (oninput) oninput(event);
  }

	onMount(() => {
		console.log();
	})

</script>

<div bind:this={componentRoot}>
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
					 <i id="form_hint_{name}" class='bi bi-question-circle text-primary-500 font-extrabold text-lg' style="cursor: help; line-height: 1;"></i>
					 <Tooltip triggeredBy="#form_hint_{name}" trigger="hover">{hint}</Tooltip>
					 <Tooltip triggeredBy="#form_hint_{name}" trigger="focus">{hint}</Tooltip>
				{/if}
			</div>
		</div>

		<Input
			bind:value
			class={inputClass}
			id="form_{name}"
			name={name}
			onfocus={onfocus}
			onblur={onfocusout}
			oninput={_oninput}
			{type}
			{placeholder}
			{required}
			{readonly}
			{clearable}
			{..._props}
		>
			{#snippet left()}
				{#if icon} <i class="bi {icon}"></i> {/if}
			{/snippet}

			<!-- * SECTION: Validation indicator / functional buttons -->
			{#snippet right()}
				<!-- TODO: add color to these validation -->
				<!-- {#if fieldState === 'error'}
					<i class="bi exclamation-triangle-fill" slot='right'/>
				{:else if fieldState === 'valid'}
					<div slot="right">
						<i class="check-circle-field"/>
					</div>
				{/if} -->
				{#if type === 'password'}
					<!-- TODO: add password reveal button here -->
					 <div class='p-4 '></div>
				{/if}
			{/snippet}

		</Input>

		<!-- * SECTION: fieldMessage -->
		{#if errorMessage}
			<Helper class="mt-1 pl-1 block w-full" color="red">
				<span class="font-medium">{errorMessage}</span>
			</Helper>
		{:else if warningMessage}
			<Helper class="mt-1 pl-1 block w-full" color="yellow">
				<span class="font-medium">{warningMessage}</span>
			</Helper>
		{/if}

	</Label>
</div>

