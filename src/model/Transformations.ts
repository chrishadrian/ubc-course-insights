import {Node} from "./WhereRe";
import QueryHelper from "../util/PerformQueryHelper";
import {InsightError} from "../controller/IInsightFacade";

export default class Transformations {

	private datasetID: string;
	private group: Set<string>;
	private apply: Node[];
	private applyKeys: Set<string>;
	private queryHelper = new QueryHelper();

	constructor(obj: unknown) {
		this.apply = [];
		this.applyKeys = new Set<string>();
		let keys = this.queryHelper.getKeysHelper(obj);
		if (keys.length !== 2 && keys[0] !== "GROUP" && keys[1] !== "APPLY") {
			throw new InsightError();
		}
		let transformations = obj as any;
		[this.group, this.datasetID] = this.parseGroup(transformations[keys[0]]);
		if (this.datasetID === "") {
			throw new InsightError("invalid id");
		}
		this.parseApply(transformations[keys[1]]);
	}

	private parseApply(apply: Node[]) {
		let currID: string;
		let currNode: Node;
		let currApplyKey: string;
		for (let i of apply) {
			[currNode, currApplyKey] = this.handleApplyRule(i);
			if (this.applyKeys.has(currApplyKey)) {
				throw new InsightError("apply key defined twice in APPLY");
			}
			this.applyKeys.add(currApplyKey);
			this.apply.push({[currApplyKey]: currNode});
		}
	}

	private handleApplyRule(applyRule: Node): [Node, string] {
		let keys = this.queryHelper.getKeysHelper(applyRule);
		if (keys.length !== 1 || !this.queryHelper.validateApplyKey(keys[0])) {
			throw new InsightError("too many keys in apply rule");
		}
		let applyTokenKey = applyRule[keys[0]] as Node;
		let [tokenKey, id] = this.handleApplyTokenKey(applyTokenKey);
		if (id !== this.datasetID) {
			throw new InsightError("multiple ids referenced");
		}
		return [{[keys[0]]: tokenKey}, keys[0]];
	}

	private handleApplyTokenKey(tokenKey: Node): [Node, string] {
		let keys = this.queryHelper.getKeysHelper(tokenKey);
		if (keys.length !== 1) {
			throw new InsightError("too many keys in apply token");
		}
		let key = tokenKey[keys[0]] as string;
		let id = "";
		let field = "";
		switch (keys[0]) {
			case "COUNT":
				if (!(this.queryHelper.validateRoomsMKey(key) ||
					this.queryHelper.validateRoomsSKey(key) ||
					this.queryHelper.validateSectionsMKey(key) ||
					this.queryHelper.validateSectionsSKey(key))) {
					throw new InsightError();
				}
				[id, field] = this.queryHelper.extractFieldIDString(key);
				return [{COUNT: field}, id];
			case "MIN":
			case "AVG":
			case "SUM":
			case "MAX":
				if (!(this.queryHelper.validateRoomsMKey(key) ||
					this.queryHelper.validateSectionsMKey(key))) {
					throw new InsightError();
				}
				[id, field] = this.queryHelper.extractFieldIDString(key);
				return [{[keys[0]]: field}, id];
			default:
				throw new InsightError("invalid apply token");
		}
	}

	private parseGroup(obj: unknown): [Set<string>, string] {
		let strs: string[] = obj as string[];
		if (strs.length < 1) {
			throw new InsightError("no group specified");
		}
		let groupFields = new Set<string>();
		let id = "";
		for (let i of strs) {
			if (!(this.queryHelper.validateRoomsMKey(i) ||
			this.queryHelper.validateRoomsSKey(i) ||
			this.queryHelper.validateSectionsMKey(i) ||
			this.queryHelper.validateSectionsSKey(i))) {
				throw new InsightError("invalid group key");
			}
			let [currId, field] = this.queryHelper.extractFieldIDString(i);
			if (id !== "" && id !== currId) {
				throw new InsightError("more than one dataset specified in group");
			}
			id = currId;
			groupFields.add(field);
		}
		return [groupFields, id];
	}

	// getters
	public getdatasetID(): string {
		return this.datasetID;
	}

	public getGroup(): Set<string> {
		return this.group;
	}

	public getApply(): Node[] {
		return this.apply;
	}

	public getApplyKeys(): Set<string> {
		return this.applyKeys;
	}

}
