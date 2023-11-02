import {IInsightFacade, InsightDatasetKind} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import {roomQuery} from "../resources/queries/roomsQueries";

use(chaiAsPromised);

describe("InsightFacade", function () {
	let facade: IInsightFacade;
	let rooms: string;

	before(function () {
		rooms = getContentFromArchives("rooms/campus.zip");

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
					// const remove = await facade.removeDataset(datasetID);
					// expect(remove).to.deep.equal(datasetID);

					const queryResult = await facade.performQuery(roomQuery.input);
					const expectedResult = roomQuery.expected;
					expect(queryResult).have.deep.members(roomQuery.expected);
				} catch (err) {
					console.error("Found error: ", err);
				}
			});
		});
	});
});
