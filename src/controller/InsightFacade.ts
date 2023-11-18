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
import Room from "../model/Room";

export default class InsightFacade implements IInsightFacade {
	private validator;
	private datasetIDs: string[];
	private insights: InsightDataset[];
	private sindexes: SectionIndexes;
	private rindexes: RoomIndexes;

	constructor() {
		this.validator = new Validator();

		const viewer = new Viewer();
		const {insights, roomIndexes, sectionIndexes} = viewer.getDataFromDisk();
		this.insights = insights;
		this.datasetIDs = [];
		for (const index in this.insights) {
			const dataset: InsightDataset = this.insights[index];
			this.datasetIDs.push(dataset.id);
		}
		this.sindexes = sectionIndexes;
		this.rindexes = roomIndexes;
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
				this.insights.push(datasetJSON.insightDataset);
			} else {
				const rooms = await rparser.parseRoomsContent(content);
				const datasetJSON = await rparser.writeToDisk(rooms, id, kind);
				this.rindexes[id] = datasetJSON.datasetIndexes[id];
				this.insights.push(datasetJSON.insightDataset);
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
		this.insights.forEach((item, index) => {
			if (item.id === id) {
				this.insights.splice(index, 1);
				this.datasetIDs.splice(index, 1);
			}
		});

		return Promise.resolve(id);
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {
		const queryEngine = new QueryEngine();
		try {
			const queryResult = queryEngine.parseQuery(query);
			const {
				filters, group, apply, datasetID,
				columns, orderFields, direction
			} = this.initializeQuery(queryResult);
			const viewer = new Viewer();
			let indexes = this.evalIndexes(datasetID, columns, group);
			const filteredSections = this.getFilteredSections(columns, group, filters, indexes);
			if (group.size === 0) {
				const result = this.getResultWithNoGroup(filteredSections, columns, orderFields, direction, datasetID);
				return Promise.resolve(result);
			}
			const grouper = new FilterByGroup();
			const [g, applyVals] = grouper.groupResults(filteredSections, group, apply);
			this.checkLength(g.size);
			const result = grouper.filterByColumnsAndOrder(g,applyVals,columns,orderFields,direction,datasetID,group);
			return Promise.resolve(result);
		} catch (err) {
			if (err instanceof ResultTooLargeError) {
				return Promise.reject(new ResultTooLargeError());
			}
			return Promise.reject(new InsightError(`Perform query error: ${err}`));
		}
	}

	private getResultWithNoGroup(
		filteredSections: Array<Section | Room>,
		columns: any,
		orderFields: any,
		direction: any,
		datasetID: any
	) {
		const filter = new Filter();
		this.checkLength(filteredSections.length);
		const result = filter.
			filterByColumnsAndOrder(filteredSections, columns, orderFields, direction, datasetID);
		return result;
	}

	private getFilteredSections(
		columns: any,
		group: Set<string>,
		filters: any,
		indexes: Record<string, Map<string | number, Section[]>> | Record<string, Map<string | number, Room[]>>
	) {
		const filter = new Filter();
		const noFilter: Node = this.isSection(columns, group)
			? {IS: {id: ".*"}}
			: {IS: {furniture: ".*"}};
		const filteredSections = JSON.stringify(filters) === "{}"
			? filter.filterByNode(noFilter, indexes)
			: filter.filterByNode(filters, indexes);
		return filteredSections;
	}

	private checkLength(numResults: number) {
		if (numResults > 5000) {
			throw new ResultTooLargeError();
		}
	}

	private initializeQuery(queryResult: any) {
		let group: Set<string> = new Set<string>();
		let apply: Node[] = [];
		const where = queryResult.whereBlock;
		const options = queryResult.optionsBlock;
		const transformations = queryResult.transformationsBlock;
		const filters = where;
		const datasetID = options.getDatasetID();
		const columns = options.getColumns();
		const orderFields = options.getOrder();
		const direction = options.getDirection();
		if (transformations) {
			group = transformations.getGroup();
			apply = transformations.getApply();
		}
		return {filters, group, apply, datasetID, columns, orderFields, direction};
	}

	private isSection (columns: string[], group: Set<string>): boolean {
		const section = new Section();
		let isSection = false;
		if (group.size !== 0) {
			for (let key of group) {
				isSection = key in section;
				return isSection;
			}
		} else {
			isSection = columns[0] in section;
		}
		return isSection;
	}

	private evalIndexes(datasetID: string, columns: string[], group: Set<string>) {
		const section = new Section();
		let isSection;
		if (group.size !== 0) {
			for (let key of group) {
				isSection = key in section;
				const indexes = isSection ? this.sindexes[datasetID] : this.rindexes[datasetID];
				return indexes;
			}
		} else {
			isSection = columns[0] in section;
		}
		const indexes = isSection ? this.sindexes[datasetID] : this.rindexes[datasetID];
		if (!indexes) {
			throw new InsightError("Dataset does not exist!");
		}
		return indexes;
	}

	public listDatasets(): Promise<InsightDataset[]> {
		const memoryResult = this.insights;

		return Promise.resolve(memoryResult);
	}
}
