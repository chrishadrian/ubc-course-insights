export interface ContentSection {
	id?: number;
	Subject?: string;
	Course?: number;
	Title?: string;
	Year?: number;
	Avg?: number;
	Pass?: number;
	Fail?: number;
	Audit?: number;
	Professor?: string;
	Section?: string;
}

export default class Section {
	public readonly uuid?: string;
	public readonly dept?: string;
	public readonly id?: number;
	public readonly title?: string;
	public readonly year?: number;
	public readonly avg?: number;
	public readonly pass?: number;
	public readonly fail?: number;
	public readonly audit?: number;
	public readonly instructor?: string;

	constructor(content?: ContentSection) {
		this.uuid = content ? content.id ? content.id.toString() : undefined : undefined;
		this.dept = content ? content.Subject : undefined;
		this.id = content ? content.Course : undefined;
		this.title = content ? content.Title : undefined;
		this.year = content ? (content.Section === "overall" ? 1900 : Number(content.Year)) : undefined;
		this.avg = content ? content.Avg : undefined;
		this.pass = content ? content.Pass : undefined;
		this.fail = content ? content.Fail : undefined;
		this.audit = content ? content.Audit : undefined;
		this.instructor = content ? content.Professor : undefined;
	}

	public isInvalidSection(): boolean {
		return (
			this.uuid === undefined ||
			this.dept === undefined ||
			this.id === undefined ||
			this.title === undefined ||
			this.year === undefined ||
			this.avg === undefined ||
			this.pass === undefined ||
			this.fail === undefined ||
			this.audit === undefined ||
			this.instructor === undefined
		);
	}
}
