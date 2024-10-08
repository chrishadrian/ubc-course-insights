import JSZip from "jszip";
import {InsightDataset, InsightDatasetKind, InsightError} from "../controller/IInsightFacade";
import * as fs from "fs-extra";
import * as parse5 from "parse5";
import Room from "../model/Room";
import Rooms from "../model/Rooms";
import Geolocation from "./Geolocation";

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
	InsightIndexes: Record<string, Record<string | number, Room[]>>;
}

export interface RoomIndexes {
	[datasetID: string]: Record<string, Map<string | number, Room[]>>;
}

export default class RoomParser {
	private indexes: Record<string, Map<string | number, Room[]>>;
	private room: Room;
	private rooms: Rooms;
	private validIndex: boolean;
	private validRoom: boolean;

	constructor() {
		this.indexes = {};
		this.room = new Room();
		this.rooms = new Rooms();
		this.validIndex = false;
		this.validRoom = false;
	}

	public async parseRoomsContent(content: string): Promise<Rooms> {
		const decode = (str: string): string => Buffer.from(str, "base64").toString("binary");

		try {
			const data = decode(content);
			const zip = await JSZip.loadAsync(data);

			const zipEntry = zip.files["index.htm"];
			if (!zipEntry) {
				throw new InsightError("Index.htm is not found");
			}
			const indexContent = await zipEntry.async("text");
			try {
				const indexObject = parse5.parse(indexContent);
				await this.findElements(indexObject, zip, true, this.room);
				if (!this.validIndex) {
					throw new InsightError("index.htm is invalid!");
				} else if (!this.validRoom) {
					throw new InsightError("room.htm is not found!");
				}
			} catch (error) {
				throw new InsightError(`Error when parsing room content: ${error}`);
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
			InsightIndexes: {},
		};

		for (const key in data[0]) {
			const fieldName: keyof Room = key as keyof Room;
			this.createIndex(fieldName, data);
			datasetJSON.InsightIndexes[fieldName] = this.mapToJSON(this.indexes[fieldName]);
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
			const value = item[fieldName] as string|number;
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

	private async findElements(node: any, zip: JSZip, processBuilding: boolean, currentRoom: Room): Promise<void> {
		if (node.tagName === "td") {
			const classAttribute = this.findNodeAttrByName(node, "class");
			if (classAttribute && classAttribute.value.includes("views-field")) {
				if (!this.validIndex) {
					this.validIndex = true;
				}
				if (processBuilding) {
					try {
						await this.processElement(node, zip);
					} catch (error) {
						throw new InsightError(`Error processing element: ${error}`);
					}
				} else {
					try {
						if (!this.validRoom) {
							this.validRoom = true;
						}
						this.processMoreInfo(node, currentRoom);
					} catch (error) {
						throw new InsightError(`Error processing more info: ${error}`);
					}
				}
			}
		}
		let childPromises = [];
		const selectedNodeNames = [
			"#comment", "#text", "#documentType", "head", "script", "footer", "noscript", "header"
		];
		if (node.childNodes) {
			node.childNodes = node.childNodes.filter(
				(childNode: any) => !selectedNodeNames.includes(childNode.nodeName)
			);
			childPromises = node.childNodes.map(
				(child: any) => this.findElements(child, zip, processBuilding, currentRoom)
			);
			await Promise.all(childPromises);
		}
	}

	private async processElement(node: any, zip: JSZip) {
		const className: string = this.findNodeAttrByName(node, "class").value;
		const field: string = className.split(" ")[1];
		if (field !== RoomField.fullname && field !== RoomField.nothing && node.childNodes.length !== 1) {
			return;
		}
		const value: string | number = this.findChildByNodeName(node, "#text").value;

		switch (field) {
			case RoomField.shortname:
				this.room.shortname = this.formatValue(value);
				break;

			case RoomField.fullname: {
				const nodeTagA = this.findChildByNodeName(node, "a");
				const fullname = this.findChildByNodeName(nodeTagA, "#text").value;
				this.room.fullname = fullname;
				break;
			}

			case RoomField.address: {
				this.room.address = this.formatValue(value);
				break;
			}

			case RoomField.nothing: {
				try {
					if (this.room.isInvalidBuilding()) {
						this.room.resetBuildingInfo();
						break;
					}
					const util = new Geolocation();
					const currentRoom = this.room;
					this.room = new Room();
					const geoLocation = await util.getGeolocation(currentRoom.address);
					if (!geoLocation.lat || !geoLocation.lon || geoLocation.error) {
						throw new InsightError("Error when getting Geolocation: " + geoLocation.error);
					}
					currentRoom.lat = geoLocation.lat;
					currentRoom.lon = geoLocation.lon;

					const indexObject = await this.getRoomIndexObject(node, zip);
					await this.findElements(indexObject, zip, false, currentRoom);
					break;
				} catch (error) {
					break;
				}
			}
		}
	}

	private async getRoomIndexObject(node: any, zip: JSZip) {
		const nodeTagA = this.findChildByNodeName(node, "a");
		const roomLink: string = this.findNodeAttrByName(nodeTagA, "href").value;
		const zipEntry = zip.files[roomLink.substring(2)];
		const indexContent = await zipEntry.async("text");
		const indexObject = parse5.parse(indexContent);
		return indexObject;
	}

	private processMoreInfo(node: any, currentRoom: Room) {
		try {
			const className: string = this.findNodeAttrByName(node, "class").value;
			const field: string = className.split(" ")[1];
			if (field !== RoomField.nothing && field !== RoomField.number && node.childNodes.length !== 1) {
				return;
			}
			const value: string | number = this.findChildByNodeName(node, "#text").value;

			switch (field) {
				case RoomField.number: {
					const nodeTagA = this.findChildByNodeName(node, "a");
					const number = this.findChildByNodeName(nodeTagA, "#text").value;
					currentRoom.number = number;
					currentRoom.name = `${currentRoom.shortname}_${number}`;
					break;
				}

				case RoomField.seats:
					currentRoom.seats = Number(value);
					break;

				case RoomField.furniture:
					currentRoom.furniture = this.formatValue(value);
					break;

				case RoomField.type:
					currentRoom.type = this.formatValue(value);
					break;

				case RoomField.nothing: {
					const nodeTagA = this.findChildByNodeName(node, "a");
					const href = this.findNodeAttrByName(nodeTagA, "href").value;
					currentRoom.href = href;
					if (!currentRoom.isInvalidRoom()){
						const completeRoom = new Room(currentRoom);
						this.rooms.addRoom(completeRoom);
					}
					currentRoom.resetRoomInfo();
					break;
				}
			}
		} catch (error) {
			throw new InsightError(`${error}`);
		}
	}

	private formatValue(value: string | number): string {
		return value.toString().trim().replace("\n", "");
	}

	private findChildByNodeName(node: any, nodeName: string) {
		return node.childNodes.find((child: {nodeName: string}) => child.nodeName === nodeName);
	}

	private findNodeAttrByName(node: any, name: string) {
		return node.attrs.find((attr: {name: string}) => attr.name === name);
	}
}
