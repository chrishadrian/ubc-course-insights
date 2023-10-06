import {InsightError, NotFoundError} from "../controller/IInsightFacade";
import Viewer from "../usecase/Viewer";

export default class Validator {
	constructor() {
		// console.log("InsightFacadeImpl::init()");
	}

	public validateID(id: string, source: string): string[] {
		const invalidIdRegex = new RegExp("^\\s*$|.*_.*");
		if (invalidIdRegex.test(id)) {
			throw new InsightError("ID is invalid");
		}

		const viewer = new Viewer();
		const datasetIDs = viewer.getExistingDatasetIDs();
		if (source === "add" && datasetIDs.includes(id)) {
			throw new InsightError("ID already exists");
		}
		if (source === "remove" && !datasetIDs.includes(id)) {
			throw new NotFoundError("ID does not exist!");
		}

		return datasetIDs;
	}
}
