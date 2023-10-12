import * as fs from "fs-extra";
import Where, {FieldFilters, Range, MField, SField, Logic} from "../model/Where";
import Options from "../model/Options";
import {InsightError, InsightResult, NotFoundError, ResultTooLargeError} from "../controller/IInsightFacade";

export class Query {
	public whereBlock;
	public optionsBlock;
	constructor(w: Where, o: Options) {
		this.whereBlock = w;
		this.optionsBlock = o;
	}
}

export default class QueryEngine {
	public parseQuery(query: unknown): Query {
		if (!this.validRoot(query)) {
			throw new InsightError("Initial structure of query is incorrect");
		}
		let q = query as any;
		try {
			let whereBlock = this.handleWhere(q["WHERE"]);
			let optionsBlock = this.handleOptions(q["OPTIONS"]);
			let parsed = new Query(whereBlock, optionsBlock);
			return parsed;
		} catch {
			throw new InsightError("Some incorrect structure");
		}
	}

	// return false if first query node does not have WHERE or Options, or more than one
	// with help from
	// https://stackoverflow.com/questions/38616612/javascript-elegant-way-to-check-object-has-required-properties
	// https://stackoverflow.com/questions/126100/how-to-efficiently-count-the-number-of-keys-properties-of-an-object-
	// in-javascrip
	// https://bobbyhadz.com/blog/typescript-type-unknown-is-not-assignable-to-type
	private validRoot(query: unknown): boolean {
		let keys = this.getKeysHelper(query);
		return keys.length === 2 && keys[0] === "WHERE" && keys[1] === "OPTIONS";
	}

	private validWhere(where: unknown): boolean {
		let keys = this.getKeysHelper(where);
		return keys.length === 1 || keys.length === 0;
	}

	private validOpts(opts: unknown): boolean {
		let keys = this.getKeysHelper(opts);
		return (keys.length === 1 || (keys.length === 2 && keys[1] === "ORDER")) && keys[0] === "COLUMNS";
	}

	private validateMSKey(key: string): boolean {
		const validKeyRegex = new RegExp(
			"[^_]+_((avg)|(pass)|(fail)|(audit)|(year)|(dept)|(id)|(instructor)|(title)|(uuid))"
		);
		return validKeyRegex.test(key);
	}

	private validateSKey(key: string): boolean {
		const validateSKeyRegex = new RegExp("[^_]+_((dept)|(id)|(instructor)|(title)|(uuid))");
		return validateSKeyRegex.test(key);
	}

	private validateInputString(input: string): boolean {
		const inputStringRegex = new RegExp("[*]{0,1}[^*]*[*]{0,1}");
		return inputStringRegex.test(input);
	}

	private validateMKey(key: string): boolean {
		const validateMKeyRegex = new RegExp("[^_]+_((avg)|(pass)|(fail)|(audit)|(year))");
		return validateMKeyRegex.test(key);
	}

	private validateMSComp(obj: unknown): boolean {
		let keys = this.getKeysHelper(obj);
		return keys.length === 1;
	}

	private extractField(str: string): string {
		let field = str.split("_", 2);
		return field[1];
	}

	private extractIDString(str: string): string {
		let key = str.split("_", 2);
		return key[0];
	}

	private getKeysHelper(obj: unknown): string[] {
		let keys = [];
		for (const i in obj as any) {
			keys.push(i);
		}
		return keys;
	}

	private handleWhere(obj: unknown): Where {
		if (!this.validWhere(obj)) {
			throw new InsightError("WHERE has too many keys");
		}
		let keys = this.getKeysHelper(obj);
		if (keys.length === 0) {
			return new Where();
		}
		let w = obj as any;
		let id: string;
		let filters = new FieldFilters();
		let fields, values, field, value;
		let logic: Logic = Logic.AND;
		try {
			switch (keys[0]) {
				case "IS":
					[id, field, value] = this.handleSComp(w[keys[0]], "");
					filters.addToQueryTree(Logic.AND, [field], [[value]]);
					break;
				case "NOT":
					[id, field, value] = this.handleNot(w[keys[0]], "");
					filters.addToQueryTree(Logic.NOT, [field], [value]);
					break;
				case "OR":
					logic = Logic.OR;
				case "AND":
					[id, fields, values] = this.handleLogic(w[keys[0]], "");
					filters.addToQueryTree(logic, fields, values);
					break;
				case "LT":
				case "GT":
				case "EQ":
					[id, field, value] = this.handleMComp(w[keys[0]], "");
					filters.addToQueryTree(Logic.AND, [field], [[keys[0], value]]);
					break;
				default:
					throw new InsightError("Where clause has invalid filter");
			}
			let whereBlock = new Where(id, filters);
			return whereBlock;
		} catch {
			throw new InsightError("problems in the filters");
		}
	}

	private handleOptions(opts: unknown) {
		if (!this.validOpts(opts)) {
			throw new InsightError("Options structure invalid");
		}
		try {
			let keys = this.getKeysHelper(opts);
			let o = opts as any;
			let cols: string[];
			let id: string;
			[id, cols] = this.handleCols(o[keys[0]]);
			if (keys.length === 2) {
				if (!this.validateMSKey(o[keys[1]])) {
					throw new InsightError("the key provided in order is incorrectly formatted");
				}
				let orderKey = this.extractIDString(o[keys[1]]);
				let orderField = this.extractField(o[keys[1]]);
				if (orderKey !== id) {
					throw new InsightError("multiple order keys found");
				}
				// options has the id already, just need to add fields
				return new Options(id, cols, orderField);
			}
			return new Options(id, cols);
		} catch {
			throw new InsightError("part of columns or order incorrect");
		}
	}

	private handleCols(obj: unknown): [string, string[]] {
		let strs: string[] = obj as string[];
		let id: string = "";
		let cols: string[] = [];
		if (strs.length < 1) {
			throw new InsightError("no columns specified");
		}
		for (let i of strs) {
			this.validateMSKey(i);
			let currId = this.extractIDString(i);
			if (id !== "" && id !== currId) {
				throw new InsightError("more than one dataset specified in columns");
			}
			let field = this.extractField(i);
			id = currId;
			cols.push(field);
		}
		return [id, cols];
	}

	private handleSComp(obj: unknown, idString: string): [string, string, string] {
		if (!this.validateMSComp(obj)) {
			throw new InsightError("incorrectly formatted string comparison");
		}
		let key = this.getKeysHelper(obj);
		if (!this.validateSKey(key[0])) {
			throw new InsightError("incorrectly formatted s key");
		}
		let id: string = this.extractIDString(key[0]);
		if (idString !== "" && idString !== id) {
			throw new InsightError("too many datasets referenced");
		}
		let s = obj as any;
		if (!this.validateInputString(s[key[0]])) {
			throw new InsightError("invalid input string");
		}
		let field = this.extractField(key[0]);
		let value = this.getRegex(s[key[0]]);
		return [id, field, value];
	}

	private getRegex(value: string): string {
		let regex: string = "(";
		let length = value.length;
        	for (let i = 0; i < length; i++) {
        		if (value[i] === "*") {
        			regex = regex + ".*";
        		} else {
        			regex = regex + value[i];
        		}
        	}
        		regex = regex + ")";
		return regex;
	}

	private handleLogic(obj: unknown, idString: string): [string, string[], string[][]] {
		let keys = this.getKeysHelper(obj);
		if (keys.length < 1) {
			throw new InsightError("empty AND/OR");
		}
		let w =  obj as any;
		let id: string = "";
		let fields: string[] = [];
		let values: string[][] = [];
		return [id, fields, values];
	}

	private handleMComp(obj: unknown, idString: string): [string, string, string] {
		if (!this.validateMSComp(obj)) {
			throw new InsightError("incorrectly formatted math comparison");
		}
		let key = this.getKeysHelper(obj);
		if (!this.validateMKey(key[0])) {
			throw new InsightError("incorrectly formatted s key");
		}
		let id: string = this.extractIDString(key[0]);
		if (idString !== "" && idString !== id) {
			throw new InsightError("too many datasets referenced");
		}
		let s = obj as any;
		if (!this.validateInputString(s[key[0]])) {
			throw new InsightError("invalid input string");
		}
		let field = this.extractField(key[0]);
		return [id, field, s[key[0]]];
	}

	private handleNot(obj: unknown, idString: string): [string, string, string[]] {
		return ["", "", []];
	}
}
