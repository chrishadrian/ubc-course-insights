import * as fs from "fs-extra";

export default class Remover {
	constructor() {
		// console.log("InsightFacadeImpl::init()");
	}

	public async removeFromDisk(datasetID: string) {
		fs.unlink(`./data/${datasetID}.json`, (err) => {
			if (err) {
				throw err;
			}
			console.log("File deleted successfully");
		});
	}
}
