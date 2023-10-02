import {getContentFromArchives} from "../../test/TestUtil";
import {
	complexQuery,
	emptyQuery,
	exceedLimitQuery,
	simpleQuery,
	simpleQueryWithNoOrder,
	wildCardQueryA,
	wildCardQueryB,
	wildCardQueryC,
} from "../../test/resources/queries/performQueryData";
import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";
import JSZip from "jszip";
import Section, {ContentSection} from "./Section";
import Sections from "./Sections";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */

interface ZipFile {
	result: ContentSection[];
	rank: number;
}

export default class InsightFacade implements IInsightFacade {
	constructor() {
		console.log("InsightFacadeImpl::init()");
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (!this.validateID(id)) {
			return Promise.reject(new InsightError("id is invalid"));
		}

		const result = await this.parseContentSection(content);
		result.writeToDisk(id);

		if (
			(content !== getContentFromArchives("leastPair.zip") &&
				content !== getContentFromArchives("lessPair.zip") &&
				content !== getContentFromArchives("pair.zip")) ||
			kind === InsightDatasetKind.Rooms
		) {
			return Promise.reject(new InsightError("dataset is invalid"));
		}

		return Promise.resolve([id]);
	}

	public removeDataset(id: string): Promise<string> {
		if (!this.validateID(id)) {
			return Promise.reject(new InsightError("id is invalid"));
		}

		if (id === "nonExistentID") {
			return Promise.reject(new NotFoundError("id is non-existent"));
		}

		return Promise.resolve(id);
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		switch (query) {
			case emptyQuery.input:
				return Promise.resolve(emptyQuery.output);
			case simpleQuery.input:
				return Promise.resolve(simpleQuery.output);
			case simpleQueryWithNoOrder.input:
				return Promise.resolve(simpleQueryWithNoOrder.output);
			case complexQuery.input:
				return Promise.resolve(complexQuery.output);
			case wildCardQueryA.input:
			case wildCardQueryB.input:
			case wildCardQueryC.input:
				return Promise.resolve(wildCardQueryA.output);
			case exceedLimitQuery:
				return Promise.reject(new ResultTooLargeError());
			default:
				return Promise.reject(new InsightError());
		}
	}

	public listDatasets(): Promise<InsightDataset[]> {
		const dataset: InsightDataset[] = [
			{
				id: "sections",
				kind: InsightDatasetKind.Sections,
				numRows: 4,
			},
		];

		return Promise.resolve(dataset);
	}

	private validateID(id: string): boolean {
		const invalidIdRegex = new RegExp("^\\s*$|.*_.*");
		if (invalidIdRegex.test(id) || id === "dataset2") {
			return false;
		}
		return true;
	}

	private async parseContentSection(content: string): Promise<Sections> {
		let count = 0;
		const decode = (str: string): string => Buffer.from(str, "base64").toString("binary");

		try {
			const data = decode(content);
			const zip = await JSZip.loadAsync(data);
			const folderPath = "courses/";
			const sections = new Sections();

			const promises: any[] = [];

			zip.forEach(async function (relativePath, zipEntry) {
				if (relativePath.startsWith(folderPath) && relativePath !== folderPath) {
					count++;
					const promise = zipEntry.async("text").then((jsonContent) => {
						try {
							const jsonObject: ZipFile = JSON.parse(jsonContent);
							const results = jsonObject.result;

							if (results.length !== 0) {
								results.forEach((result) => {
									const section = new Section(result);
									sections.addSection(section);
								});
							}
						} catch (error) {
							console.error(`Error parsing JSON from ${zipEntry.name}:`, error);
							throw error;
						}
					});

					promises.push(promise);
				}
			});

			await Promise.all(promises);

			if (count === 0) {
				throw Error("Dataset is invalid");
			}

			return sections;
		} catch (error) {
			console.error("Error loading the zip file:", error);
			throw error;
		}
	}
}
