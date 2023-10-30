import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import {folderTest} from "@ubccpsc310/folder-test";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";

use(chaiAsPromised);

describe("InsightFacade — Room", function () {
	let facade: IInsightFacade;
	let rooms: string;

	before(function () {
		rooms = getContentFromArchives("lessCampus.zip", true);

		clearDisk();
	});

	describe("Add/Remove/List Dataset", function () {
		describe("Add Dataset", function () {
			beforeEach(function () {
				clearDisk();
				facade = new InsightFacade();
			});

			it("should add one room dataset and return its id", async function () {
				const datasetID = "rooms";
				try {
					const result = await facade.addDataset(datasetID, rooms, InsightDatasetKind.Rooms);
					expect(result).to.deep.equal([datasetID]);
				} catch (err) {
					expect.fail("Should not be rejected!");
				}
			});

			it("should add two room dataset and return its ids", async function () {
				try {
					const result1 = await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
					expect(result1).to.deep.equal(["rooms"]);
					const result2 = await facade.addDataset("ubc", rooms, InsightDatasetKind.Rooms);
					expect(result2).to.deep.equal(["rooms", "ubc"]);
				} catch (err) {
					expect.fail("Should not be rejected!");
				}
			});

			it("should add one no room dataset and return its id", async function () {
				const noRoomData = getContentFromArchives("noRoomTable.zip", true);
				try {
					const result = await facade.addDataset("rooms", noRoomData, InsightDatasetKind.Rooms);
					expect(result).to.deep.equal(["rooms"]);
				} catch (err) {
					expect.fail("Should not be rejected!");
				}
			});

			it("should reject due to empty string id", async function () {
				try {
					await facade.addDataset("", rooms, InsightDatasetKind.Rooms);
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(InsightError);
				}
			});

			it("should reject due to underscore id", async function () {
				try {
					await facade.addDataset("dataset_1", rooms, InsightDatasetKind.Rooms);
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(InsightError);
				}
			});

			it("should reject due to only whitespace id", async function () {
				try {
					await facade.addDataset(" ", rooms, InsightDatasetKind.Rooms);
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(InsightError);
				}
			});

			it("should reject due to duplicate id", async function () {
				try {
					await facade.addDataset("dataset2", rooms, InsightDatasetKind.Rooms);
				} catch (err) {
					expect.fail("Should not be rejected!");
				}

				try {
					await facade.addDataset("dataset2", rooms, InsightDatasetKind.Rooms);
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(InsightError);
				}
			});

			it("should reject due to invalid dataset file type", async function () {
				try {
					const invalidSections = getContentFromArchives("invalidPair.jpg");
					await facade.addDataset("rooms", invalidSections, InsightDatasetKind.Rooms);
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(InsightError);
				}
			});

			it("should reject due to empty dataset", async function () {
				try {
					const emptyRoom = getContentFromArchives("emptyCampus.zip", true);
					await facade.addDataset("rooms", emptyRoom, InsightDatasetKind.Rooms);
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(InsightError);
				}
			});

			it("should reject due to missing index.htm", async function () {
				try {
					const missingIndex = getContentFromArchives("noIndexCampus.zip", true);
					await facade.addDataset("rooms", missingIndex, InsightDatasetKind.Rooms);
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(InsightError);
				}
			});

			it("should reject due to missing valid table in index.htm", async function () {
				try {
					const missingValidTable = getContentFromArchives("noTableIndex.zip", true);
					await facade.addDataset("rooms", missingValidTable, InsightDatasetKind.Rooms);
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(InsightError);
				}
			});


			it("should reject due to missing building file", async function () {
				try {
					const missingBuildingFile = getContentFromArchives("buildingFileNotFound.zip", true);
					await facade.addDataset("rooms", missingBuildingFile, InsightDatasetKind.Rooms);
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(InsightError);
				}
			});

			it("should reject due to invalid rooms", async function () {
				try {
					const invalidData = getContentFromArchives("noBuildingFiles.zip", true);
					await facade.addDataset("rooms", invalidData, InsightDatasetKind.Rooms);
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(InsightError);
				}
			});

			it("should reject due to content and kind's mismatch", async function () {
				try {
					await facade.addDataset("rooms", rooms, InsightDatasetKind.Sections);
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(InsightError);
				}
			});
		});

		describe("Remove Dataset", function () {
			beforeEach(async function () {
				clearDisk();
				facade = new InsightFacade();
				try {
					await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
				} catch (err) {
					expect.fail("Should not be rejected!");
				}
			});

			it("should remove one dataset and return its id", async function () {
				try {
					const result = await facade.removeDataset("rooms");
					expect(result).to.deep.equal("rooms");
				} catch (err) {
					expect.fail("Should not be rejected!");
				}
			});

			it("should remove two datasets and return its ids", async function () {
				try {
					await facade.addDataset("ubc", rooms, InsightDatasetKind.Rooms);
				} catch (err) {
					expect.fail("Should not be rejected!");
				}

				try {
					const result1 = await facade.removeDataset("rooms");
					expect(result1).to.deep.equal("rooms");

					const result2 = await facade.removeDataset("ubc");
					expect(result2).to.deep.equal("ubc");
				} catch (err) {
					expect.fail("Should not be rejected!");
				}
			});

			it("should reject due to empty string dataset id", async function () {
				try {
					await facade.removeDataset("");
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(InsightError);
				}
			});

			it("should reject due to underscore dataset id", async function () {
				try {
					await facade.removeDataset("dataset_1");
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(InsightError);
				}
			});

			it("should reject due to only whitespace dataset id", async function () {
				try {
					await facade.removeDataset(" ");
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(InsightError);
				}
			});

			it("should reject due to non-existent dataset id", async function () {
				try {
					const nonExistentID = "nonExistentID";
					await facade.removeDataset(nonExistentID);
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(NotFoundError);
				}
			});
		});

		describe("List Dataset", function () {
			it("should list empty dataset", async function () {
				clearDisk();
				facade = new InsightFacade();
				try {
					const datasets = await facade.listDatasets();
					expect(datasets).to.deep.equal([]);
				} catch (err) {
					expect.fail("Should not be rejected!");
				}
			});

			describe("pre-added dataset", function () {
				beforeEach(async function () {
					clearDisk();
					facade = new InsightFacade();
					try {
						await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
					} catch (err) {
						expect.fail("Should not be rejected!");
					}
				});

				it("should list one dataset", async function () {
					try {
						const datasets = await facade.listDatasets();
						expect(datasets).to.deep.equal([
							{
								id: "rooms",
								kind: InsightDatasetKind.Rooms,
								numRows: 12,
							},
						]);
					} catch (err) {
						expect.fail("Should not be rejected!");
					}
				});

				it("should list empty dataset after removing one dataset", async function () {
					try {
						await facade.removeDataset("rooms");
						const datasets = await facade.listDatasets();
						expect(datasets).have.deep.members([]);
					} catch (err) {
						expect.fail("Should not be rejected!");
					}
				});

				it("should list the same dataset even after clearing disk", async function () {
					try {
						clearDisk();
						const datasets = await facade.listDatasets();
						expect(datasets).to.deep.equal([
							{
								id: "rooms",
								kind: InsightDatasetKind.Rooms,
								numRows: 12,
							},
						]);
					} catch (err) {
						expect.fail("Should not be rejected!");
					}
				});

				it("should list the same dataset with a new facade after old facade crashed", async function () {
					try {
						const newFacade = new InsightFacade();
						const datasets = await newFacade.listDatasets();
						expect(datasets).to.deep.equal([
							{
								id: "rooms",
								kind: InsightDatasetKind.Rooms,
								numRows: 12,
							},
						]);
					} catch (err) {
						expect.fail("Should not be rejected!");
					}
				});

				it("should list empty dataset after old facade removed prev dataset and crashed", async function () {
					try {
						await facade.removeDataset("rooms");
						const newFacade = new InsightFacade();
						const datasets = await newFacade.listDatasets();
						expect(datasets.length).to.equal(0);
					} catch (err) {
						expect.fail("Should not be rejected!");
					}
				});

				it("should list empty dataset after old facade crashed and disk being cleared", async function () {
					try {
						clearDisk();
						const newFacade = new InsightFacade();
						const datasets = await newFacade.listDatasets();
						expect(datasets).to.deep.equal([]);
					} catch (err) {
						expect.fail("Should not be rejected!");
					}
				});

				it("should list multiple datasets", async function () {
					try {
						await facade.addDataset("datasetID2", rooms, InsightDatasetKind.Rooms);
						const datasets = await facade.listDatasets();

						expect(datasets).have.deep.members([
							{
								id: "rooms",
								kind: InsightDatasetKind.Rooms,
								numRows: 12,
							},
							{
								id: "datasetID2",
								kind: InsightDatasetKind.Rooms,
								numRows: 12,
							},
						]);
					} catch (err) {
						expect.fail("Should not be rejected!");
					}
				});

				it("should list one dataset after removing one from two datasets", async function () {
					try {
						await facade.addDataset("datasetID2", rooms, InsightDatasetKind.Rooms);
						await facade.removeDataset("rooms");
						const datasets = await facade.listDatasets();

						expect(datasets).have.deep.members([
							{
								id: "datasetID2",
								kind: InsightDatasetKind.Rooms,
								numRows: 12,
							},
						]);
					} catch (err) {
						expect.fail("Should not be rejected!");
					}
				});
			});
		});
	});

	// describe("PerformQuery", function () {
	// 	before(async function () {
	// 		clearDisk();
	// 		rooms = getContentFromArchives("pair.zip");
	// 		halfSections = getContentFromArchives("halfPair.zip");
	// 		facade = new InsightFacade();
	// 		try {
	// 			await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
	// 			await facade.addDataset("large", halfSections, InsightDatasetKind.Rooms);
	// 		} catch (err) {
	// 			expect.fail("Should not be rejected!");
	// 		}
	// 	});

	// 	it("should perform a query and return empty array", async function () {
	// 		try {
	// 			const result = await facade.performQuery(emptyQuery.input);
	// 			expect(result).have.deep.members(emptyQuery.output);
	// 		} catch (err) {
	// 			expect.fail("Should not be rejected!");
	// 		}
	// 	});

	// 	it("should perform a simple query and return results", async function () {
	// 		try {
	// 			const result = await facade.performQuery(simpleQuery.input);
	// 			expect(result).have.deep.members(simpleQuery.output);
	// 		} catch (err) {
	// 			expect.fail("Should not be rejected!");
	// 		}
	// 	});

	// 	it("should perform a simple query with no order and return results", async function () {
	// 		try {
	// 			const result = await facade.performQuery(simpleQueryWithNoOrder.input);
	// 			expect(result).have.deep.members(simpleQueryWithNoOrder.output);
	// 		} catch (err) {
	// 			expect.fail("Should not be rejected!");
	// 		}
	// 	});

	// 	it("should perform a simple query with LT operator and return results", async function () {
	// 		try {
	// 			const result = await facade.performQuery(LTOperatorQuery.input);
	// 			expect(result).have.deep.members(LTOperatorQuery.output);
	// 		} catch (err) {
	// 			expect.fail("Should not be rejected!");
	// 		}
	// 	});

	// 	it("should perform a very simple query with negation operator and return results", async function () {
	// 		try {
	// 			const result = await facade.performQuery(SimpleNegationQuery.input);
	// 			expect(result).have.deep.members(SimpleNegationQuery.output);
	// 		} catch (err) {
	// 			expect.fail("Should not be rejected!");
	// 		}
	// 	});

	// 	it("should perform a simple query with negation operator and return results", async function () {
	// 		try {
	// 			const result = await facade.performQuery(NegationQuery.input);
	// 			expect(result).have.deep.members(NegationQuery.output);
	// 		} catch (err) {
	// 			expect.fail("Should not be rejected!");
	// 		}
	// 	});

	// 	it("should perform a complex query and return results", async function () {
	// 		try {
	// 			const result = await facade.performQuery(complexQuery.input);
	// 			expect(result).have.deep.members(complexQuery.output);
	// 		} catch (err) {
	// 			expect.fail("Should not be rejected!");
	// 		}
	// 	});

	// 	it("should perform a more complex query and return results", async function () {
	// 		try {
	// 			const result = await facade.performQuery(MoreComplexQuery.input);
	// 			expect(result).have.deep.members(MoreComplexQuery.output);
	// 		} catch (err) {
	// 			expect.fail("Should not be rejected!");
	// 		}
	// 	});

	// 	it("should perform a more complex query and return 0 result", async function () {
	// 		try {
	// 			const result = await facade.performQuery(MoreComplexQueryReturn0.input);
	// 			expect(result).have.deep.members(MoreComplexQueryReturn0.output);
	// 		} catch (err) {
	// 			expect.fail("Should not be rejected!");
	// 		}
	// 	});

	// 	it("should perform a query with front wildcard pattern and return results", async function () {
	// 		try {
	// 			const result = await facade.performQuery(wildCardQueryA.input);
	// 			expect(result).have.deep.members(wildCardQueryA.output);
	// 		} catch (err) {
	// 			expect.fail("Should not be rejected!");
	// 		}
	// 	});

	// 	it("should perform a query with end wildcard pattern and return results", async function () {
	// 		try {
	// 			const result = await facade.performQuery(wildCardQueryB.input);
	// 			expect(result).have.deep.members(wildCardQueryB.output);
	// 		} catch (err) {
	// 			expect.fail("Should not be rejected!");
	// 		}
	// 	});

	// 	it("should perform a query with both wildcard patterns and return results", async function () {
	// 		try {
	// 			const result = await facade.performQuery(wildCardQueryC.input);
	// 			expect(result).have.deep.members(wildCardQueryC.output);
	// 		} catch (err) {
	// 			expect.fail("Should not be rejected!");
	// 		}
	// 	});

	// 	it("should perform a query with only wildcard patterns and return results", async function () {
	// 		try {
	// 			const result = await facade.performQuery(wildCardQueryD.input);
	// 			expect(result).have.deep.members(wildCardQueryD.output);
	// 		} catch (err) {
	// 			expect.fail("Should not be rejected!");
	// 		}
	// 	});

	// 	it("should reject invalid complex queries", async function () {
	// 		try {
	// 			const result = await facade.performQuery(complexQuery.input);
	// 			expect(result).have.deep.members(complexQuery.output);
	// 		} catch (err) {
	// 			expect.fail("Should not be rejected!");
	// 		}
	// 	});

	// 	it("should reject queries that exceed the result limit", async function () {
	// 		try {
	// 			await facade.performQuery(exceedLimitQuery);
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(ResultTooLargeError);
	// 		}
	// 	});

	// 	it("should reject due to invalid queries — additional comma", async function () {
	// 		try {
	// 			await facade.performQuery(invalidStringQuery);
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(InsightError);
	// 		}
	// 	});

	// 	it("should reject due to invalid queries — wrong format", async function () {
	// 		try {
	// 			await facade.performQuery(invalidFormatQuery);
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(InsightError);
	// 		}
	// 	});

	// 	it("should reject due to invalid queries — dataset doesn't exist", async function () {
	// 		try {
	// 			await facade.performQuery(invalidReferenceQuery);
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(InsightError);
	// 		}
	// 	});

	// 	it("should reject due to invalid queries — query is empty", async function () {
	// 		try {
	// 			await facade.performQuery({});
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(InsightError);
	// 		}
	// 	});

	// 	it("should reject due to invalid queries — EBNF type unmatch", async function () {
	// 		try {
	// 			await facade.performQuery(invalidEBNFType);
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(InsightError);
	// 		}
	// 	});

	// 	it("should reject due to invalid queries — EBNF invalid key", async function () {
	// 		try {
	// 			await facade.performQuery(invalidEBNFKey);
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(InsightError);
	// 		}
	// 	});

	// 	it("should reject due to invalid queries — EBNF missing where", async function () {
	// 		try {
	// 			await facade.performQuery(invalidEBNFMissingWhere);
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(InsightError);
	// 		}
	// 	});

	// 	it("should reject due to invalid queries — EBNF invalid where type", async function () {
	// 		try {
	// 			await facade.performQuery(invalidEBNFInvalidWhereType);
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(InsightError);
	// 		}
	// 	});

	// 	it("should reject due to invalid queries — EBNF missing options", async function () {
	// 		try {
	// 			await facade.performQuery(invalidEBNFMissingOptions);
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(InsightError);
	// 		}
	// 	});

	// 	it("should reject due to invalid queries — EBNF missing columns", async function () {
	// 		try {
	// 			await facade.performQuery(invalidEBNFMissingColumns);
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(InsightError);
	// 		}
	// 	});

	// 	it("should reject due to invalid queries — EBNF invalid columns type", async function () {
	// 		try {
	// 			await facade.performQuery(invalidEBNFInvalidColumnsType);
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(InsightError);
	// 		}
	// 	});

	// 	it("should reject due to invalid queries — EBNF empty columns", async function () {
	// 		try {
	// 			await facade.performQuery(invalidEBNFEmptyColumns);
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(InsightError);
	// 		}
	// 	});

	// 	it("should reject due to invalid queries — EBNF invalid order key", async function () {
	// 		try {
	// 			await facade.performQuery(invalidEBNFInvalidOrderKey);
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(InsightError);
	// 		}
	// 	});

	// 	it("should reject due to invalid queries — EBNF invalid order type", async function () {
	// 		try {
	// 			await facade.performQuery(invalidEBNFInvalidOrderType);
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(InsightError);
	// 		}
	// 	});

	// 	it("should reject due to invalid queries — EBNF invalid filter key", async function () {
	// 		try {
	// 			await facade.performQuery(invalidEBNFFilterKey);
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(InsightError);
	// 		}
	// 	});

	// 	it("should reject due to invalid queries — EBNF skey on mcomparison", async function () {
	// 		try {
	// 			await facade.performQuery(InvalidKeyMCompOnSKey);
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(InsightError);
	// 		}
	// 	});

	// 	it("should reject due to invalid queries — EBNF mkey on scomparison", async function () {
	// 		try {
	// 			await facade.performQuery(InvalidKeySCompOnMKey);
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(InsightError);
	// 		}
	// 	});

	// 	it("should reject due to invalid queries — multiple datasets", async function () {
	// 		/*
	// 		try {
	// 			await facade.addDataset("ubc", sections, InsightDatasetKind.Rooms);
	// 		} catch (err) {
	// 			expect.fail("Should not be rejected!");
	// 		}
	// 		*/

	// 		try {
	// 			await facade.performQuery(invalidMultipleIDsQuery);
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(InsightError);
	// 		}
	// 	});

	// 	it("should reject due to invalid queries — string query", async function () {
	// 		try {
	// 			await facade.performQuery("invalidEBNFFilterKey");
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(InsightError);
	// 		}
	// 	});

	// 	it("should reject due to invalid queries — int query", async function () {
	// 		try {
	// 			await facade.performQuery(123);
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(InsightError);
	// 		}
	// 	});

	// 	it("should reject due to invalid queries — array query", async function () {
	// 		try {
	// 			await facade.performQuery([]);
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(InsightError);
	// 		}
	// 	});

	// 	it("should reject due to invalid queries — empty string referenced dataset", async function () {
	// 		try {
	// 			await facade.performQuery(InvalidIdStringEmptyId);
	// 			expect.fail("Should have rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceof(InsightError);
	// 		}
	// 	});
	// });

	// describe("PerformQuery with foldertest", () => {
	// 	before(async function () {
	// 		clearDisk();
	// 		rooms = getContentFromArchives("halfPair.zip");
	// 		facade = new InsightFacade();
	// 		try {
	// 			await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
	// 		} catch (err) {
	// 			expect.fail("Should not be rejected!");
	// 		}
	// 	});

	// 	after(function () {
	// 		clearDisk();
	// 	});

	// 	type PQErrorKind = "ResultTooLargeError" | "InsightError";

	// 	folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
	// 		"Dynamic InsightFacade PerformQuery tests",
	// 		async (input) => await facade.performQuery(input),
	// 		"./test/resources/queries",
	// 		{
	// 			assertOnResult: async (actual, expected) => {
	// 				const expectedResult = await expected;
	// 				expect(actual).have.deep.members(expectedResult);
	// 			},
	// 			errorValidator: (error): error is PQErrorKind =>
	// 				error === "ResultTooLargeError" || error === "InsightError",
	// 			assertOnError: (actual, expected) => {
	// 				if (expected === "ResultTooLargeError") {
	// 					expect(actual).to.be.instanceof(ResultTooLargeError);
	// 				} else {
	// 					expect(actual).to.be.instanceof(InsightError);
	// 				}
	// 			},
	// 		}
	// 	);
	// });
});
