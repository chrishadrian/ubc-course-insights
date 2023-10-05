import * as fs from "fs-extra";

export enum QueryNodeKind {
	Root = "root",
	Where = "where",
	Options = "options",
	Columns = "columns",
	Order = "order",
	MComp = "mComparison",
	SComp = "sComparison",
	Logic = "logic",
	Negation = "negation",
}

export default class QueryNode {
	private key: string;
	private expression: string;
	private children: QueryNode[];

	constructor(key: string, expression?: string, children?: QueryNode[]) {
		this.key = key;
		this.children = children || [];
		this.expression = expression || "";
	}

	// adds Child to QueryNode (validation occurs in QueryEngine)
	public addChild(child: QueryNode) {
		this.children.push(child);
	}

	public getNumChildren(): number {
		return this.children.length;
	}

	public getChildren(): QueryNode[] {
		return this.children;
	}

	public getExpression(): string {
		return this.expression;
	}

	public getKey(): string {
		return this.key;
	}
}
