import * as fs from "fs-extra";
import {InsightDataset} from "../controller/IInsightFacade";
import Section from "../model/Section";
import {Logic} from "../model/Where";
const persistDir = "./data";

export interface Node {
	[key: string]: string | number | Node[] | Node;
}

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
			return Promise.resolve(result);
		}

		const fileContent = await fs.readFile(`${persistDir}/${datasetID}.json`);
		const datasetJSON: {
			insightDataset: InsightDataset;
			MappedSection: Record<string, Record<string | number, Section[]>>;
		} = JSON.parse(fileContent.toString());

		for (const key in datasetJSON.MappedSection) {
			const fieldName: keyof Section = key as keyof Section;
			result[fieldName] = this.jsonToMap(datasetJSON.MappedSection[fieldName]);
		}

		return Promise.resolve(result);
	}

	public filterByFields(
		operation: Logic,
		fieldNames: string[],
		values: string[][],
		indexes: Record<string, Map<string | number, Section[]>>
	): Section[] {
		let resultSet: Set<Section> = new Set();

		const isSectionEqual = (a: Section, b: Section): boolean => {
			return a.uuid === b.uuid;
		};

		for (let j = 0; j < fieldNames.length; j++) {
			const fieldName = fieldNames[j];
			const valueArray = values[j];
			const filteredData = this.filterByField(fieldName, valueArray, indexes);

			if (operation === Logic.AND) {
				if (resultSet.size === 0) {
					resultSet = new Set(filteredData); // Initialize resultSet with the first result
				} else {
					resultSet = new Set(
						[...resultSet].filter((section) =>
							filteredData.some((filteredSection) => isSectionEqual(section, filteredSection))
						)
					);
				}
			} else if (operation === Logic.OR) {
				resultSet = new Set([...resultSet, ...filteredData]);
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

	// public filterByNode(root: Node, indexes: Record<string, Map<string | number, Section[]>>): Section[] {
	// 	const operations: Logic[] = [];
	// 	const fields: string[][] = [];
	// 	const values: string[][][] = [];

	// 	// Recursive function to traverse the Node structure and build the arrays
	// 	const buildArrays = (node: Node) => {
	// 		for (const operation in node) {
	// 			// eslint-disable-next-line no-prototype-builtins
	// 			if (node.hasOwnProperty(operation)) {
	// 				const value = node[operation] as Node;
	// 				// add more if statements --> IF it's logics do something, if it's SCOMP / MCOMP do something
	// 				if (typeof value === "object") {
	// 					// Recursively process nested objects
	// 					buildArrays(value);
	// 				} else {
	// 					const field = operation;
	// 					const fieldValue = value;
	// 					operations.push(Logic.AND);
	// 					fields.push([field]);
	// 					values.push([fieldValue]); // Convert value to a string
	// 				}
	// 			}
	// 		}
	// 	};

	// 	buildArrays(root);

	// 	// Call the existing filterByFields function with the generated arrays
	// 	return this.filterByFields(operations, fields, values, indexes);
	// }

	private jsonToMap(json: Record<string | number, Section[]>): Map<string | number, Section[]> {
		const map = new Map<string | number, Section[]>();
		for (const key in json) {
			map.set(key as string | number, json[key]);
		}
		return map;
	}
}
