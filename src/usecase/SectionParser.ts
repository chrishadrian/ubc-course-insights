import JSZip from "jszip";
import Sections from "../model/Sections";
import Section, {ContentSection} from "../model/Section";
import {InsightDataset, InsightDatasetKind, InsightError} from "../controller/IInsightFacade";
import * as fs from "fs-extra";

interface ZipFile {
	result: ContentSection[];
	rank: number;
}

export interface SectionJSON {
	InsightDataset: InsightDataset;
	InsightIndexes: Record<string, Record<string | number, Section[]>>;
}

export interface SectionIndexes {
	[datasetID: string]: Record<string, Map<string | number, Section[]>>
}

const persistDir = "./data";

export default class SectionParser {
	private indexes: Record<string, Map<string | number, Section[]>>;

	constructor() {
		this.indexes = {};
	}

	public async parseSectionsContent(content: string): Promise<Sections> {
		let validSection = false;
		const decode = (str: string): string => Buffer.from(str, "base64").toString("binary");

		try {
			const data = decode(content);
			const zip = await JSZip.loadAsync(data);
			const folderPath = "courses/";
			const sections = new Sections();
			const promises: any[] = [];

			zip.forEach(async function (relativePath, zipEntry) {
				if (
					relativePath.startsWith(folderPath) &&
					relativePath !== folderPath &&
					!relativePath.startsWith(`${folderPath}.`)
				) {
					const promise = zipEntry.async("text").then((jsonContent) => {
						try {
							const jsonObject: ZipFile = JSON.parse(jsonContent);
							const results = jsonObject.result;
							if (results.length !== 0) {
								if (!validSection) {
									validSection = true;
								}
								for (let result of results) {
									const section = new Section(result);
									if (!section.isInvalidSection()) {
										sections.addSection(section);
									}
								}
							}
						} catch (error) {
							return;
						}
					});
					promises.push(promise);
				}
			});
			await Promise.all(promises);

			if (!validSection) {
				throw new InsightError("There is no valid section!");
			}

			return sections;
		} catch (error) {
			throw new InsightError(`Dataset is invalid: ${error}`);
		}
	}

	public async writeToDisk(sections: Sections, datasetID: string, kind: InsightDatasetKind):
	Promise<{insightDataset: InsightDataset, datasetIndexes: SectionIndexes}> {
		const data = sections.getSections();

		const rows = data.length;
		const insight = {
			id: datasetID,
			kind: kind,
			numRows: rows,
		};

		const datasetJSON: SectionJSON = {
			InsightDataset: insight,
			InsightIndexes: {},
		};

		for (const key in data[0]) {
			const fieldName: keyof Section = key as keyof Section;
			this.createIndex(fieldName, data);
			datasetJSON.InsightIndexes[fieldName] = mapToJSON(this.indexes[fieldName]);
		}

		const jsonData = JSON.stringify(datasetJSON, null, 2);

		if (!fs.existsSync(persistDir)) {
			await fs.mkdir(persistDir);
		}

		const filePath = `${persistDir}/${datasetID}.json`;
		await fs.writeFile(filePath, jsonData);

		const datasetIndexes: SectionIndexes = {};
		datasetIndexes[datasetID] = this.indexes;

		const result: {insightDataset: InsightDataset, datasetIndexes: SectionIndexes} = {
			insightDataset: datasetJSON.InsightDataset,
			datasetIndexes: datasetIndexes
		};

		return Promise.resolve(result);
	}

	private createIndex(fieldName: keyof Section, data: Section[]): void {
		const index = new Map<string | number, Section[]>();
		for (const item of data) {
			const value = item[fieldName] as string|number;
			if (!index.has(value)) {
				index.set(value, []);
			}
			index.get(value)?.push(item);
		}
		this.indexes[fieldName] = index;
	}
}

function mapToJSON(map: Map<string | number, Section[]>): Record<string | number, Section[]> {
	const json: Record<string | number, Section[]> = {};
	map.forEach((value, key) => {
		json[key as string] = value;
	});
	return json;
}
