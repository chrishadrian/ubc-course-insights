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
	public readonly uuid: number;
	public readonly dept: string;
	public readonly id: number;
	public readonly title: string;
	public readonly year: number;
	public readonly avg: number;
	public readonly pass: number;
	public readonly fail: number;
	public readonly audit: number;
	public readonly instructor: string;

	constructor(content?: ContentSection) {
		this.uuid = content ? content.id : 0;
		this.dept = content ? content.Subject : "";
		this.id = content ? content.Course : 0;
		this.title = content ? content.Title : "";
		this.year = content ? content.Year : 0;
		this.avg = content ? content.Avg : 0;
		this.pass = content ? content.Pass : 0;
		this.fail = content ? content.Fail : 0;
		this.audit = content ? content.Audit : 0;
		this.instructor = content ? content.Professor : "";
	}
}
