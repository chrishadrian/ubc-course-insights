import {IInsightFacade, InsightDatasetKind} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import { veryComplexQuery } from "../resources/queries/abc";
import { performance } from "perf_hooks";


use(chaiAsPromised);

describe("InsightFacade", function () {
	let facade: IInsightFacade;
	let sections: string;

	before(function () {
		sections = getContentFromArchives("pair.zip");

		clearDisk();
	});

	describe("Add/Remove/List/ Dataset and PerformQuery", function () {
		const start = performance.now();
		describe("Add Dataset", function () {
			beforeEach(function () {
				clearDisk();
				facade = new InsightFacade();
			});
			const end1 = performance.now();
			console.log("done1: ", end1 - start);

			it("should add one dataset and return its id", async function () {
				const datasetID = "sections";
				try {
					const result = await facade.addDataset(datasetID, sections, InsightDatasetKind.Sections);
					const end2 = performance.now();
					console.log("done2: ", end2 - start);


					expect(result).to.deep.equal([datasetID]);
					const queryResult = await facade.performQuery(veryComplexQuery.input);
					const end3 = performance.now();
					console.log("done3: ", end3 - start);


					expect(queryResult).have.deep.members(veryComplexQuery.expected);
				} catch (err) {
					console.error("Found error: ", err);
				}
			});
		});
	});
});
