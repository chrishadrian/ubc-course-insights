export interface ContentSection {
	id: number;
	Subject: string;
	Course: number;
	Title: string;
	Year: number;
	Avg: number;
	Pass: number;
	Fail: number;
	Audit: number;
	Professor: string;
}

export default class Section {
	private readonly uuid: number;
	private readonly department: string;
	private readonly id: number;
	private readonly title: string;
	private readonly year: number;
	private readonly average: number;
	private readonly pass: number;
	private readonly fail: number;
	private readonly audit: number;
	private readonly instructor: string;

	constructor(content: ContentSection) {
		this.uuid = content.id || 0;
		this.department = content.Subject || "";
		this.id = content.Course || 0;
		this.title = content.Title || "";
		this.year = content.Year || 0;
		this.average = content.Avg || 0;
		this.pass = content.Pass || 0;
		this.fail = content.Fail || 0;
		this.audit = content.Audit || 0;
		this.instructor = content.Professor || "";
	}

	// option:
	// 1. create a function to transform current section structure to query structure
}
