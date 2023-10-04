import {
	complexQuery,
	emptyQuery,
	simpleQuery,
	simpleQueryWithNoOrder,
	wildCardQueryA,
	wildCardQueryB,
	wildCardQueryC,
} from "../../test/resources/queries/performQueryData";
import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError,
} from "./IInsightFacade";
import {exceedLimitQuery} from "../../test/resources/queries/invalidQuery";
import Adder from "../usecase/Adder";
import Validator from "../util/validator";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */

export default class InsightFacade implements IInsightFacade {
	private validator;

	constructor() {
		// console.log("InsightFacadeImpl::init()");
		this.validator = new Validator();
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
			adder.writeToDisk(result, id, kind);
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
		try {
			this.validator.validateID(id, "remove");
		} catch (error) {
			return Promise.reject(error);
		}

		return Promise.resolve(id);
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}
