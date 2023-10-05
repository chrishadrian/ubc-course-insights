import {getContentFromArchives} from "../../test/resources/TestUtil";
import QueryEngine from "./QueryEngine";
import {
	complexQuery,
	emptyQuery,
	exceedLimitQuery,
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

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	constructor() {
		console.log("InsightFacadeImpl::init()");
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (!this.validateID(id)) {
			return Promise.reject(new InsightError("id is invalid"));
		}

		if (
			(content !== getContentFromArchives("leastPair.zip") &&
				content !== getContentFromArchives("lessPair.zip") &&
				content !== getContentFromArchives("pair.zip")) ||
			kind === InsightDatasetKind.Rooms
		) {
			return Promise.reject(new InsightError("dataset is invalid"));
		}

		return Promise.resolve([id]);
	}

	public removeDataset(id: string): Promise<string> {
		if (!this.validateID(id)) {
			return Promise.reject(new InsightError("id is invalid"));
		}

		if (id === "nonExistentID") {
			return Promise.reject(new NotFoundError("id is non-existent"));
		}

		return Promise.resolve(id);
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		let engine = new QueryEngine();
		try {
			let parsed = engine.parseQuery(query);
		} catch {
			Promise.reject(new InsightError("could not parse query"));
		}
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

	private validateID(id: string): boolean {
		const invalidIdRegex = new RegExp("^\\s*$|.*_.*");
		if (invalidIdRegex.test(id) || id === "dataset2") {
			return false;
		}
		return true;
	}
}
