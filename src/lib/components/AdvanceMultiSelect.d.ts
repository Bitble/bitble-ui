
export interface OptionItem {
	value: string,
	name: string,
	description?: string
}

interface AdvanceMultiSelectProps {

	/**
	 * Name of selected objects, should be in plural form
	 *
   * **`bitble-form`**: specify the name for the input. Applied to:
   * - `id` of `<input>`: `#form_{name}`
   * - `name` prop of `<input>`: `{name}`
   * - `id` of hint span: `#hint_{name}`
   * - Key for allocating error in `errors` prop
   */
	name: string,
	label: string,
	title: string,
	options: OptionItem[];

	/** **`bitble-form`**: Must have binding `bind:value={form_<name>}` */
	selections: OptionItem[];

	clearable?: boolean;
	disabled?: boolean;
	loading?: boolean;
	readonly?: boolean;
	required?: boolean;

	/** **`bitble-form`**: Provide some additional information about this field */
	hint?: string,
	placeholder?: string,
	fieldMessage?: string,

	popupOption?: 'simple' | 'dropdown' | 'modal' | 'advance-modal'

	initialSelectedValues?: string[];
	// validators?: Validator[];

	onchange?: (event: Event) => void,
}

type AdvanceFormFieldStates = undefined | 'error' | 'warned' | 'valid';