import type { Validator } from "./validators/BitbleValidators";

interface DataItem {
	value: string,
	name: string,
	description?: string
}

interface AdvanceFormFieldProps {

	/**
	 * **`bitble-form`**: specify the name for the input. Applied to:
	 * - `id` of `<input>`: `#form_{name}`
	 * - `name` prop of `<input>`: `{name}`
	 * - `id` of hint span: `#hint_{name}`
	 * - Key for allocating error in `errors` prop
	 */
	name: string;
	label: string;

	/**
	 * **`svelte-bindable`**: Can be bound with `bind:disabled`
	 */
	disabled?: boolean;

	/**
	 * **`svelte-bindable`**: Must have binding `bind:value={form_<name>}`
	 */
	value?: string;

	/**
	 * **`svelte-bindable`**: Can be bound with `bind:fieldMessage`
	 */
	fieldMessage?: string;

	clearable?: boolean;
	required?: boolean;
	readonly?: boolean;
	icon?: string;

	/**
	 * **`bitble-form`**: Provide some additional information about this field
	 */
	hint?: string;

	placeholder?: string;
	type?: string;
	labelPosition?: 'top' | 'left' | 'right';
	validators?: Validator[];
	oninput?: (event: Event) => void;
}

type AdvanceFormFieldStates = undefined | 'error' | 'warned' | 'valid';