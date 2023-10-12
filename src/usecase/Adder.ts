import JSZip from "jszip";
import Sections from "../model/Sections";
import Section, {ContentSection} from "../model/Section";
import {InsightDataset, InsightDatasetKind, InsightError} from "../controller/IInsightFacade";
import * as fs from "fs-extra";

interface ZipFile {
	result: ContentSection[];
	rank: number;
}

const persistDir = "./data";

export default class Adder {
	private indexes: Record<string, Map<string | number, Section[]>>;

	constructor() {
		this.indexes = {};
	}

	public async parseContentSection(content: string): Promise<Sections> {
		let count = 0;
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
								count++;
								results.forEach((result) => {
									const section = new Section(result);
									sections.addSection(section);
								});
							}
						} catch (error) {
							throw new InsightError(`Course ${zipEntry.name} is invalid: ${error}`);
						}
					});

					promises.push(promise);
				}
			});

			await Promise.all(promises);

			if (count === 0) {
				throw new InsightError("There is no valid section!");
			}

			return sections;
		} catch (error) {
			throw new InsightError(`Dataset is invalid: ${error}`);
		}
	}

	public writeToDisk(sections: Sections, datasetID: string, kind: InsightDatasetKind): InsightDataset {
		const data = sections.getSections();

		const rows = data.length;
		const insight = {
			id: datasetID,
			kind: kind,
			numRows: rows,
		};

		const datasetJSON: {
			insightDataset: InsightDataset;
			MappedSection: Record<string, Record<string | number, Section[]>>;
		} = {
			insightDataset: insight,
			MappedSection: {},
		};

		for (const key in data[0]) {
			const fieldName: keyof Section = key as keyof Section;
			this.createIndex(fieldName, data);
			datasetJSON.MappedSection[fieldName] = mapToJSON(this.indexes[fieldName]);
		}

		const jsonData = JSON.stringify(datasetJSON, null, 2);

		if (!fs.existsSync(persistDir)) {
			fs.mkdirSync(persistDir);
		}

		const filePath = `${persistDir}/${datasetID}.json`;
		fs.writeFileSync(filePath, jsonData);

		return datasetJSON.insightDataset;
	}

	private createIndex(fieldName: keyof Section, data: Section[]): void {
		const index = new Map<string | number, Section[]>();
		for (const item of data) {
			const value = item[fieldName];
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
