import Room from "./Room";

export default class Rooms {
	private rooms: Room[];

	constructor(rooms?: Room[]) {
		this.rooms = rooms || [];
	}

	public addRoom(room: Room) {
		const finalRoom = new Room(room);
		this.rooms.push(finalRoom);
	}

	public getRooms(): Room[] {
		return this.rooms;
	}
}
