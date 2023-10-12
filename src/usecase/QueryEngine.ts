import * as fs from "fs-extra";
import WhereRe, {Node} from "../model/WhereRe";
import Where, {FieldFilters, Range, MField, SField, Logic} from "../model/Where";
import Options from "../model/Options";
import {InsightError, InsightResult, NotFoundError, ResultTooLargeError} from "../controller/IInsightFacade";

export class Query {
	public whereBlock: Node;
	public optionsBlock: Options;
	constructor(w: Node, o: Options) {
		this.whereBlock = w;
		this.optionsBlock = o;
	}
}

export default class QueryEngine {
	private whereDeveloper = new WhereRe();
	public parseQuery(query: unknown): Query {
		if (!this.validRoot(query)) {
			throw new InsightError("Initial structure of query is incorrect");
		}
		let q = query as any;
		let [whereBlock, id] = this.whereDeveloper.handleWhere(q["WHERE"]);
		let optionsBlock = this.handleOptions(q["OPTIONS"]);
		if (id !== "" && optionsBlock.getDatasetID() !== id) {
			throw new InsightError("two different dataset ideas in WHERE and OPTIONS");
		}
		let parsed = new Query(whereBlock, optionsBlock);
		return parsed;
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
			let orderKey = this.extractIDString(o[keys[1]]);
			let orderField = this.extractField(o[keys[1]]);
			if (orderKey !== id) {
				throw new InsightError("multiple order keys found");
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
}
