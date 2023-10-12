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
	private mFields: Map<string, Range[]>;

	constructor() {
		this.mFields = new Map();
	}

	public setMField(type: string, value: Range, logic: Logic) {
		return;
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

export class QueryTree {
	private logic: Logic[];
	private keys: string[][];
	private values: string[][][];

	constructor() {
		this.logic = [];
		this.keys = [];
		this.values = [];
	}

	public getLogic(): Logic[] {
		return this.logic;
	}

	public getKeys(): string[][] {
		return this.keys;
	}

	public getValues(): string[][][] {
		return this.values;
	}

	public addLogic(l: Logic) {
		this.logic.push(l);
	}

	public addKeys(k: string[]) {
		this.keys.push(k);
	}

	public addValues(v: string[][]) {
		this.values.push(v);
	}
}

export class FieldFilters {
	private mField: MField;
	private sField: SField;
	private queryTree: QueryTree;

	constructor() {
		this.mField = new MField();
		this.sField = new SField();
		this.queryTree = new QueryTree();
	}

	public addToQueryTree(logic: Logic, keys: string[], values: string[][]) {
		this.queryTree.addLogic(logic);
		this.queryTree.addKeys(keys);
		this.queryTree.addValues(values);
	}

	public getQueryTree(): QueryTree {
		return this.queryTree;
	}

	public addSField(type: string, value: string, logic: Logic) {
		this.sField.setSField(type, value, logic);
	}

	public addMField(type: string, value: Range, logic: Logic) {
		this.mField.setMField(type, value, logic);
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
