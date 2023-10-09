import * as fs from "fs-extra";
import {InsightDataset} from "../controller/IInsightFacade";
import Section from "../model/Section";
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

	public getSectionIndexesByDatasetID(datasetID: string): Record<string, Map<string | number, Section[]>> {
		let result: Record<string, Map<string | number, Section[]>> = {};

		if (!fs.existsSync(persistDir)) {
			return result;
		}

		const fileContent = fs.readFileSync(`${persistDir}/${datasetID}.json`).toString();
		const datasetJSON: {
			insightDataset: InsightDataset;
			MappedSection: Record<string, Record<string | number, Section[]>>;
		} = JSON.parse(fileContent);

		for (const key in datasetJSON.MappedSection) {
			const fieldName: keyof Section = key as keyof Section;
			result[fieldName] = this.jsonToMap(datasetJSON.MappedSection[fieldName]);
		}

		return result;
	}

	public filterByField(
		fieldName: string,
		value: string,
		indexes: Record<string, Map<string | number, Section[]>>
	): Section[] {
		const result = indexes[fieldName]?.get(value);
		return result || [];
	}

	private jsonToMap(json: Record<string | number, Section[]>): Map<string | number, Section[]> {
		const map = new Map<string | number, Section[]>();
		for (const key in json) {
			map.set(key as string | number, json[key]);
		}
		return map;
	}
}
