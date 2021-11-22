import { NextApiHandler } from 'next';
import { Position, Room } from '../../../building';
import { read_db, write_db, parse_floor } from '../../../utils/mem';

export type NewRoomReq = {
	floor_address: string;
	number: string;
	position: Position;
	note: string;
};

export type NewRoomRes =
	| {
			room: Room;
	  }
	| {
			error: string;
	  };

const isNewRoomReq = (req: any): req is NewRoomReq => {
	return (
		req &&
		typeof req.floor_address == 'string' &&
		typeof req.number == 'string' &&
		typeof req.position.x == 'number' &&
		typeof req.position.y == 'number'
	);
};

const handler: NextApiHandler<NewRoomRes> = async (req, res) => {
	const body = req.body;
	const { building, floor } = parse_floor(body.floor_address.trim());
	let db = await read_db();
	if (
		isNewRoomReq(body) &&
		building &&
		floor &&
		building in db &&
		floor in db[building]
	) {
		let rlist = db[building][floor].rooms;
		let unique_id = 0;
		for (const elem of rlist) {
			unique_id = Math.max(unique_id, elem.id);
		}
		unique_id++;

		const new_room: Room = {
			id: unique_id,
			number: body.number,
			floor_address: body.floor_address,
			position: body.position,
			status: 'free',
			note: body.note,
		};

		rlist.push(new_room);

		await write_db(db);
		res.status(200).json({ room: new_room });
	} else {
		res.status(400).json({ error: 'wrong request params' });
	}
};

export default handler;
