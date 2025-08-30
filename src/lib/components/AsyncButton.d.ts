interface AsyncButtonProps<T> extends AsyncStateMachineProps<T> {
	label: string,
	role?: 'button' | 'submit' | 'reset',
	icon?: string,
	color?: string,
	type?: 'button' | 'submit' | 'reset',
	disabled?: boolean,
	classes?: string,
	useWarning?: boolean,
	warningMessage?: string,
	successToastTitle?: string,
	successToastMessage?: string,
	useDefaultErrorDialog?: boolean,
}

type AsyncButtonStates = undefined | 'loading' | 'success' | 'error';

interface AsyncStateMachineProps<T> {
	/**
	 * @bindable The loading state.
	*/
	loading?: boolean;
	onclick?: (e?: Event) => Promise<T>;
	onsuccess?: (result: T) => void;
	onerror?: (error: Error) => void;
}