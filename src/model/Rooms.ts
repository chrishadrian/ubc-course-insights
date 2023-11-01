import Room from "./Room";

export default class Rooms {
	private rooms: Room[];

	constructor(rooms?: Room[]) {
		this.rooms = rooms || [];
	}

	public addRoom(room: Room) {
		this.rooms.push(room);
	}

	public getRooms(): Room[] {
		return this.rooms;
	}
}
