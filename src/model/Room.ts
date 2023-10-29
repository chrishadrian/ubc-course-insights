export default class Room {
	public fullname: string;
	public shortname: string;
	public furniture: string;
	public number: string;
	public name: string;
	public address: string;
	public lat: number;
	public lon: number;
	public type: string;
	public href: string;
	public seats: number;

	constructor(room?: Room) {
		this.fullname = room ? room.fullname : "";
		this.shortname = room ? room.shortname : "";
		this.furniture = room ? room.furniture : "";
		this.number = room ? room.number : "";
		this.name = room ? room.name : "";
		this.address = room ? room.address : "";
		this.lat = room ? room.lat : 0;
		this.lon = room ? room.lon : 0;
		this.type = room ? room.type : "";
		this.href = room ? room.href : "";
		this.seats = room ? room.seats : 0;
	}
}
