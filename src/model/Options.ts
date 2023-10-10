export default class Options {
	private datasetID: string;
	private columns: string[];
	private order: string;

	constructor(id: string, columns: string[], order?: string) {
		this.datasetID = id;
		this.columns = columns;
		this.order = order || "";
	}

	public setDatasetID(id: string) {
		this.datasetID = id;
	}

	public addColumn(column: string) {
		this.columns.push(column);
	}

	public setOrder(order: string) {
		this.order = order;
	}

	public getDatasetID(): string {
		return this.datasetID;
	}

	public getColumns(): string[] {
		return this.columns;
	}

	public getOrder(): string {
		return this.order;
	}
}
