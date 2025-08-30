
export interface ColumnDefinition {
	label: string;
	targetField: string;
	biIcon?: string;
	sortable?: boolean;
	groupable?: boolean;
	hidden?: boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	snippet?: (itemObject: any) => ReturnType<import("svelte").Snippet>;
	// filterable?: boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	dataMapper?: (cellValue: any) => any;
}

export interface SortOption {
	field: string;
	sort: 'asc' | 'desc' | null;
}

export interface TableData {
	data: any[];
	count?: number;
	page?: number;
}

export type DataSourceRetriever = (() => Promise<TableData>)
	| ((page: number) => Promise<TableData>)
	| ((offset: number) => Promise<TableData>)

interface AdvanceDataTableProps {
	/**
	 * The data source for the table.
	 *
	 * - If fetch mode is 'server' (default):
	 *   - the `dataSource` function will be called with the page number and page size
	 *
	 * - If fetch mode is 'client' & 'none':
	 *   - the `dataSource` function will be called once
	 *
	 * - If fetch mode is 'lazy-load':
	 * 	 - the `dataSource` function will be called when scrolled to the bottom of the table
	 *
	 * @returns A promise that resolves to an array of data items.
	 */
	dataSource: DataSourceRetriever;

	
	dataMapper?: (dataRow: any) => any;

	columnDefinitions: ColumnDefinition[];

	title: string;

	loading?: boolean;

	/**
	 * The options for sorting the table.
	 *
	 * Must be bind
	*/
	sortOptions?: SortOption[];

	/**
	 * The starting row for the table.
	 *
	 * Must be bind
	*/
	startRow?: number;
	currentPage?: number;

	cellHoverHighlight?: boolean;
	simple?: boolean;
	showRowActions?: boolean;
	selectable?: boolean;
	pageSize?: number;
	fetchMode?: 'server' | 'client' | 'none' | 'lazy-load';
}

