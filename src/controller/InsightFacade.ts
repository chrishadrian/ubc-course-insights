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

export default class InsightFacade implements IInsightFacade {
	private validator;
	private datasetIDs: string[];
	private datasets: InsightDataset[];
	private sindexes: SectionIndexes;
	private rindexes: RoomIndexes;

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
		let datasetID = "";
		let orderFields = [];
		let columns = [""];
		let filters: Node = {};
		let direction = "";

		try {
			const queryResult = queryEngine.parseQuery(query);
			const where = queryResult.whereBlock;
			filters = where;

			const options = queryResult.optionsBlock;
			datasetID = options.getDatasetID();
			columns = options.getColumns();
			orderFields = options.getOrder();
			direction = options.getDirection();
		} catch (err) {
			return Promise.reject(err);
		}

		try {
			const section = new Section();
			const isSection = columns[0] in section;
			const viewer = new Viewer();
			let indexes = isSection ? this.sindexes[datasetID] : this.rindexes[datasetID];
			if (!indexes) {
				return Promise.reject(new InsightError("Dataset does not exist!"));
			}
			if (Object.keys(indexes).length === 0) {
				indexes = await viewer.getSectionIndexesByDatasetID(datasetID);
			}


			const filter = new Filter();
			const filteredSections = filter.filterByNode(filters, indexes);
			if (filteredSections.length > 5000) {
				throw new ResultTooLargeError();
			}
			const result = filter.filterByColumnsAndOrder(filteredSections, columns, orderFields, direction, datasetID);

			return Promise.resolve(result);
		} catch (err) {
			if (err instanceof ResultTooLargeError) {
				return Promise.reject(new ResultTooLargeError());
			}
			return Promise.reject(`Perform query error: ${err}`);
		}
	}

	public listDatasets(): Promise<InsightDataset[]> {
		const memoryResult = this.datasets;

		return Promise.resolve(memoryResult);
	}
}
