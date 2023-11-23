import * as fs from "fs-extra";

export default class Remover {
	constructor() {
		// console.log("InsightFacadeImpl::init()");
	}

	public async removeFromDisk(datasetID: string) {
		fs.unlinkSync(`./data/${datasetID}.json`);
	}
}
