import {IInsightFacade, InsightDatasetKind} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import {roomQuery} from "../resources/queries/roomsQueries";
// import {sectionQuery} from "../resources/queries/sectionQueries";

use(chaiAsPromised);

describe("InsightFacade", function () {
	let facade: IInsightFacade;
	let rooms: string;
	let sections: string;

	before(function () {
		rooms = getContentFromArchives("rooms/campus.zip");
		sections = getContentFromArchives("pair.zip");

		clearDisk();
	});

	describe("Add/Remove/List/ Dataset and PerformQuery", function () {
		describe("Add Dataset", function () {
			beforeEach(function () {
				clearDisk();
				facade = new InsightFacade();
			});

			it("should add one dataset and return its id and perform the query", async function () {
				const datasetID = "rooms";
				try {
					const result = await facade.addDataset(datasetID, rooms, InsightDatasetKind.Rooms);
					expect(result).to.deep.equal([datasetID]);
					facade = new InsightFacade();
					const rmResult = await facade.removeDataset(datasetID);
					expect(rmResult).to.be.equal(datasetID);

					const result1 = await facade.addDataset(datasetID, rooms, InsightDatasetKind.Rooms);
					const result2 = await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
					expect(result2).to.deep.equal([datasetID, "sections"]);

					const queryResult = await facade.performQuery(roomQuery.input);
					const expectedResult = roomQuery.expected;
					expect(queryResult).have.deep.members(roomQuery.expected);

					// const queryResult2 = await facade.performQuery(sectionQuery.input);
					// const expectedResult2 = sectionQuery.expected;
					// expect(queryResult2).have.deep.members(sectionQuery.expected);
				} catch (err) {
					console.error("Found error: ", err);
					expect.fail();
				}
			});
		});
	});
});
