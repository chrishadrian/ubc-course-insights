import * as fs from "fs-extra";
import Transformations from "../model/Transformations";
import WhereRe, {Node} from "../model/WhereRe";
import Options from "../model/Options";
import {InsightError, InsightResult, NotFoundError, ResultTooLargeError} from "../controller/IInsightFacade";
import QueryHelper from "../util/PerformQueryHelper";

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

interface IQuery {
	WHERE: object;
	OPTIONS: object;
}

export default class QueryEngine {

	private whereDeveloper = new WhereRe();
	private helper = new QueryHelper();

	public parseQuery(query: unknown): Query {
		// throw new InsightError();
		if (!this.validRoot(query)) {
			throw new InsightError("Initial structure of query is incorrect");
		}
		let q = query as any;
		let parsed;
		let [whereBlock, id] = this.whereDeveloper.handleWhere(q["WHERE"]);
		let keys = this.getKeysHelper(query);
		if (keys.length !== 3) {
			let optionsBlock = this.handleOptions(q["OPTIONS"]);
			if (id !== "" && optionsBlock.getDatasetID() !== id) {
				throw new InsightError("two different dataset ideas in WHERE and OPTIONS");
			}
			return parsed = new Query(whereBlock, optionsBlock);
		}
		let transformationsBlock = new Transformations(q["TRANSFORMATIONS"]);
		let optionsBlock = this.handleTransformationsOptions(q["OPTIONS"], transformationsBlock);
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

	private validateRoomsKey(key: string): boolean {
		return this.helper.validateRoomsMKey(key) || this.helper.validateRoomsSKey(key);
	}

	private validateMSKey(key: string): boolean {
		return this.helper.validateSectionsMKey(key) || this.helper.validateSectionsSKey(key);
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

	private handleTransformationsOptions(opts: unknown, trans: Transformations): Options {
		if (!this.validOpts(opts)) {
			throw new InsightError("Options structure invalid");
		}
		let keys = this.getKeysHelper(opts);
		let o = opts as any;
		let cols: string[];
		let id: string;
		[id, cols] = this.handleTransformationsCols(o[keys[0]], trans);
		if (keys.length === 2) {
			let orderFields: string[];
			let orderDirection: string;
			[orderFields, orderDirection] = this.handleOrder(o[keys[1]], cols, id);
			return new Options(id, cols, orderFields, orderDirection);
		}
		return new Options(id, cols);
	}

	private handleOrder(obj: unknown, cols: string[], id: string): [string[], string] {
		let order = obj as any;
		let keys = this.helper.getKeysHelper(order);
		let orderFields = [];
		let orderKeys: string[] = [];
		let direction = "";
		if (keys.length === 2) {
			if (!(keys[0] === "dir" && keys[1] === "keys")) {
				throw new InsightError("incorrect order format");
			}
			if (!(order[keys[0]] === "UP" || order[keys[0]] === "DOWN")) {
				throw new InsightError("incorrect direction");
			}
			direction = order[keys[0]];
			orderKeys = order[keys[1]];
		} else {
			orderKeys = [order as string];
		}
		if (orderKeys.length < 1) {
			throw new InsightError("unspecified order");
		}
		for (let i of orderKeys) {
			let field: string;
			let currID: string;
			if (this.validateMSKey(i) || this.validateRoomsKey(i)) {
				[currID, field] = this.extractFieldIDString(i);
				if (currID !== id) {
					throw new InsightError("multiple ids referenced");
				}
			} else {
				field = i;
			}
			this.checkOrder(cols, field);
			orderFields.push(field);
		}
		return [orderFields, direction];
	}

	private handleTransformationsCols(obj: unknown, trans: Transformations): [string, string[]] {
		let strs: string[] = obj as string[];
		let id: string = trans.getdatasetID();
		let cols: string[] = [];
		if (strs.length < 1) {
			throw new InsightError("no columns specified");
		}
		let applyKeys = trans.getApplyKeys();
		let groups = trans.getGroup();
		for (let i of strs) {
			let field;
			if (this.validateMSKey(i) || this.validateRoomsKey(i)) {
				let currId = this.extractIDString(i);
				if (id !== currId) {
					throw new InsightError("more than one dataset specified in columns");
				}
				field = this.extractField(i);
			} else {
				field = i;
			}
			if (!(applyKeys.has(field) || (groups.has(field)))) {
				throw new InsightError("Columns keys do not correspond to group or applyKeys");
			}
			cols.push(field);
		}
		return [id, cols];
	}

	private handleOptions(opts: unknown): Options {
		if (!this.validOpts(opts)) {
			throw new InsightError("Options structure invalid");
		}
		let keys = this.getKeysHelper(opts);
		let o = opts as any;
		let cols: string[];
		let id: string;
		[id, cols] = this.handleCols(o[keys[0]]);
		if (keys.length === 2) {
			let orderFields: string[];
			let orderDirection: string;
			[orderFields, orderDirection] = this.handleOrder(o[keys[1]], cols, id);
			return new Options(id, cols, orderFields, orderDirection);
		}
		return new Options(id, cols);
	}

	private checkOrder(cols: string[], orderField: string) {
		let invalidOrderField: boolean = true;
		for (let i of cols) {
			if (i === orderField) {
				invalidOrderField = false;
				break;
			}
		}
		if (invalidOrderField) {
			throw new InsightError(orderField);
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
			if (!(this.validateMSKey(i) || this.validateRoomsKey(i))) {
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
