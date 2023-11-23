export default class Room {
	public fullname?: string;
	public shortname?: string;
	public furniture?: string;
	public number?: string;
	public name?: string;
	public address?: string;
	public lat?: number;
	public lon?: number;
	public type?: string;
	public href?: string;
	public seats?: number;

	constructor(room?: Room) {
		this.fullname = room ? room.fullname : undefined;
		this.shortname = room ? room.shortname : undefined;
		this.furniture = room ? room.furniture : undefined;
		this.number = room ? room.number : undefined;
		this.name = room ? room.name : undefined;
		this.address = room ? room.address : undefined;
		this.lat = room ? room.lat : undefined;
		this.lon = room ? room.lon : undefined;
		this.type = room ? room.type : undefined;
		this.href = room ? room.href : undefined;
		this.seats = room ? room.seats : undefined;
	}

	public isInvalidBuilding(): boolean {
		return this.fullname === undefined || this.shortname === undefined || this.address === undefined;
	}

	public resetBuildingInfo(): void {
		this.fullname = undefined;
		this.shortname = undefined;
		this.address = undefined;
	}

	public isInvalidRoom(): boolean {
		return (
			this.furniture === undefined ||
			this.number === undefined ||
			this.type === undefined ||
			this.href === undefined ||
			this.seats === undefined
		);
	}

	public resetRoomInfo(): void {
		this.furniture = undefined;
		this.number = undefined;
		this.type = undefined;
		this.href = undefined;
		this.seats = undefined;
	}
}
