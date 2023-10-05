import * as fs from "fs-extra";
import { InsightDataset } from "../controller/IInsightFacade";
const persistDir = "./data";

export default class Viewer {
	public getExistingDatasetIDs(): string[] {
		const result: string[] = [];

		if (!fs.existsSync(persistDir)) {
			return result;
		}

		fs.readdirSync(persistDir).forEach((file) => {
			const datasetID = file.replace(".json", "");
			result.push(datasetID);
		});

		return result;
	}

	public getInsightDatasets(): InsightDataset[] {
		const result: InsightDataset[] = [];

		if (!fs.existsSync(persistDir)) {
			return result;
		}

		fs.readdirSync(persistDir).forEach((file) => {
			const fileContent = fs.readFileSync(`${persistDir}/${file}`).toString();
			const obj = JSON.parse(fileContent);
			result.push(obj.insight);
		});

		return result;
	}
}
