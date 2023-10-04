import Section from "./Section";

export default class Sections {
	private sections: Section[];

	constructor(sections?: Section[]) {
		this.sections = sections || [];
	}

	public addSection(section: Section) {
		this.sections.push(section);
	}

	public getSections(): Section[] {
		return this.sections;
	}
}
