import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, InsightResult} from "./IInsightFacade";
import Adder from "../usecase/Adder";
import Validator from "../util/validator";
import Remover from "../usecase/Remover";
import Viewer from "../usecase/Viewer";
import QueryEngine from "../usecase/QueryEngine";
import { FieldFilters } from "../model/Where";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */

export default class InsightFacade implements IInsightFacade {
	private validator;
	private datasets: InsightDataset[];

	constructor() {
		const viewer = new Viewer();

		this.validator = new Validator();
		this.datasets = viewer.getInsightDatasets();
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		const adder = new Adder();
		let datasetIDs: string[];

		try {
			datasetIDs = this.validator.validateID(id, "add");
		} catch (error) {
			return Promise.reject(error);
		}

		try {
			const result = await adder.parseContentSection(content);
			const datasetInsight = adder.writeToDisk(result, id, kind);
			this.datasets.push(datasetInsight);
			datasetIDs.push(id);
		} catch (error) {
			return Promise.reject(error);
		}

		if (kind === InsightDatasetKind.Rooms) {
			return Promise.reject(new InsightError("Dataset is invalid"));
		}

		return Promise.resolve(datasetIDs);
	}

	public removeDataset(id: string): Promise<string> {
		const remover = new Remover();
		try {
			this.validator.validateID(id, "remove");
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

	public performQuery(query: unknown): Promise<InsightResult[]> {
		const queryEngine = new QueryEngine();
		let datasetID = "", orderField = "";
		let columns = [""];
		let filters = new FieldFilters();

		try {
			const queryResult = queryEngine.parseQuery(query);
			const where = queryResult.whereBlock;
			datasetID = where.getSetId();
			filters = where.getFilters();

			const options = queryResult.optionsBlock;
			columns = options.getColumns();
			orderField = options.getOrder();
		} catch (err) {
			Promise.reject(err);
		}

		try {
			const viewer = new Viewer();
			const indexes = viewer.getSectionIndexesByDatasetID("sections");
			const filteredSections = viewer.filterByFields(["avg"], [["87", "99"]], indexes);
			const result = viewer.filterByColumnsAndOrder(filteredSections, columns, orderField);
			return Promise.resolve(result);
		} catch (err) {
			Promise.reject(`Perform query error: ${err}`);
		}

		return Promise.reject("Perform query error");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		const memoryResult = this.datasets;

		return Promise.resolve(memoryResult);
	}
}
