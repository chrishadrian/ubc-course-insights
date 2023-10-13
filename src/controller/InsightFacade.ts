import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, InsightResult} from "./IInsightFacade";
import Adder, {DatasetIndexes} from "../usecase/Adder";
import Validator from "../util/validator";
import Remover from "../usecase/Remover";
import Viewer, {Node} from "../usecase/Viewer";
import QueryEngine from "../usecase/QueryEngine";

export default class InsightFacade implements IInsightFacade {
	private validator;
	private datasetIDs: string[];
	private datasets: InsightDataset[];
	private indexes: DatasetIndexes;

	constructor() {
		const viewer = new Viewer();

		this.validator = new Validator();
		this.datasetIDs = [];
		this.datasets = viewer.getInsightDatasets();
		this.indexes = {};
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		const adder = new Adder();

		try {
			this.validator.validateID(id, "add", this.datasetIDs);
		} catch (error) {
			return Promise.reject(error);
		}

		try {
			const result = await adder.parseContentSection(content);
			const datasetJSON = await adder.writeToDisk(result, id, kind);
			this.datasetIDs.push(id);
			this.datasets.push(datasetJSON.insightDataset);
			this.indexes[id] = datasetJSON.datasetIndex[id];
		} catch (error) {
			return Promise.reject(error);
		}

		if (kind === InsightDatasetKind.Rooms) {
			return Promise.reject(new InsightError("Dataset is invalid"));
		}

		return Promise.resolve(this.datasetIDs);
	}

	public removeDataset(id: string): Promise<string> {
		const remover = new Remover();
		try {
			this.validator.validateID(id, "remove", this.datasetIDs);
		} catch (error) {
			return Promise.reject(error);
		}

		remover.removeFromDisk(id);
		this.datasets.forEach((item, index) => {
			if (item.id === id) {
				this.datasets.splice(index, 1);
			}
		});

		return Promise.resolve(id);
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {
		const queryEngine = new QueryEngine();
		let datasetID = "";
		let orderField = "";
		let columns = [""];
		let filters: Node = {};

		try {
			const queryResult = queryEngine.parseQuery(query);
			const where = queryResult.whereBlock;
			filters = where;

			const options = queryResult.optionsBlock;
			datasetID = options.getDatasetID();
			columns = options.getColumns();
			orderField = options.getOrder();
		} catch (err) {
			return Promise.reject(err);
		}

		try {
			const viewer = new Viewer();
			let indexes = this.indexes[datasetID];

			if (Object.keys(this.indexes).length === 0) {
				indexes = await viewer.getSectionIndexesByDatasetID(datasetID);
			}

			const filteredSections = viewer.filterByNode(filters, indexes);
			const result = viewer.filterByColumnsAndOrder(filteredSections, columns, orderField, datasetID);

			return Promise.resolve(result);
		} catch (err) {
			return Promise.reject(`Perform query error: ${err}`);
		}
	}

	public listDatasets(): Promise<InsightDataset[]> {
		const memoryResult = this.datasets;

		return Promise.resolve(memoryResult);
	}
}
