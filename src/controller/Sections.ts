import { InsightDatasetKind } from "./IInsightFacade";
import Section from "./Section";
import * as fs from "fs-extra";
const persistDir = "./data";

export default class Sections {
	private sections: Section[];

	constructor(sections?: Section[]) {
		this.sections = sections || [];
	}

	public addSection(section: Section) {
		this.sections.push(section);
	}

	public writeToDisk(datasetID: string, kind: InsightDatasetKind) {
		const jsonData = JSON.stringify(this.sections, null, 2);
		let directory: string = persistDir;

		switch (kind) {
			case InsightDatasetKind.Sections:
				directory = `${persistDir}/sections`;
				break;
			case InsightDatasetKind.Rooms:
				directory = `${persistDir}/rooms`;
				break;
		}

		if (!fs.existsSync(persistDir)) {
			fs.mkdirSync(persistDir);
			fs.mkdirSync(directory);
		}

		const filePath = `${directory}/${datasetID}.json`;
		fs.writeFileSync(filePath, jsonData);
	}
}
