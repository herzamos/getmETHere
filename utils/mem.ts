import { promises as fs } from 'fs';
import { FloorAddress, Landmark, Position, Room } from '../building';

type DB = { [building: string]: { [floor: string]: FloorResOk } };

export const read_db = async (): Promise<DB> => {
	return JSON.parse(await fs.readFile('totally_not_a_json.json', 'utf-8'));
};

export const write_db = async (db: DB) => {
	fs.writeFile('totally_not_a_json.json', JSON.stringify(db, null, '\t'));
};

export const parse_floor = (floor_addr: string) => {
	const split = floor_addr.split(' ');
	if (split.length != 2) {
		console.log(`ERROR parsing floor address: (${floor_addr})`);
		return {};
	} else {
		return {
			building: split[0],
			floor: split[1],
		};
	}
};

export const parse_room = (room_addr: string) => {
	const split = room_addr.split(' ');
	if (split.length != 3) {
		console.log(`ERROR parsing room address: (${room_addr})`);
		return {};
	} else {
		return {
			building: split[0],
			floor: split[1],
			room: split[2],
		};
	}
};

export type FloorReq = {
	floor_address: FloorAddress;
};
export type FloorResOk = {
	floor_url: string;
	origin: Position;
	/** Width in meters of the image */
	width: number;
	landmarks: Landmark[];
	rooms: Room[];
};

export default DB;
