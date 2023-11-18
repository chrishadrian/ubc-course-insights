import * as fs from "fs-extra";
import {InsightDataset as IInsightDataset, InsightDatasetKind} from "../controller/IInsightFacade";
import Section from "../model/Section";
import {SectionIndexes} from "./SectionParser";
import Room from "../model/Room";
import {RoomIndexes} from "./RoomParser";
const persistDir = "./data";

export interface SectionJSON {
	InsightDataset: IInsightDataset;
	InsightIndexes: Record<string, Record<string | number, Section[] | Room[]>>;
}

export default class Viewer {
	public getDataFromDisk(): {
		insights: IInsightDataset[],
		roomIndexes: RoomIndexes,
		sectionIndexes: SectionIndexes
		} {
		const insights: IInsightDataset[] = [];
		const roomIndexes: RoomIndexes = {};
		const sectionIndexes: SectionIndexes = {};

		if (!fs.existsSync(persistDir)) {
			return {insights, roomIndexes, sectionIndexes};
		}

		const files = fs.readdirSync(persistDir);
		files.forEach((file) => {
			const sectionResult: Record<string, Map<string | number, Section[]>> = {};
			const roomResult: Record<string, Map<string | number, Room[]>> = {};
			const fileContent = fs.readFileSync(`${persistDir}/${file}`).toString();
			const {InsightDataset, InsightIndexes}: SectionJSON = JSON.parse(fileContent);
			insights.push(InsightDataset);
			if (InsightDataset.kind === InsightDatasetKind.Sections) {
				for (const key in InsightIndexes) {
					const fieldName: keyof Section = key as keyof Section;
					sectionResult[fieldName] = this.sectionJSONToMap(
						InsightIndexes[fieldName] as Record<string | number, Section[]>
					);
				}
				sectionIndexes[InsightDataset.id] = sectionResult;
			} else if (InsightDataset.kind === InsightDatasetKind.Rooms) {
				for (const key in InsightIndexes) {
					const fieldName: keyof Room = key as keyof Room;
					roomResult[fieldName] = this.roomJSONToMap(
						InsightIndexes[fieldName] as Record<string | number, Room[]>
					);
				}
				roomIndexes[InsightDataset.id] = roomResult;
			}
		});

		return {insights, roomIndexes, sectionIndexes};
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
