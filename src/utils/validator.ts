export default class Validator {
	constructor() {
		// console.log("InsightFacadeImpl::init()");
	}

	public validateID(id: string): boolean {
		const invalidIdRegex = new RegExp("^\\s*$|.*_.*");
		if (invalidIdRegex.test(id)) {
			return false;
		}
		// if id already exists in disk, return false

		return true;
	}
}
