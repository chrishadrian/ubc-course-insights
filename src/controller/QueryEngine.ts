import * as fs from "fs-extra";
import Where from "./Where";
import Options from "./Options";
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
		let whereBlock = this.handleWhere(query);
		let optionsBlock = this.handleOptions(query);
		let parsed = new Query(whereBlock, optionsBlock);
		return parsed;
		/*
		root: QueryNode = new QueryNode("ROOT");
		constructQuery(root, query);
		if (!validRoot(root)) {
			throw new InsightError("Invalid Structure at top level");
		}
		return root;
		*/
	}

	// return false if first query node does not have WHERE or Options, or more than one
	private validRoot(): boolean {
		/*
		return (
			root.getNumChildren() === 2 &&
			root.getChildren()[0].getKey() === "WHERE" &&
			root.getChildren()[1].getKey() === "OPTIONS"
		);
		*/
		return false;
	}

	// input is a root node
	// validate and if valid, return a Where block (has list of filters, a common dataset id, and initial
	// querynode child)
	// else reject with InsightError("Invalid Where Block")
	public handleWhere(root: unknown): Where {
		let whereBlock = new Where();
		/*
		if (!validRoot(root)) {
        	throw new InsightError("Invalid Structure at top level");
        }
        whereNode: QueryNode = root.getChildren()[0];

        //no filter in where aka no filters (specifications) --> will output entire dataset
        if (whereNode.getNumChildren() == 0) {
           whereBlock: Where = new Where();
           return whereBlock;
        }

        if (whereNode.getNumChildren() > 1) {
        	throw new InsightError("Where clause has more than one filter");
        }

        child: QueryNode = whereNode.getChildren()[0]
        whereBlock: Where = new Where(child);
        //filters?? How to handle this in terms of the
        filters: FieldFilters;
        switch (child.getKey()) {
        	case "IS":
        		filters = handleIs(child);
        		break;
        	case "NOT":
        		filters = handleNot(child);
        		break;
        	case "AND":
        	case "OR":
        		filters = handleLogic(child);
        		break;
        	case "LT":
        	case "GT":
        	case "EQ":
        		filters = handleMComp(child);
        		break;
        	default:
        		throw new InsightError("Where clause has invalid filter");
        }
        whereBlock.setFilters(filters);
*/
		return whereBlock;
	}

	private handleOptions(query: unknown) {
		return new Options();
	}
	/*
	private handleIs(node: QueryNode): FieldFilters {
		return null;
	}

	private handleNot(node: QueryNode): FieldFilters {
		return null;
	}

	private handleLogic(node: QueryNode): FieldFilters {
		return null;
	}

	private handleMComp(node: QueryNode): FieldFilters {
		return null;
	}

	private handleSComp(node: QueryNode): FieldFilters {
		return null;
	}

	private constructQuery(root: QueryNode, query: unknown) {
		for (const i in query) {
			curr: QueryNode;
			if (typeof query[i] == string) {
				//case where there are no more nodes
				curr = new QueryNode(i, query[i]);
			} else {
				//case where there are more nodes
				curr = newQueryNode(i.key);
				constructQuery(curr, query[i]);
			}
			root.addChild(i);
		}
	}
	*/
}
