import * as fs from "fs-extra";
const persistDir = "./data";

export default class Viewer {
	public getExistingDatasetIDs(): string[] {
		const result: string[] = [];

		if (!fs.existsSync(persistDir)) {
			return result;
		}

		fs.readdirSync(persistDir).forEach((file) => {
			const datasetID = (file.split("_", 2)[1]).replace(".json", "");
			result.push(datasetID);
		});

		return result;
	}
}
