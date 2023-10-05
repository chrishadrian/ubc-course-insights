import * as fs from "fs-extra";
import JSZip from "jszip";

const persistDir = "./data";

/**
 * Convert a file into a base64 string.
 *
 * @param name  The name of the file to be converted.
 *
 * @return Promise A base 64 representation of the file
 */

const getContentFromArchives = (name: string): string =>
	fs.readFileSync("test/resources/archives/" + name).toString("base64");

/**
 * Removes all files within the persistDir.
 */

function clearDisk(): void {
	fs.removeSync(persistDir);
}

// code is referencing to ChatGPT's help
const getContentCountFromArchives = async (fileName: string): Promise<Promise<number>> => {
	let count = -1;

	try {
		const data = await fs.readFile("test/resources/archives/" + fileName);
		const zip = await JSZip.loadAsync(data);
		const folderPath = "courses/";

		zip.forEach(function (relativePath) {
			if (relativePath.startsWith(folderPath)) {
				count++;
			}
		});

		return count;
	} catch (error) {
		console.error("Error loading the zip file:", error);
		throw error; // You can choose to handle or rethrow the error as needed.
	}
};

export {getContentFromArchives, clearDisk, getContentCountFromArchives};
