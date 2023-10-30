/* eslint-disable max-lines-per-function */
import JSZip, {folder} from "jszip";
import {InsightDataset, InsightDatasetKind, InsightError} from "../controller/IInsightFacade";
import * as fs from "fs-extra";
import * as parse5 from "parse5";
import Room from "../model/Room";
import Rooms from "../model/Rooms";
import * as http from "http";
import {promises} from "dns";

interface GeoResponse {
	lat?: number;
	lon?: number;
	error?: string;
}

enum RoomField {
	shortname = "views-field-field-building-code",
	fullname = "views-field-title",
	address = "views-field-field-building-address",
	number = "views-field-field-room-number",
	seats = "views-field-field-room-capacity",
	furniture = "views-field-field-room-furniture",
	type = "views-field-field-room-type",
	nothing = "views-field-nothing",
}

const persistDir = "./data";

export interface RoomJSON {
	InsightDataset: InsightDataset;
	MappedSection: Record<string, Record<string | number, Room[]>>;
}

export interface RoomIndexes {
	[datasetID: string]: Record<string, Map<string | number, Room[]>>;
}

export default class RoomParser {
	private indexes: Record<string, Map<string | number, Room[]>>;
	private room: Room;
	private rooms: Rooms;
	private results: any[];

	constructor() {
		this.indexes = {};
		this.room = new Room();
		this.rooms = new Rooms();
		this.results = [];
	}

	public async parseRoomsContent(content: string): Promise<Rooms> {
		const decode = (str: string): string => Buffer.from(str, "base64").toString("binary");

		try {
			const data = decode(content);
			const zip = await JSZip.loadAsync(data);

			const zipEntry = zip.files["campus/index.htm"];
			if (!zipEntry) {
				throw new InsightError("Index.htm is not found");
			}
			const indexContent = await zipEntry.async("text");
			try {
				const indexObject = parse5.parse(indexContent);
				await this.findElements(indexObject, zip, true);
			} catch (error) {
				throw new InsightError(`${error}`);
			}

			return Promise.resolve(this.rooms);
		} catch (error) {
			return Promise.reject(new InsightError(`Dataset is invalid: ${error}`));
		}
	}

	public async writeToDisk(
		rooms: Rooms,
		datasetID: string,
		kind: InsightDatasetKind
	): Promise<{insightDataset: InsightDataset; datasetIndexes: RoomIndexes}> {
		const data = rooms.getRooms();

		const rows = data.length;
		const insight = {
			id: datasetID,
			kind: kind,
			numRows: rows,
		};

		const datasetJSON: RoomJSON = {
			InsightDataset: insight,
			MappedSection: {},
		};

		for (const key in data[0]) {
			const fieldName: keyof Room = key as keyof Room;
			this.createIndex(fieldName, data);
			datasetJSON.MappedSection[fieldName] = this.mapToJSON(this.indexes[fieldName]);
		}

		const jsonData = JSON.stringify(datasetJSON, null, 2);

		if (!fs.existsSync(persistDir)) {
			await fs.mkdir(persistDir);
		}

		const filePath = `${persistDir}/${datasetID}.json`;
		await fs.writeFile(filePath, jsonData);

		const datasetIndexes: RoomIndexes = {};
		datasetIndexes[datasetID] = this.indexes;

		const result: {insightDataset: InsightDataset; datasetIndexes: RoomIndexes} = {
			insightDataset: datasetJSON.InsightDataset,
			datasetIndexes: datasetIndexes,
		};

		return Promise.resolve(result);
	}

	private createIndex(fieldName: keyof Room, data: Room[]): void {
		const index = new Map<string | number, Room[]>();
		for (const item of data) {
			const value = item[fieldName];
			if (!index.has(value)) {
				index.set(value, []);
			}
			index.get(value)?.push(item);
		}
		this.indexes[fieldName] = index;
	}

	private mapToJSON(map: Map<string | number, Room[]>): Record<string | number, Room[]> {
		const json: Record<string | number, Room[]> = {};
		map.forEach((value, key) => {
			json[key as string] = value;
		});
		return json;
	}

	private async findElements(node: any, zip: JSZip, processBuilding: boolean): Promise<void> {
		if (node.tagName === "td") {
			const classAttribute = node.attrs.find((attr: {name: string}) => attr.name === "class");
			if (classAttribute && classAttribute.value.includes("views-field")) {
				this.results.push(node);
				if (processBuilding) {
					try {
						await this.processElement(node, zip);
					} catch (error) {
						throw new InsightError(`Error processing element: ${error}`);
					}
				} else {
					try {
						await this.processMoreInfo(node);
					} catch (error) {
						throw new InsightError(`Error processing more info: ${error}`);
					}
				}
			}
		}
		let childPromises = [];
		const selectedNodeNames = ["#comment", "#text", "#documentType", "head",
			"script", "footer", "noscript", "header"];
		if (node.childNodes) {
			node.childNodes = node.childNodes.filter(
				(childNode: any) => !selectedNodeNames.includes(childNode.nodeName)
			);
			childPromises = node.childNodes.map((child: any) => this.findElements(child, zip, processBuilding));
			await Promise.all(childPromises);
		}
	}

	private async processElement(node: any, zip: JSZip) {
		const className: string = node.attrs[0].value;
		const field: string = className.split(" ")[1];
		if (field !== RoomField.fullname && field !== RoomField.nothing && node.childNodes.length !== 1) {
			return;
		}
		const value: string | number = node.childNodes[0].value;

		switch (field) {
			case RoomField.shortname:
				this.room.shortname = this.formatValue(value);
				break;

			case RoomField.fullname: {
				const fullname = node.childNodes[1].childNodes[0].value;
				this.room.fullname = fullname;
				break;
			}

			case RoomField.address: {
				this.room.address = this.formatValue(value);
				break;
			}

			case RoomField.nothing: {
				try {
					const geoLocation = await this.getGeolocation(this.room.address);
					if (!geoLocation.lat || !geoLocation.lon || geoLocation.error) {
						throw new InsightError("Error when getting Geolocation: " + geoLocation.error);
					}
					this.room.lat = geoLocation.lat;
					this.room.lon = geoLocation.lon;

					const roomLink: string = node.childNodes[1].attrs[0].value;
					const zipEntry = zip.files["campus/" + roomLink.substring(2)];
					const indexContent = await zipEntry.async("text");
					const indexObject = parse5.parse(indexContent);
					await this.findElements(indexObject, zip, false);
					break;
				} catch (error) {
					throw new InsightError(`Error finding building information: ${error} with node: ${node}`);
				}
			}
		}
	}

	private async processMoreInfo(node: any) {
		const className: string = node.attrs[0].value;
		const field: string = className.split(" ")[1];
		if (field !== RoomField.nothing && field !== RoomField.number && node.childNodes.length !== 1) {
			return;
		}
		const value: string | number = node.childNodes[0].value;

		switch (field) {
			case RoomField.number: {
				const number: string = node.childNodes[1].childNodes[0].value;
				this.room.number = number;
				this.room.name = `${this.room.shortname}_${number}`;
				break;
			}

			case RoomField.seats:
				this.room.seats = Number(value);
				break;

			case RoomField.furniture:
				this.room.furniture = this.formatValue(value);
				break;

			case RoomField.type:
				this.room.type = this.formatValue(value);
				break;

			case RoomField.nothing: {
				const href: string = node.childNodes[1].attrs[0].value;
				this.room.href = href;
				this.rooms.addRoom(this.room);
				break;
			}
		}
	}

	private getGeolocation = (address: string): Promise<GeoResponse> => {
		return new Promise<GeoResponse>((resolve, reject) => {
			const encodedAddress = encodeURIComponent(address);
			const url = `http://cs310.students.cs.ubc.ca:11316/api/v1/project_team246/${encodedAddress}`;

			http
				.get(url, (response) => {
					let data = "";

					// A chunk of data has been received.
					response.on("data", (chunk) => {
						data += chunk;
					});

					// The whole response has been received.
					response.on("end", () => {
						try {
							const parsedData: GeoResponse = JSON.parse(data);
							resolve(parsedData);
						} catch (error) {
							reject({error: "Failed to parse response data"});
						}
					});
				})
				.on("error", (error) => {
					reject({error: `Error: ${error.message}`});
				});
		});
	};

	private formatValue(value: string | number): string {
		return value.toString().trim().replace("\n", "");
	}
}
