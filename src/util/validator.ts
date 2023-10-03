import { InsightError } from "../controller/IInsightFacade";
import Viewer from "../usecase/Viewer";

export default class Validator {
	constructor() {
		// console.log("InsightFacadeImpl::init()");
	}

	public validateID(id: string): string[] {
		const invalidIdRegex = new RegExp("^\\s*$|.*_.*");
		if (invalidIdRegex.test(id)) {
			throw new InsightError("ID is invalid");
		}

		const viewer = new Viewer();
		const datasetIDs = viewer.getExistingDatasetIDs();
		if (datasetIDs.includes(id)) {
			throw new InsightError("ID already exists");
		}

		return datasetIDs;
	}
}
