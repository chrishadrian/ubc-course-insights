import * as fs from "fs-extra";
export enum Logic {
	OR = "OR",
	AND = "AND",
	NOT = "NOT",
}
export class Range {
	private min: number;
	private max: number;

	constructor(min: number, max: number) {
		this.min = min;
		this.max = max;
	}
	public setMin(minimum: number) {
		this.min = minimum;
	}

	public setMax(maximum: number) {
		this.max = maximum;
	}

	public getMin(): number {
		return this.min;
	}

	public getMax(): number {
		return this.max;
	}
}

export class MField {
	private avg: Range[];
	private pass: Range[];
	private fail: Range[];
	private audit: Range[];
	private year: Range[];

	constructor() {
		this.avg = [];
		this.pass = [];
		this.fail = [];
		this.audit = [];
		this.year = [];
	}

	public addAvg(avg: Range) {
		this.avg.push(avg);
	}

	public addPass(pass: Range) {
		this.pass.push(pass);
	}

	public addFail(fail: Range) {
		this.fail.push(fail);
	}

	public addAudit(audit: Range) {
		this.audit.push(audit);
	}

	public addYear(year: Range) {
		this.year.push(year);
	}
}

export class SField {
	private sFields: Map<string, string>;

	constructor() {
		this.sFields = new Map();
	}

	public setSField(type: string, value: string, logic: Logic) {
		if (logic === Logic.NOT) {
			this.setNot(type, value);
		} else if (logic === Logic.AND) {
			this.setAnd(type, value);
		} else {
			this.setOr(type, value);
		}
	}

	private getRegex(value: string): string {
		let regex: string = "(";
        	for (let i = 1; i < value.length; i++) {
        		if (value[i] === "*") {
        			regex = regex + ".*";
        		} else {
        			regex = regex + value[i];
        		}
        	}
        		regex = regex + ")";
		return regex;
	}

	private setOr(type: string, value: string) {
		let regex: string = "(";
		for (let i = 1; i < value.length; i++) {
			if (value[i] === "*") {
				regex = regex + ".*";
			} else {
				regex = regex + value[i];
			}
		}
		regex = regex + ")";
		let old = this.sFields.get(type);
		if (!old) {
			this.sFields.set(type, regex);
		} else {
			this.sFields.set(type, old + "|" + regex);
		}
	}

	private setAnd(type: string, value: string) {
		let old = this.sFields.get(type);
		if (!old) {
			let regex = this.getRegex(value);
			this.sFields.set(type, regex);
			return;
		}
		// help for "anding" regex expressions from:
		// https://stackoverflow.com/questions/469913/regular-expressions-is-there-an-and-operator
		let regex = this.getRegex(value);
		regex = "^(^" + old + "|^" + regex + ")";
		this.sFields.set(type, regex);
	}

	private setNot(type: string, value: string) {
		// like the and operator, but without the extra not in front of the current regex!
		let old = this.sFields.get(type);
		if (!old) {
        	let regex = this.getRegex(value);
        	this.sFields.set(type, regex);
        	return;
		}
		let regex = this.getRegex(value);
		regex = "^(^" + old + "|" + regex + ")";
		this.sFields.set(type, regex);
	}
}

export class FieldFilters {
	private mField: MField;
	private sField: SField;

	constructor() {
		this.mField = new MField();
		this.sField = new SField();
	}

	public setMField(m: MField) {
		this.mField = m;
	}
	public addSField(type: string, value: string, logic: Logic) {
		this.sField.setSField(type, value, logic);
	}

	public getMField(): MField {
		return this.mField;
	}

	public getSField(): SField {
		return this.sField;
	}
}

export default class Where {
	private setId: string;
	private filters: FieldFilters;

	constructor(idstring?: string, filters?: FieldFilters) {
		this.setId = idstring || "";
		this.filters = filters || new FieldFilters();
	}

	public setSetId(id: string) {
		this.setId = id;
	}

	public setFilters(filters: FieldFilters) {
		this.filters = filters;
	}

	public getFilters(): FieldFilters {
		return this.filters;
	}

	public getSetId(): string {
		return this.setId;
	}
}
