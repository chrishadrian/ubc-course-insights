import * as fs from "fs-extra";
import QueryNode from "./QueryNode";

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
	private dept: string[];
	private id: string[];
	private instructor: string[];
	private title: string[];
	private uuid: string[];
	constructor() {
		this.dept = [];
		this.id = [];
		this.instructor = [];
		this.title = [];
		this.uuid = [];
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
	public setSField(s: SField) {
		this.sField = s;
	}

	public getMField(): MField {
		return this.mField;
	}

	public getSField(): SField {
		return this.sField;
	}
}

export default class Where {
	private child?: QueryNode;
	private setId: string;
	private filters: FieldFilters;

	constructor(idstring?: string, child?: QueryNode, filters?: FieldFilters) {
		this.setId = idstring || "";
		this.child = child;
		this.filters = filters || new FieldFilters();
	}

	// adds Child to QueryNode (validation occurs in QueryEngine)
	public addChild(child: QueryNode) {
		this.child = child;
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
