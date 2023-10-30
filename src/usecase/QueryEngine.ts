import * as fs from "fs-extra";
import Transformations from "../model/Transformations";
import WhereRe, {Node} from "../model/WhereRe";
import Options from "../model/Options";
import {InsightError, InsightResult, NotFoundError, ResultTooLargeError} from "../controller/IInsightFacade";

export enum Logic {
	OR = "OR",
	AND = "AND",
	NOT = "NOT",
}

export enum ApplyToken {
	MAX = "MAX",
	MIN = "MIN",
	AVG = "AVG",
	SUM = "SUM"
}

export class Query {
	public whereBlock: Node;
	public optionsBlock: Options;
	public transformationsBlock?: Transformations;
	constructor(w: Node, o: Options, t?: Transformations) {
		this.whereBlock = w;
		this.optionsBlock = o;
		this.transformationsBlock = t;
	}
}

export default class QueryEngine {

	private whereDeveloper = new WhereRe();
	public parseQuery(query: unknown): Query {
		// throw new InsightError();
		if (!this.validRoot(query)) {
			throw new InsightError("Initial structure of query is incorrect");
		}
		let q = query as any;
		let [whereBlock, id] = this.whereDeveloper.handleWhere(q["WHERE"]);
		let optionsBlock = this.handleOptions(q["OPTIONS"]);
		if (id !== "" && optionsBlock.getDatasetID() !== id) {
			throw new InsightError("two different dataset ideas in WHERE and OPTIONS");
		}
		let keys = this.getKeysHelper(query);
		let parsed;
		if (keys.length !== 3) {
			return parsed = new Query(whereBlock, optionsBlock);
		}
		let transformationsBlock = new Transformations(q["TRANSFORMATIONS"]);
		return parsed = new Query(whereBlock, optionsBlock, transformationsBlock);
	}

	// return false if first query node does not have WHERE or Options, or more than one
	// with help from
	// https://stackoverflow.com/questions/38616612/javascript-elegant-way-to-check-object-has-required-properties
	// https://stackoverflow.com/questions/126100/how-to-efficiently-count-the-number-of-keys-properties-of-an-object-
	// in-javascrip
	// https://bobbyhadz.com/blog/typescript-type-unknown-is-not-assignable-to-type
	private validRoot(query: unknown): boolean {
		let keys = this.getKeysHelper(query);
		if (keys.length === 2) {
			return keys[0] === "WHERE" && keys[1] === "OPTIONS";
		} else if (keys.length === 3) {
			return keys[0] === "WHERE" && keys[1] === "OPTIONS" && keys[2] === "TRANSFORMATIONS";
		}
		return false;
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

	private extractFieldIDString(str: string): [string,string] {
		let l = str.length;
		let id: string = "";
		let field: string = "";
		let seen: boolean = false;
		for (let i = 0; i < l; i++) {
			if (seen === true) {
				field = field + str[i];
			} else if (str[i] === "_") {
				seen = true;
			} else if (seen === false) {
				id = id + str[i];
			}
		}
		return [id, field];
	}

	private extractField(str: string): string {
		let l = str.length;
		let field: string = "";
		let seen: boolean = false;
		for (let i = 0; i < l; i++) {
			if (seen === true) {
				field = field + str[i];
			} else if (str[i] === "_") {
				seen = true;
			}
		}
		return field;
	}

	private extractIDString(str: string): string {
		let l = str.length;
		let id: string = "";
		for (let i = 0; i < l; i++) {
			if (str[i] === "_") {
				break;
			}
			id = id + str[i];
		}
		return id;
	}

	private getKeysHelper(obj: unknown): string[] {
		let keys = [];
		for (const i in obj as any) {
			keys.push(i);
		}
		return keys;
	}

	private handleOptions(opts: unknown) {
		if (!this.validOpts(opts)) {
			throw new InsightError("Options structure invalid");
		}
		let keys = this.getKeysHelper(opts);
		let o = opts as any;
		let cols: string[];
		let id: string;
		[id, cols] = this.handleCols(o[keys[0]]);
		if (keys.length === 2) {
			if (!this.validateMSKey(o[keys[1]])) {
				throw new InsightError("the key provided in order is incorrectly formatted");
			}
			let [orderKey, orderField] = this.extractFieldIDString(o[keys[1]]);
			// let orderKey = this.extractIDString(o[keys[1]]);
			// let orderField = this.extractField(o[keys[1]]);
			if (orderKey !== id) {
				throw new InsightError("multiple order keys found");
			}
			let invalidOrderField: boolean = true;
			for (let i of cols) {
				if (i === orderField) {
					invalidOrderField = false;
					break;
				}
			}
			if (invalidOrderField) {
				throw new InsightError("invalid order field");
			}
			// options has the id already, just need to add fields
			return new Options(id, cols, orderField);
		}
		return new Options(id, cols);
	}

	private handleCols(obj: unknown): [string, string[]] {
		let strs: string[] = obj as string[];
		let id: string = "";
		let cols: string[] = [];
		if (strs.length < 1) {
			throw new InsightError("no columns specified");
		}
		for (let i of strs) {
			// FIX THIS
			if (!this.validateMSKey(i)) {
				throw new InsightError("invalid key in cols");
			}
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
}
