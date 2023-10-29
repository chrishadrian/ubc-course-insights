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

	constructor() {
		this.fullname = "";
		this.shortname = "";
		this.furniture = "";
		this.number = "";
		this.name = "";
		this.address = "";
		this.lat = 0;
		this.lon = 0;
		this.type = "";
		this.href = "";
		this.seats = 0;
	}
}
