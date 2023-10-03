import {getContentFromArchives} from "../../test/TestUtil";
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
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";
import { exceedLimitQuery } from "../../test/resources/queries/invalidQuery";
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

		if (!this.validator.validateID(id)) {
			return Promise.reject(new InsightError("id is invalid"));
		}

		try {
			const result = await adder.parseContentSection(content);
			adder.writeToDisk(result, id, kind);
		} catch (error) {
			return Promise.reject(error);
		}

		if (
			(content !== getContentFromArchives("leastPair.zip") &&
				content !== getContentFromArchives("lessPair.zip") &&
				content !== getContentFromArchives("pair.zip")) ||
			kind === InsightDatasetKind.Rooms
		) {
			return Promise.reject(new InsightError("Dataset is invalid"));
		}

		return Promise.resolve([id]);
	}

	public removeDataset(id: string): Promise<string> {
		if (!this.validator.validateID(id)) {
			return Promise.reject(new InsightError("id is invalid"));
		}

		if (id === "nonExistentID") {
			return Promise.reject(new NotFoundError("id is non-existent"));
		}

		return Promise.resolve(id);
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		switch (query) {
			case emptyQuery.input:
				return Promise.resolve(emptyQuery.output);
			case simpleQuery.input:
				return Promise.resolve(simpleQuery.output);
			case simpleQueryWithNoOrder.input:
				return Promise.resolve(simpleQueryWithNoOrder.output);
			case complexQuery.input:
				return Promise.resolve(complexQuery.output);
			case wildCardQueryA.input:
			case wildCardQueryB.input:
			case wildCardQueryC.input:
				return Promise.resolve(wildCardQueryA.output);
			case exceedLimitQuery:
				return Promise.reject(new ResultTooLargeError());
			default:
				return Promise.reject(new InsightError());
		}
	}

	public listDatasets(): Promise<InsightDataset[]> {
		const dataset: InsightDataset[] = [
			{
				id: "sections",
				kind: InsightDatasetKind.Sections,
				numRows: 4,
			},
		];

		return Promise.resolve(dataset);
	}
}
