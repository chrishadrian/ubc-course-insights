import * as fs from "fs-extra";
import Where, {FieldFilters, Range, MField, SField} from "../model/Where";
import Options from "../model/Options";
import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";

export class Query {
	private whereBlock;
	private optionsBlock;
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
		return keys.length === 1 || (keys.length === 0);
	}

	private getKeysHelper(obj: unknown): string[] {
		let keys = [];
		for (const i in obj as any) {
        	keys.push(i);
		}
		return keys;
	}


	public handleWhere(obj: unknown): Where {
		if (!this.validWhere(obj)) {
			throw new InsightError("WHERE has too many keys");
		}
		let keys = this.getKeysHelper(obj);
		if (keys.length === 0) {
			return new Where();
		}
		let w = obj as any;
		let id: string;
		let filters;
		try {
			switch (keys[0]) {
				case "IS":
					[id, filters] = this.handleSComp(w[keys[0]], "");
					break;
				case "NOT":
					[id, filters] = this.handleNot(w[keys[0]], "");
					break;
				case "AND":
				case "OR":
					[id, filters] = this.handleLogic(w[keys[0]], "");
					break;
				case "LT":
				case "GT":
				case "EQ":
					[id, filters] = this.handleMComp(w[keys[0]], "");
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

	private handleOptions(query: unknown) {
		return new Options("", []);
	}


	private handleSComp(obj: unknown, idString: string): [string, FieldFilters] {
    	return ["", new FieldFilters()];
	}

	private handleLogic(obj: unknown, idString: string): [string, FieldFilters] {
        	return ["", new FieldFilters()];
	}

	private handleMComp(obj: unknown, idString: string): [string, FieldFilters] {
        	return ["", new FieldFilters()];
	}

	private handleNot(obj: unknown, idString: string): [string, FieldFilters] {
        	return ["", new FieldFilters()];
	}
}
