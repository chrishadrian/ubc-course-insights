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

	public writeToDisk(datasetID: string) {
		const jsonData = JSON.stringify(this.sections, null, 2);

		if (!fs.existsSync(persistDir)) {
			fs.mkdirSync(persistDir);
		}

		const filePath = `${persistDir}/${datasetID}.json`;
		fs.writeFileSync(filePath, jsonData);
	}
}
