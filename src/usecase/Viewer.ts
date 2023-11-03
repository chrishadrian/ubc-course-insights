import * as fs from "fs-extra";
import {InsightDataset, InsightError} from "../controller/IInsightFacade";
import Section from "../model/Section";
import {SectionJSON} from "./SectionParser";
import Room from "../model/Room";
import {Logic} from "./QueryEngine";
const persistDir = "./data";

export default class Viewer {
	public getInsightDatasets(): InsightDataset[] {
		const result: InsightDataset[] = [];

		if (!fs.existsSync(persistDir)) {
			return result;
		}

		const files = fs.readdirSync(persistDir);

		files.forEach((file) => {
			const fileContent = fs.readFileSync(`${persistDir}/${file}`).toString();
			const obj: SectionJSON = JSON.parse(fileContent);
			result.push(obj.InsightDataset);
		});

		return result;
	}

	public async getSectionIndexesByDatasetID(
		datasetID: string
	): Promise<Record<string, Map<string | number, Section[]>>> {
		let result: Record<string, Map<string | number, Section[]>> = {};
		if (!fs.existsSync(persistDir)) {
			return Promise.reject(new InsightError("dataset does not exist"));
		}
		const fileContent = await fs.readFile(`${persistDir}/${datasetID}.json`);
		const datasetJSON: {
			insightDataset: InsightDataset;
			MappedSection: Record<string, Record<string | number, Section[]>>;
		} = JSON.parse(fileContent.toString());
		for (const key in datasetJSON.MappedSection) {
			const fieldName: keyof Section = key as keyof Section;
			result[fieldName] = this.sectionJSONToMap(datasetJSON.MappedSection[fieldName]);
		}

		return Promise.resolve(result);
	}

	public async getRoomIndexesByDatasetID(
		datasetID: string
	): Promise<Record<string, Map<string | number, Room[]>>> {
		let result: Record<string, Map<string | number, Room[]>> = {};

		if (!fs.existsSync(persistDir)) {
			return Promise.reject(new InsightError("dataset does not exist"));
		}

		const fileContent = await fs.readFile(`${persistDir}/${datasetID}.json`);
		const datasetJSON: {
			insightDataset: InsightDataset;
			MappedSection: Record<string, Record<string | number, Room[]>>;
		} = JSON.parse(fileContent.toString());

		for (const key in datasetJSON.MappedSection) {
			const fieldName: keyof Room = key as keyof Room;
			result[fieldName] = this.roomJSONToMap(datasetJSON.MappedSection[fieldName]);
		}

		return Promise.resolve(result);
	}

	private sectionJSONToMap(json: Record<string | number, Section[]>): Map<string | number, Section[]> {
		const map = new Map<string | number, Section[]>();
		for (const key in json) {
			map.set(key as string | number, json[key]);
		}
		return map;
	}

	private roomJSONToMap(json: Record<string | number, Room[]>): Map<string | number, Room[]> {
		const map = new Map<string | number, Room[]>();
		for (const key in json) {
			map.set(key as string | number, json[key]);
		}
		return map;
	}
}
