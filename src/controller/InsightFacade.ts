import {
	IInsightFacade, InsightDataset, InsightDatasetKind,
	InsightError, InsightResult, ResultTooLargeError
} from "./IInsightFacade";
import SectionParser, {SectionIndexes} from "../usecase/SectionParser";
import Validator from "../util/validator";
import Remover from "../usecase/Remover";
import Viewer from "../usecase/Viewer";
import QueryEngine from "../usecase/QueryEngine";
import RoomParser, {RoomIndexes} from "../usecase/RoomParser";
import Section from "../model/Section";
import Filter, {Node} from "../usecase/Filter";
import QueryHelper from "../util/PerformQueryHelper";
import Group from "../usecase/Group";
import FilterByGroup from "../usecase/FilterByGroup";

export default class InsightFacade implements IInsightFacade {
	private validator;
	private datasetIDs: string[];
	private datasets: InsightDataset[];
	private sindexes: SectionIndexes;
	private rindexes: RoomIndexes;
	private queryHelper: QueryHelper = new QueryHelper();

	constructor() {
		const viewer = new Viewer();

		this.validator = new Validator();
		this.datasetIDs = [];
		this.datasets = viewer.getInsightDatasets();
		this.sindexes = {};
		this.rindexes = {};
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		const sparser = new SectionParser();
		const rparser = new RoomParser();

		try {
			this.validator.validateID(id, "add", this.datasetIDs);
		} catch (error) {
			return Promise.reject(error);
		}


		try {
			if (kind === InsightDatasetKind.Sections) {
				const sections = await sparser.parseSectionsContent(content);
				const datasetJSON = await sparser.writeToDisk(sections, id, kind);
				this.sindexes[id] = datasetJSON.datasetIndexes[id];
				this.datasets.push(datasetJSON.insightDataset);
			} else {
				const rooms = await rparser.parseRoomsContent(content);
				const datasetJSON = await rparser.writeToDisk(rooms, id, kind);
				this.rindexes[id] = datasetJSON.datasetIndexes[id];
				this.datasets.push(datasetJSON.insightDataset);
			}
			this.datasetIDs.push(id);

			return Promise.resolve(this.datasetIDs);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	public removeDataset(id: string): Promise<string> {
		const remover = new Remover();
		try {
			this.validator.validateID(id, "remove", this.datasetIDs);
		} catch (error) {
			return Promise.reject(error);
		}

		remover.removeFromDisk(id);
		this.datasets.forEach((item, index) => {
			if (item.id === id) {
				this.datasets.splice(index, 1);
			}
		});

		return Promise.resolve(id);
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {
		const queryEngine = new QueryEngine();
		let datasetID = "", orderFields = [], columns = [""], filters: Node = {}, direction = "";
		let group: Set<string> = new Set<string>(), apply: Node[] = [];
		try {
			const queryResult = queryEngine.parseQuery(query), where = queryResult.whereBlock;
			filters = where;
			const options = queryResult.optionsBlock, transformations = queryResult.transformationsBlock;
			datasetID = options.getDatasetID();
			columns = options.getColumns();
			orderFields = options.getOrder();
			direction = options.getDirection();
			if (transformations) {
				group = transformations.getGroup();
				apply = transformations.getApply();
			}
		} catch (err) {
			return Promise.reject(err);
		}
		try {
			const viewer = new Viewer();
			let indexes = this.evalIndexes(datasetID, columns, apply);
			if (!indexes) {
				return Promise.reject(new InsightError("Dataset does not exist!"));
			}
			if (Object.keys(indexes).length === 0) {
				indexes = await viewer.getSectionIndexesByDatasetID(datasetID);
			}
			const filter = new Filter(), noFilter: Node = {IS: {furniture: ".*"}};
			const filteredSections = JSON.stringify(filters) === "{}" ? filter.filterByNode(noFilter, indexes) :
				filter.filterByNode(filters, indexes);
			this.checkLength(filteredSections.length);
			if (group.size === 0) {
				const result = filter.filterByColumnsAndOrder(
					filteredSections, columns, orderFields, direction, datasetID);
				return Promise.resolve(result);
			}
			const grouper = new FilterByGroup();
			const [g, applyVals] = grouper.groupResults(filteredSections, group, apply);
			const result = grouper.filterByColumnsAndOrder(
				g, applyVals,columns, orderFields, direction, datasetID, group);
			return Promise.resolve(result);
		} catch (err) {
			if (err instanceof ResultTooLargeError) {
				return Promise.reject(new ResultTooLargeError());
			}
			return Promise.reject(`Perform query error: ${err}`);
		}
	}

	private checkLength(numResults: number) {
		if (numResults > 5000) {
			throw new ResultTooLargeError();
		}
	}

	private initializePerformQuery() {
		let datasetID = "";
		let orderFields: any[] = [];
		let columns = [""];
		let filters: Node = {};
		let direction = "";
		return {filters, datasetID, columns, orderFields, direction};
	}

	private evalIndexes(datasetID: string, columns: string[], apply: Node[]): any{
		const section = new Section();
		let isSection;
		if (apply.length !== 0) {
			let firstRule = apply[0];
			let firstApplyKey = this.queryHelper.getKeysHelper(firstRule)[0];
			let firstApplyTokenKey = firstRule[firstApplyKey];
			let firstApplyToken: string = this.queryHelper.getKeysHelper(firstApplyTokenKey)[0];
			isSection = firstApplyToken in section;
		} else {
			isSection = columns[0] in section;
		}
		let indexes = isSection ? this.sindexes[datasetID] : this.rindexes[datasetID];
		return indexes;
	}

	public listDatasets(): Promise<InsightDataset[]> {
		const memoryResult = this.datasets;

		return Promise.resolve(memoryResult);
	}
}
