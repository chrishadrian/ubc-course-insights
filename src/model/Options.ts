export default class Options {
	private datasetID: string;
	private columns: string[];
	private order: string[];
	private direction: string;

	constructor(id: string, columns: string[], order?: string[], dir?: string) {
		this.datasetID = id;
		this.columns = columns;
		this.order = order || [];
		this.direction = dir || "";
	}

	public setDatasetID(id: string) {
		this.datasetID = id;
	}

	public addColumn(column: string) {
		this.columns.push(column);
	}

	public setOrder(order: string[]) {
		this.order = order;
	}

	public getDatasetID(): string {
		return this.datasetID;
	}

	public setDirection(dir: string) {
		this.direction = dir;
	}

	public getColumns(): string[] {
		return this.columns;
	}

	public getOrder(): string[] {
		return this.order;
	}

	public getDirection(): string {
		return this.direction;
	}
}
