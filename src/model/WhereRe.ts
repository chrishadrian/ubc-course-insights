import {InsightError} from "../controller/IInsightFacade";
import QueryHelper from "../util/PerformQueryHelper";
export interface Node {
	[key: string]: string | number | Node[] | Node;
}
export default class WhereRe {
	private helper = new QueryHelper();

	private validateKey(key: string, isSkey: boolean): boolean {
		if (isSkey) {
			const validateSKeyRegex = new RegExp("^([^_]+_((dept)|(id)|(instructor)|(title)|(uuid)))$");
			return validateSKeyRegex.test(key);
		}
		const validateMKeyRegex = new RegExp("^([^_]+_((avg)|(pass)|(fail)|(audit)|(year)))$");
		return validateMKeyRegex.test(key);
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

	private validateInputString(input: string): boolean {
		const inputStringRegex = new RegExp("^[*]?[^*]*[*]?$");
		return inputStringRegex.test(input);
	}

	private getRegex(value: string): string {
		let checkWildcard = new RegExp("[*]");
		if (!checkWildcard.test(value)) {
			return value;
		}
		let regex: string = "^(";
		let length = value.length;
		for (let i = 0; i < length; i++) {
			if (value[i] === "*") {
				regex = regex + ".*";
			} else {
				regex = regex + value[i];
			}
		}
		return regex + ")$";
	}

	private getKeysHelper(obj: unknown): string[] {
		let keys = [];
		for (const i in obj as any) {
			keys.push(i);
		}
		return keys;
	}

	private handleSComp(scomp: Node): [Node, string] {
		let keys = this.getKeysHelper(scomp);
		if (keys.length !== 1 || !this.validateKey(keys[0], true)) {
			throw new InsightError();
		}
		if (!this.validateInputString(scomp[keys[0]] as string)) {
			throw new InsightError();
		}
		let [id, field]: [string, string] = this.extractFieldIDString(keys[0]);
		if (typeof scomp[keys[0]] !== "string") {
			throw new InsightError();
		}
		let value = this.getRegex(scomp[keys[0]] as string);
		let newNode: Node = {[field]: value};
		return [newNode, id];
	}

	private handleNotSComp(scomp: Node): [Node, string] {
		let keys = this.getKeysHelper(scomp);
		if (keys.length !== 1 || !this.validateKey(keys[0], true)) {
			throw new InsightError();
		}
		if (!this.validateInputString(scomp[keys[0]] as string)) {
			throw new InsightError();
		}
		let [id, field]: [string, string] = this.extractFieldIDString(keys[0]);
		if (typeof scomp[keys[0]] !== "string") {
			throw new InsightError();
		}
		let value = "^(?!^(" + this.getRegex(scomp[keys[0]] as string) + ")$)[*]{0,0}";
		let newNode: Node = {[field]: value};
		return [newNode, id];
	}

	private handleMComp(mcomp: Node): [Node, string] {
		let keys = this.getKeysHelper(mcomp);
		if (keys.length !== 1 || !this.validateKey(keys[0], false)) {
			throw new InsightError();
		}
		let [id, field]: [string, string] = this.extractFieldIDString(keys[0]);
		if (typeof mcomp[keys[0]] !== "number") {
			throw new InsightError();
		}
		let value = mcomp[keys[0]] as number;
		let newNode: Node = {[field]: value};
		return [newNode, id];
	}

	private handleLogic(logic: Node[]): [Node[], string] {
		if (logic.length < 1) {
			throw new InsightError("empty logic");
		}
		let orAndNodes: Node[] = [];
		let nodes: Node[] = [];
		let idPrev: string;
		let id: string = "";
		let child: Node;
		let children: Node[];
		for (let i of logic) {
			let keys = this.getKeysHelper(i as Node);
			if (keys.length !== 1) {
				throw new InsightError("this is not a proper query node");
			}
			idPrev = id;
			switch (keys[0]) {
				case "IS": [child, id] = this.handleSComp(i[keys[0]] as Node);
					nodes.push({IS: child} as Node);
					break;
				case "NOT": [child, id] = this.handleNot(i[keys[0]] as Node);
					if ("OR" in child || "AND" in child) {
						orAndNodes.push(child);
						break;
					}
					nodes.push(child);
					break;
				case "OR":
				case "AND": [children, id] = this.handleLogic(i[keys[0]] as Node[]);
					orAndNodes.push({[keys[0]]: children} as Node);
					break;
				case "LT":
				case "GT":
				case "EQ": [child, id] = this.handleMComp(i[keys[0]] as Node);
					nodes.push({[keys[0]]: child});
					break;
				default:
					throw new InsightError("Logic Node has invalid filter");
			}
			if (idPrev !== "" && idPrev !== id) {
				throw new InsightError("multiple ids found");
			}
		}
		return [orAndNodes.concat(nodes), id];
	}

	private handleNotMComp(mcomp: Node, comp: string): [Node, string] {
		let keys = this.getKeysHelper(mcomp);
		if (keys.length !== 1 || !this.validateKey(keys[0], false)) {
			throw new InsightError();
		}
		let [id, field]: [string, string] = this.extractFieldIDString(keys[0]);
		if (typeof mcomp[keys[0]] !== "number") {
			throw new InsightError();
		}
		let value = mcomp[keys[0]] as number;
		let nodes: Node[] = [];
		if (comp === "LT") {
			nodes.push({GT: {[field]: value}});
			nodes.push({EQ: {[field]: value}});
		} else if (comp === "GT") {
			nodes.push({LT: {[field]: value}});
			nodes.push({EQ: {[field]: value}});
		} else {
			nodes.push({GT: {[field]: value}});
			nodes.push({LT: {[field]: value}});
		}
		return [{OR: nodes}, id];
	}

	private handleNotLogic(logic: Node[], key: string): [Node, string] {
		if (logic.length < 1) {
			throw new InsightError("empty logic");
		}
		let orAndNodes: Node[] = [];
		let nodes: Node[] = [];
		let idPrev: string;
		let id: string = "";
		let child: Node;
		for (let i of logic) {
			idPrev = id;
			[child, id] = this.handleNot(i);
			if (idPrev !== "" && idPrev !== id) {
				throw new InsightError("multiple ids found");
			}
			if ("OR" in child || "AND" in child) {
				orAndNodes.push(child);
			} else {
				nodes.push(child);
			}
		}
		if (key === "AND") {
			return [{OR: orAndNodes.concat(nodes)}, id];
		} else {
			return [{AND: orAndNodes.concat(nodes)}, id];
		}
	}

	private handleNode(obj: Node): [Node, string] {
		let keys = this.getKeysHelper(obj);
		if (keys.length !== 1) {
			throw new InsightError("this node has too many filters");
		}
		let id: string = "";
		let node: Node = {};
		let child: Node = {};
		let children: Node[] = [];
		switch (keys[0]) {
			case "IS": [child, id] = this.handleSComp(obj[keys[0]] as Node);
				node = {[keys[0]]: child};
				break;
			case "NOT": [node, id] = this.handleNot(obj[keys[0]] as Node);
				break;
			case "OR":
			case "AND": [children, id] = this.handleLogic(obj[keys[0]] as Node[]);
				node = {[keys[0]]: children};
				break;
			case "LT":
			case "GT":
			case "EQ": [child, id] = this.handleMComp(obj[keys[0]] as Node);
				node = {[keys[0]]: child};
				break;
			default:
				throw new InsightError("node has invalid filter");
		}
		return [node, id];
	}

	private handleNot(not: Node): [Node, string] {
		let keys = this.getKeysHelper(not);
		if (keys.length !== 1) {
			throw new InsightError("this NOT has too many filters");
		}
		let node: Node = {};
		let id: string = "";
		let child: Node;
		switch (keys[0]) {
			case "IS": [child, id] = this.handleNotSComp(not[keys[0]] as Node);
				node = {IS: child};
				break;
			case "NOT":
				[node, id] = this.handleNode(not[keys[0]] as Node);
				break;
			case "OR":
			case "AND": [node, id] = this.handleNotLogic(not[keys[0]] as Node[], keys[0]);
				break;
			case "LT":
			case "GT":
			case "EQ": [node, id] = this.handleNotMComp(not[keys[0]] as Node, keys[0]);
				break;
			default:
				throw new InsightError("Where clause has invalid filter");
		}
		return [node, id];
	}

	public handleWhere(obj: unknown): [Node, string] {
		if (!(obj as Node)) {
			throw new InsightError("Not a node");
		}
		let where = obj as Node;
		let keys = this.getKeysHelper(where);
		if (keys.length === 0) {
			return [where, ""];
		}
		let newWhere: Node = {};
		let id: string = "";
		[newWhere, id] = this.handleNode(where);
		return [newWhere, id];
	}
}
