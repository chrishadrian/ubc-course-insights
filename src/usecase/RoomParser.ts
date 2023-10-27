/* eslint-disable max-lines-per-function */
import JSZip, {folder} from "jszip";
import Sections from "../model/Sections";
import Section, {ContentSection} from "../model/Section";
import {InsightDataset, InsightDatasetKind, InsightError} from "../controller/IInsightFacade";
import * as fs from "fs-extra";
import * as parse5 from "parse5";

interface ZipFile {
	result: ContentSection[];
	rank: number;
}

export interface DatasetJSON {
	InsightDataset: InsightDataset;
	MappedSection: Record<string, Record<string | number, Section[]>>;
}

export interface DatasetIndexes {
	[datasetID: string]: Record<string, Map<string | number, Section[]>>;
}

const persistDir = "./data";

export default class RoomParser {
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
			const folderPath = "campus/campus/discover/buildings-and-classrooms";

			const sections = new Sections();

			const promises: any[] = [];

			zip.forEach(async function (relativePath, zipEntry) {
				if (relativePath === "index.htm") {
					zipEntry.async("text").then((indexContent) => {
						try {
							const indexObject = parse5.parse(indexContent);
							const foundElements: any = [];
							findElements(indexObject, foundElements);
							console.log(foundElements); // Array of <td> elements with class "views-field"
						} catch (error) {
							throw new InsightError();
						}
					});
				} else if (
					relativePath.startsWith(folderPath) &&
					relativePath !== folderPath &&
					!relativePath.startsWith(`${folderPath}.`)
				) {
					// const promise = zipEntry.async("text").then((jsonContent) => {
					// 	try {
					// 		const jsonObject: ZipFile = JSON.parse(jsonContent);
					// 		const results = jsonObject.result;
					// 		if (results.length !== 0) {
					// 			count++;
					// 			for (let result of results) {
					// 				const section = new Section(result);
					// 				sections.addSection(section);
					// 			}
					// 		}
					// 	} catch (error) {
					// 		throw new InsightError(`Course ${zipEntry.name} is invalid: ${error}`);
					// 	}
					// });
					// promises.push(promise);
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

	public async writeToDisk(
		sections: Sections,
		datasetID: string,
		kind: InsightDatasetKind
	): Promise<{insightDataset: InsightDataset; datasetIndex: DatasetIndexes}> {
		const data = sections.getSections();

		const rows = data.length;
		const insight = {
			id: datasetID,
			kind: kind,
			numRows: rows,
		};

		const datasetJSON: DatasetJSON = {
			InsightDataset: insight,
			MappedSection: {},
		};

		for (const key in data[0]) {
			const fieldName: keyof Section = key as keyof Section;
			this.createIndex(fieldName, data);
			datasetJSON.MappedSection[fieldName] = this.mapToJSON(this.indexes[fieldName]);
		}

		const jsonData = JSON.stringify(datasetJSON, null, 2);

		if (!fs.existsSync(persistDir)) {
			await fs.mkdir(persistDir);
		}

		const filePath = `${persistDir}/${datasetID}.json`;
		await fs.writeFile(filePath, jsonData);

		const datasetIndex: DatasetIndexes = {};
		datasetIndex[datasetID] = this.indexes;

		const result: {insightDataset: InsightDataset; datasetIndex: DatasetIndexes} = {
			insightDataset: datasetJSON.InsightDataset,
			datasetIndex: datasetIndex,
		};

		return Promise.resolve(result);
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

	private mapToJSON(map: Map<string | number, Section[]>): Record<string | number, Section[]> {
		const json: Record<string | number, Section[]> = {};
		map.forEach((value, key) => {
			json[key as string] = value;
		});
		return json;
	}
}


function findElements(node: any, result: any) {
	if (node.tagName === "td") {
		// Check if the <td> element has a "views-field" class
		const classAttribute = node.attrs.find((attr: {name: string}) => attr.name === "class");
		if (classAttribute && classAttribute.value.includes("views-field")) {
			result.push(node);
		}
	}

	if (node.childNodes) {
		for (const child of node.childNodes) {
			findElements(child, result);
		}
	}
}
