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
				case "avg": return result.avg;
				case "pass": return result.pass;
				case "fail": return result.fail;
				case "audit":return result.audit;
				case "year":return result.year;
				case "dept":return result.dept;
				case "id":return result.id;
				case "instructor":return result.instructor;
				case "title":return result.title;
				case "uuid":return result.uuid;
			}
		} else {
			switch (key) {
				case "lat":return result.lat;
				case "lon":return result.lon;
				case "seats":return result.seats;
				case "fullname":return result.fullname;
				case "shortname":return result.shortname;
				case "number":return result.number;
				case "name":return result.name;
				case "address":return result.address;
				case "type":return result.type;
				case "furniture":return result.furniture;
				case "href":return result.href;
			}
		}
		throw new InsightError();
	}
}
