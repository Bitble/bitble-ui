
export interface LoadingOverlayProps {
	isLoading: boolean;
	error?: Error;
	runningPromise?: () => Promise<any>;
	loadingMessage?: string;
}
