import { InsightError } from "../controller/IInsightFacade";


export interface Node {
	[key: string]: string | number | Node[] | Node;
}

export default class WhereRe {
	public node: Node = {
		AND: [
			{
				OR: [
					{ IS: { uuid: "1234" } },
					{ LT: { avg: 68 } }
				]
			},
			{
				AND: [
					{ EQ: { pass: 98 } },
					{ IS: { dept: "math" } }
				]
			},
			{ GT: { fail: 3 } }]
	};

	private validateSKey(key: string): boolean {
		const validateSKeyRegex = new RegExp("[^_]+_((dept)|(id)|(instructor)|(title)|(uuid))");
		return validateSKeyRegex.test(key);
	}

	private validateMKey(key: string): boolean {
		const validateMKeyRegex = new RegExp("[^_]+_((avg)|(pass)|(fail)|(audit)|(year))");
		return validateMKeyRegex.test(key);
	}

	private extractIDString(str: string): string {
		let key = str.split("_", 2);
		return key[0];
	}

	private extractField(str: string): string {
		let field = str.split("_", 2);
		return field[1];
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

	private getKeysHelper(obj: unknown): string[] {
		let keys = [];
		for (const i in obj as any) {
			keys.push(i);
		}
		return keys;
	}

	private handleSComp(scomp: Node): [Node, string] {
		let keys = this.getKeysHelper(scomp);
		if (keys.length !== 1 || !this.validateSKey(keys[0])) {
			throw new InsightError();
		}
		let id: string = this.extractIDString(keys[0]);
		let field = this.extractField(keys[0]);
		let value = this.getRegex(scomp[keys[0]] as string);
		let newNode: Node = {[field]: value};
		return [newNode, id];
	}

	private handleMComp(mcomp: Node): [Node, string] {
		let keys = this.getKeysHelper(mcomp);
		if (keys.length !== 1 || !this.validateMKey(keys[0])) {
			throw new InsightError();
		}
		let id: string = this.extractIDString(keys[0]);
		let field = this.extractField(keys[0]);
		let value = mcomp[keys[0]] as number;
		let newNode: Node = {[field]: value};
		return [newNode, id];
	}

	private handleLogic(logic: Node[]): [Node[], string] {
		if (logic.length < 1) {
			throw new InsightError("empty logic");
		}
		let nodes: Node[] = [];
		let id: string = "";
		let child: Node;
		let children: Node[];
		for (let i of logic) {
			switch (i.key) {
				case "IS":
					[child, id] = this.handleSComp(i.value as Node);
					nodes.push({IS: child} as Node);
					break;
				case "NOT":
				// the DIFFICULT CASE
					break;
				case "OR":
				case "AND":
					[children, id] = this.handleLogic(i.value as Node[]);
					nodes.push({[i.key]: children} as Node);
					break;
				case "LT":
				case "GT":
				case "EQ":
					[child, id] = this.handleMComp(i.value as Node);
					nodes.push({[i.key]: child});
					break;
				default:
					throw new InsightError("Logic Node has invalid filter");
			}
		}
		return [nodes, id];
	}

	// returns the root where node as well as the common id
	public handleWhere(obj: unknown): [Node, string] {
		let idString = "";
		let where = obj as Node;
		let keys = this.getKeysHelper(where);
		if (keys.length > 1) {
			throw new InsightError();
		}
		if (keys.length === 0) {
			return [where, ""];
		}
		let newWhere: Node = {};
		let id: string;
		let child: Node = {};
		let children: Node[] = [];
		switch (keys[0]) {
			case "IS":
				[child, id] = this.handleSComp(where[keys[0]] as Node);
				newWhere = {AND: [{[keys[0]]: child}]};
				break;
			case "NOT":
				// the DIFFICULT CASE
				break;
			case "OR":
			case "AND":
				[children, id] = this.handleLogic(where[keys[0]] as Node[]);
				newWhere = {[keys[0]]: children};
				break;
			case "LT":
			case "GT":
			case "EQ":
				[child, id] = this.handleMComp(where[keys[0]] as Node);
				newWhere = {AND: [{[keys[0]]: child}]};
				break;
			default:
				throw new InsightError("Where clause has invalid filter");
		}
		return [newWhere, ""];
	}
}
