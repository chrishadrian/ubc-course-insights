import JSZip from "jszip";
import Sections from "./Sections";
import Section, { ContentSection } from "./Section";
import { InsightError } from "./IInsightFacade";

interface ZipFile {
	result: ContentSection[];
	rank: number;
}

export default class Adder {
	constructor() {
		// console.log("InsightFacadeImpl::init()");
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
				if (relativePath.startsWith(folderPath) &&
				relativePath !== folderPath &&
				!relativePath.startsWith(`${folderPath}.`)) {
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
}

