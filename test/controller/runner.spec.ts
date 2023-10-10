import {IInsightFacade, InsightDatasetKind} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import {simpleQuery } from "../resources/queries/performQueryData";

use(chaiAsPromised);

describe("InsightFacade", function () {
	let facade: IInsightFacade;
	let sections: string;

	before(function () {
		sections = getContentFromArchives("lessPair.zip");

		clearDisk();
	});

	describe("Add/Remove/List Dataset", function () {
		describe("Add Dataset", function () {
			beforeEach(function () {
				clearDisk();
				facade = new InsightFacade();
			});

			it("should add one dataset and return its id", async function () {
				const datasetID = "sections";
				try {
					const result = await facade.addDataset(datasetID, sections, InsightDatasetKind.Sections);
					expect(result).to.deep.equal([datasetID]);
					const queryResult = await facade.performQuery(simpleQuery.input);
					expect(queryResult).have.deep.members(simpleQuery.output);
				} catch (err) {
					console.error("Found error: ", err);
				}
			});
		});
	});
});
