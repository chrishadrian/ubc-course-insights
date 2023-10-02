import Section from "./Section";
import * as fs from "fs-extra";

export default class Sections {
	private sections: Section[];

	constructor(sections?: Section[]) {
		this.sections = sections || [];
	}

	public addSection(section: Section) {
		this.sections.push(section);
	}

	public writeToDisk(datasetID: string) {
		// use fs to write list of sections on a particular
		const jsonData = JSON.stringify(this.sections, null, 2);
		const filePath = `${__dirname}/${datasetID}.json`;
		fs.writeFileSync(filePath, jsonData);
		console.log(`JSON data has been written to ${filePath}`);
	}
}
