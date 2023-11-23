import {InsightError} from "../controller/IInsightFacade";
import Room from "../model/Room";
import Section from "../model/Section";
import {Node} from "../model/WhereRe";

type DatasetResult = Array<Section | Room>

type Grouping = Map<Map<string, string | number>, DatasetResult>;


export default class Group {
	public groupAndApply(data: DatasetResult, group: Set<string>, apply: Node[], datasetID: string): any[] {
		const groupings: Map<Map<string, string | number>, DatasetResult> =
			new Map<Map<string, string | number>, DatasetResult>();
		for (let result of data) {
			let resultKeys: Map<string, string | number> = new Map<string, string | number>();
			for (let key of group) {
				let value = this.getValue(result, key);
				resultKeys.set(key, value);
			}
			let datasetResult = groupings.get(resultKeys);
			if (datasetResult) {
				datasetResult.push(result);
				groupings.set(resultKeys, datasetResult);
				break;
			}
			groupings.set(resultKeys, [result]);
		}

		return [];
	}

	private getValue(result: Room | Section, key: string): string | number {
		if (result instanceof Section) {
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
		throw new InsightError();

	}

	private getValueOrThrowError(value: string | number | undefined, key: string): string | number {
		if (value === undefined) {
			throw new InsightError(`Field "${key}" is undefined.`);
		}
		return value;
	}
}
