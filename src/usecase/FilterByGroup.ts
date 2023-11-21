import {InsightError} from "../controller/IInsightFacade";
import Room from "../model/Room";
import Section from "../model/Section";
import {Node} from "../model/WhereRe";
import QueryHelper from "../util/PerformQueryHelper";
import Decimal from "decimal.js";


type DatasetResult = Array<Section | Room>

type Grouping = Map<Map<string, string | number>, DatasetResult>;


export default class FilterByGroup {
	private helper: QueryHelper = new QueryHelper();

	public groupResults(
		data: DatasetResult,
		group: Set<string>,
		apply: Node[]
	): [
		Map<string, DatasetResult>,
		Map<string,
		Map<string, number>>
	] {
		let groupings = new Map<string, DatasetResult>();
		for (const result of data) {
			let values = [];
			let resultKeys;
			for (let key of group) {
				const value = this.getValue(result, key);
				values.push(key + "_" + value.toString());
			}
			resultKeys = "[" + [...values].join(" ") + "]";
			let datasetResult = groupings.get(resultKeys);
			if (datasetResult) {
				datasetResult.push(result);
				groupings.set(resultKeys, datasetResult);
			} else {
				groupings.set(resultKeys, [result]);
			}
		}
		let applyVals: Map<string, Map<string, number>>
			= this.getApplyVals(groupings, apply);
		return [groupings, applyVals];
	}

	private getApplyVals(
		groupings: Map<string, DatasetResult>,
		apply: Node[]
	): Map<string, Map<string, number>> {
		let applyVals: Map<string, Map<string, number>> = new Map();
		let applyRules: Map<string, [string, string]> = new Map();
		for (let node of apply) {
			let applyKey: string = this.helper.getKeysHelper(node)[0];
			let applyKeyNode: Node = node[applyKey] as Node;
			let applyToken: string = this.helper.getKeysHelper(applyKeyNode)[0];
			let msKey: string = applyKeyNode[applyToken] as string;
			applyRules.set(applyKey, [applyToken, msKey]);
		}
		for (let key of groupings.keys()) {
			let datasetResults = groupings.get(key);
			if (!datasetResults) {
				break;
			}
			let calculations: Map<string, number|Decimal|Set<number | string >> = new Map();
			for (let result of datasetResults) {
				for (let rule of applyRules.keys()) {
					let definition = applyRules.get(rule);
					if (!definition) {
						break;
					}
					this.handleCollectData(result, rule, definition, calculations);
				}
			}
			let final: Map<string, number> = new Map();
			for (let applyKey of calculations.keys()) {
				let definition = applyRules.get(applyKey);
				let result = calculations.get(applyKey);
				if (!definition || !result) {
					break;
				}
				this.finalCalculations(applyKey, definition, result, final, datasetResults.length);
			}
			applyVals.set(key, final);

		}
		return applyVals;
	}

	public filterByColumnsAndOrder(
		groupings: Map<string, DatasetResult>,
		applyVals: Map<string, Map<string, number>>,
		columns: string[], orderFields: string[], direction: string, datasetID: string, group: Set<string>) {
		const data = [];
		for (let key of groupings.keys()) {
			let value = groupings.get(key);
			if (!value) {
				break;
			}
			const filteredItem: any = {};
			for (let column of columns) {
				if (this.helper.validateMSKey(column)) {
					let [id, field] = this.helper.extractFieldIDString(column);
					if (group.has(field)) {
						filteredItem[column] = this.getValue(value[0], field);
					}
				} else {
					let applySet = applyVals.get(key);
					if (applySet) {
						let groupingApplyResult = applySet.get(column);
						if (groupingApplyResult) {
							filteredItem[column] = groupingApplyResult;
						}
					}
				}
			}
			data.push(filteredItem);
		}
		const result =  this.handleOrder(data, orderFields, direction, datasetID);
		return result;
	}

	private handleOrder(data: any[], orderFields: string[], direction: string, datasetID: string): any[]{
		const result =  data.sort((a, b) => {
			if (direction === "" || direction === "UP") {
				for (let orderField of orderFields) {
					if (a[orderField]) {
						if (a[orderField] < b[orderField]) {
							return -1;
						}
						if (a[orderField] > b[orderField]) {
							return 1;
						}
					}
				}
			} else {
				for (let orderField of orderFields) {
					if (a[orderField]) {
						if (a[orderField] > b[orderField]) {
							return -1;
						}
						if (a[orderField] < b[orderField]) {
							return 1;
						}
					}
				}
			}
			return 0;
		});
		return result;
	}

	private finalCalculations(applyKey: string, definition: [string,string],
		result: number|Decimal|Set<string|number>, final: Map<string, number>, numRows: number) {
		let token = definition[0];
		let avg;
		let res;
		switch (token) {
			case "MAX":
			case "MIN": final.set(applyKey, result as number);
				return;
			case "AVG":
				res = result as number;
				avg = res / numRows;
				res = Number(avg.toFixed(2));
				final.set(applyKey, res);
				return;
			case "SUM":
				res = result as number;
				final.set(applyKey, Number(res.toFixed(2)));
				return;
			case "COUNT":
				res = result as Set<string|number>;
				final.set(applyKey, res.size);
				return;
			default: throw new InsightError();
		}
	}

	private handleCollectData(
		result: Room | Section, rule: string,
		definition: [string, string], groupData: Map<string, number|Decimal|Set<number | string>>) {
		let token = definition[0];
		let msKey = definition[1];
		let curr = groupData.get(rule);
		let resultData;
		if (!curr) {
			switch (token) {
				case "MAX":
				case "MIN": curr = this.getValue(result, msKey) as number;
					break;
				case "AVG": curr = new Decimal(this.getValue(result, msKey) as number);
					break;
				case "SUM": curr = this.getValue(result, msKey) as number;
					break;
				case "COUNT": curr = new Set<number | string>();
					curr.add(this.getValue(result, msKey));
					break;
				default:
					return;
			}
			groupData.set(rule, curr);
		} else {
			resultData = this.getValue(result, msKey);
			switch (token) {
				case "MAX":
					if (curr as number < (resultData as number)) {
						groupData.set(rule, resultData as number);
					}
					break;
				case "MIN":
					if (curr as number > (resultData as number)) {
						groupData.set(rule, resultData as number);
					}
					break;
				case "AVG":
					groupData.set(rule, Decimal.add(curr as Decimal, new Decimal(resultData)));
					break;
				case "SUM":
					groupData.set(rule, (curr as number) + (resultData as number));
					break;
				case "COUNT":
					groupData.set(rule, (curr as Set<number | string>).add(resultData));
					break;
				default:
					return;
			}
		}
	}

	private getValue(result: Room | Section, key: string): string | number {
		const isSection = this.validateSection(result);
		if (isSection) {
			result = result as Section;
			switch (key) {
				case "avg": return this.getValueOrThrowError(result.avg, key);
				case "pass": return this.getValueOrThrowError(result.pass, key);
				case "fail": return this.getValueOrThrowError(result.fail, key);
				case "audit": return this.getValueOrThrowError(result.audit, key);
				case "year": return this.getValueOrThrowError(result.year, key);
				case "dept": return this.getValueOrThrowError(result.dept, key);
				case "id": return this.getValueOrThrowError(result.id, key);
				case "instructor": return this.getValueOrThrowError(result.instructor, key);
				case "title": return this.getValueOrThrowError(result.title, key);
				case "uuid": return this.getValueOrThrowError(result.uuid, key);
			}
		} else {
			result = result as Room;
			switch (key) {
				case "lat": return this.getValueOrThrowError(result.lat, key);
				case "lon": return this.getValueOrThrowError(result.lon, key);
				case "seats": return this.getValueOrThrowError(result.seats, key);
				case "fullname": return this.getValueOrThrowError(result.fullname, key);
				case "shortname": return this.getValueOrThrowError(result.shortname, key);
				case "number": return this.getValueOrThrowError(result.number, key);
				case "name": return this.getValueOrThrowError(result.name, key);
				case "address": return this.getValueOrThrowError(result.address, key);
				case "type": return this.getValueOrThrowError(result.type, key);
				case "furniture": return this.getValueOrThrowError(result.furniture, key);
				case "href": return this.getValueOrThrowError(result.href, key);
			}
		}
		throw new InsightError("Invalid group keys");

	}

	private getValueOrThrowError(value: string | number | undefined, key: string): string | number {
		if (value === undefined) {
			throw new InsightError(`Field "${key}" is undefined.`);
		}
		return value;
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
