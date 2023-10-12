import * as fs from "fs-extra";
import {InsightDataset} from "../controller/IInsightFacade";
import Section from "../model/Section";
import {Logic} from "../model/Where";
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
			const obj: {
				insightDataset: InsightDataset;
				MappedSection: Record<string, Record<string | number, Section[]>>;
			} = JSON.parse(fileContent);
			result.push(obj.insightDataset);
		});

		return result;
	}

	public async getSectionIndexesByDatasetID(
		datasetID: string
	): Promise<Record<string, Map<string | number, Section[]>>> {
		let result: Record<string, Map<string | number, Section[]>> = {};

		if (!fs.existsSync(persistDir)) {
			return result;
		}

		const fileContent = await fs.readFile(`${persistDir}/${datasetID}.json`).toString();
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

	public filterByFields(
		operations: Logic[],
		fields: string[][],
		values: string[][][],
		indexes: Record<string, Map<string | number, Section[]>>
	): Section[] {
		let resultSet: Set<Section> = new Set();

		const isSectionEqual = (a: Section, b: Section): boolean => {
			return a.uuid === b.uuid;
		};

		for (let i = 0; i < operations.length; i++) {
			const fieldNames = fields[i];
			const fieldValues = values[i];

			for (let j = 0; j < fieldNames.length; j++) {
				const fieldName = fieldNames[j];
				const valueArray = fieldValues[j];
				const filteredData = this.filterByField(fieldName, valueArray, indexes);

				if (operations[i] === Logic.AND) {
					if (resultSet.size === 0) {
						resultSet = new Set(filteredData); // Initialize resultSet with the first result
					} else {
						resultSet = new Set(
							[...resultSet].filter((section) =>
								filteredData.some((filteredSection) => isSectionEqual(section, filteredSection))
							)
						);
					}
				} else if (operations[i] === Logic.OR) {
					resultSet = new Set([...resultSet, ...filteredData]);
				}
			}
		}

		return Array.from(resultSet);
	}

	private filterByField(
		fieldName: string,
		values: string[],
		indexes: Record<string, Map<string | number, Section[]>>
	): Section[] {
		const result: Section[] = [];
		if (!values || values.length === 0) {
			return result;
		}

		if (values.length === 1) {
			if (values[0].indexOf("*") > -1) {
				for (const [key, value] of indexes[fieldName]) {
					const regex = new RegExp(values[0]);
					if (regex.test(key.toString())) {
						result.push(...value);
					}
				}
				return result;
			} else {
				const sections = indexes[fieldName]?.get(values[0]) || [];
				result.push(...sections);
				return result;
			}
		}

		if (values.length === 2) {
			// https://www.codingninjas.com/studio/library/typescript-map
			for (const [key, value] of indexes[fieldName]) {
				switch (values[0]) {
					case "GT":
						if (key > values[1]) {
							result.push(...value);
						}
						continue;
					case "LT":
						if (key < values[1]) {
							result.push(...value);
						}
						continue;
					case "NOT":
						if (key !== values[1]) {
							result.push(...value);
						}
						continue;
				}
			}
		}

		return result;
	}

	public filterByColumnsAndOrder(data: Section[], columns: string[], orderField: string, datasetID: string) {
		const filteredData = data.map((section) => {
			const filteredItem: any = {};
			columns.forEach((column) => {
				const sectionKey = column as keyof Section;
				filteredItem[`${datasetID}_${sectionKey}`] = section[sectionKey];
			});
			return filteredItem;
		});

		return filteredData.sort((a, b) => {
			const order = orderField as keyof Section;
			if (a[order] < b[order]) {
				return -1;
			}
			if (a[order] > b[order]) {
				return 1;
			}
			return 0;
		});
	}

	private jsonToMap(json: Record<string | number, Section[]>): Map<string | number, Section[]> {
		const map = new Map<string | number, Section[]>();
		for (const key in json) {
			map.set(key as string | number, json[key]);
		}
		return map;
	}
}
