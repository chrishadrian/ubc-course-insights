import * as fs from "fs-extra";
import {InsightDataset, InsightError, ResultTooLargeError} from "../controller/IInsightFacade";
import Section from "../model/Section";
import {Logic} from "../model/Where";
import {DatasetJSON} from "./SectionParser";
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
			const obj: DatasetJSON = JSON.parse(fileContent);
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
			result[fieldName] = this.jsonToMap(datasetJSON.MappedSection[fieldName]);
		}

		return Promise.resolve(result);
	}

	public filterByFields(
		operation: Logic,
		fieldNames: string[],
		values: string[][],
		indexes: Record<string, Map<string | number, Section[]>>,
		currentResult: Section[]
	): Section[] {
		let resultSet: Section[] = currentResult;
		let newResult: boolean = true;

		for (let j = 0; j < fieldNames.length; j++) {
			const fieldName = fieldNames[j];
			const valueArray = values[j];
			const filteredData = this.filterByField(fieldName, valueArray, indexes);

			if (operation === Logic.AND) {
				if (newResult && resultSet.length === 0) {
					resultSet = filteredData;
					newResult = false;
				} else {
					resultSet = resultSet.filter((section) => filteredData.includes(section));
				}
			} else if (operation === Logic.OR) {
				resultSet = [...new Set([...resultSet, ...filteredData])];
			}
		}

		return resultSet;
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
			if (values[0].toString().indexOf("*") > -1) {
				for (const [key, value] of indexes[fieldName]) {
					const regex = new RegExp(values[0]);
					if (regex.test(key.toString())) {
						result.push(...value);
					}
				}
				return result;
			} else {
				const sections = indexes[fieldName].get(values[0]) || [];
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

	public filterByNode(root: Node, indexes: Record<string, Map<string | number, Section[]>>): Section[] {
		let fields: string[] = [], values: string[][] = [], result: Section[] = [], counter = 0;

		const filterSections = (node: Node): Section[] => {
			for (const key in node) {
				if (Object.prototype.hasOwnProperty.call(node, key)) {
					if (key === "AND" || key === "OR") {
						const value = node[key] as Node[];
						let tempResult: Section[] = [];
						for (const i in value) {
							const curr = value[i];
							tempResult = filterSections(curr);
							for (const currKey in curr) {
								if ((currKey === Logic.AND) || (currKey === Logic.OR))  {
									const newResult = (i === "0");
									result = this.handleLogicMerge(Logic[key], result, tempResult, newResult);
									counter += 1;
								}
							}
						}
						const tempResult2 = this.filterByFields(Logic[key], fields, values, indexes, tempResult);
						fields = [];
						values = [];
						return tempResult2;
					} else {
						let {field, fieldValue}: {field: string, fieldValue: string[]} = this.handleComp(node, key);
						fields.push(field);
						values.push(fieldValue);
					}
				}
			}
			return [];
		};

		for (const key in root) {
			if (key !== Logic.AND && key !== Logic.OR) {
				const {field, fieldValue}: {field: string; fieldValue: string[];} = this.handleComp(root, key);
				result = this.filterByField(field, fieldValue, indexes);
			} else {
				const tempResult = filterSections(root);
				const newResult = counter === 0;
				result = this.handleLogicMerge(key, result, tempResult, newResult);
			}
		}
		if (result.length > 5000) {
			throw new ResultTooLargeError();
		}

		return result;
	}

	private handleLogicMerge(logic: Logic, currResult: Section[], result: Section[], newResult: boolean): Section[]{
		let resultSet: Section[] = [];

		if (newResult) {
			resultSet = result;
		} else {
			resultSet = currResult;
		}

		if (logic === Logic.AND) {
			resultSet = resultSet.filter((section) => result.includes(section));
		} else if (logic === Logic.OR) {
			resultSet = [...new Set([...resultSet, ...result])];
		}

		return resultSet;
	}

	private handleComp(node: Node, key: string) {
		const value = node[key] as Node;
		let field: string = "";
		let fieldValue: string[] = [];
		for (const valueKey in value) {
			field = valueKey;
			if (key === "EQ" || key === "IS") {
				fieldValue = [value[valueKey]] as string[];
			} else {
				fieldValue = [key, value[valueKey]] as string[];
			}
		}
		return {field, fieldValue};
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
			const order = `${datasetID}_${orderField as keyof Section}`;
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
