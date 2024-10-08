import {ResultTooLargeError} from "../controller/IInsightFacade";
import Section from "../model/Section";
import {Logic} from "./QueryEngine";
import Room from "../model/Room";

export interface Node {
	[key: string]: string | number | Node[] | Node;
}

type DatasetIndexes = Record<string, Map<string | number, Section[]>> | Record<string, Map<string | number, Room[]>>
type DatasetResult = Array<Section | Room>

export default class Filter {
	public filterByFields(
		operation: Logic,
		fieldNames: string[],
		values: string[][],
		indexes: DatasetIndexes,
		currentResult: DatasetResult,
	): DatasetResult {
		let resultSet: DatasetResult = currentResult;
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
					if (this.validateSection(filteredData[0])) {
						const filteredSectionData = filteredData as Section[];
						const filteredDataIds = filteredSectionData.map((item) => item.uuid);
						const sectionSet = resultSet as Section[];
						resultSet = sectionSet.filter((data) => filteredDataIds.includes(data.uuid));
					} else {
						const filteredRoomData = filteredData as Room[];
						const filteredDataNames = filteredRoomData.map((item) => item.name);
						const roomSet = resultSet as Room[];
						resultSet = roomSet.filter((data) => filteredDataNames.includes(data.name));
					}
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
		indexes: DatasetIndexes,
	): DatasetResult {
		const result: DatasetResult = [];
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

	public filterByNode(root: Node, indexes: DatasetIndexes): DatasetResult {
		let fields: string[] = [], values: string[][] = [], result: DatasetResult = [], counter = 0;

		const filterSections = (node: Node): DatasetResult => {
			for (const key in node) {
				if (Object.prototype.hasOwnProperty.call(node, key)) {
					if (key === "AND" || key === "OR") {
						const value = node[key] as Node[];
						let tempResult: DatasetResult = [];
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
						const tempResult2 = this.
							filterByFields(Logic[key], fields, values, indexes, tempResult);
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
				break;
			} else {
				const tempResult = filterSections(root);
				const newResult = counter === 0;
				result = this.handleLogicMerge(key, result, tempResult, newResult);
				break;
			}
		}
		return result;
	}

	private handleLogicMerge(
		logic: Logic, currResult: DatasetResult, result: DatasetResult, newResult: boolean
	): DatasetResult{
		let resultSet: DatasetResult = [];

		if (newResult) {
			resultSet = result;
		} else {
			resultSet = currResult;
		}

		if (logic === Logic.AND) {
			if (this.validateSection(result[0])) {
				const sectionResult = result as Section[];
				const sectionResultIDs = sectionResult.map((item) => item.uuid);
				const sectionSet = resultSet as Section[];
				resultSet = sectionSet.filter((data) => sectionResultIDs.includes(data.uuid));
			} else {
				const roomResult = result as Room[];
				const roomResultNames = roomResult.map((item) => item.name);
				const roomSet = resultSet as Room[];
				resultSet = roomSet.filter((data) => roomResultNames.includes(data.name));
			}
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

	public filterByColumnsAndOrder(
		data: DatasetResult, columns: string[], orderFields: string[], direction: string, datasetID: string
	) {
		const filteredData = data.map((section) => {
			const filteredItem: any = {};
			columns.forEach((column) => {
				filteredItem[`${datasetID}_${column}`] = (section as keyof (Section | Room))[column];
			});
			return filteredItem;
		});

		const result =  filteredData.sort((a, b) => {
			// const order = `${datasetID}_${orderField as keyof (Section | Room)}`;
			if (direction === "" || direction === "UP") {
				for (let orderField of orderFields) {
					const order =  `${datasetID}_${orderField as keyof (Section | Room)}`;
					if (a[order] < b[order]) {
						return -1;
					}
					if (a[order] > b[order]) {
						return 1;
					}
				}
			} else {
				for (let orderField of orderFields) {
					const order =  `${datasetID}_${orderField as keyof (Section | Room)}`;
					if (a[order] > b[order]) {
						return -1;
					}
					if (a[order] < b[order]) {
						return 1;
					}
				}
			}
			return 0;
		});

		return result;
	}

	private validateSection(result: Room | Section): boolean {
		const section = new Section();
		for (const key in result) {
			if (key in section) {
				return true;
			}
		}
		return false;
	}
}
