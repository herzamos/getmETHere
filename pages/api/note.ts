import { NextApiHandler } from 'next';
import { RoomAddress } from '../../building';
import { parse_room, read_db } from '../../utils/mem';

export type NoteReq = {
	room_address: RoomAddress;
};

export type NoteRes =
	| {
			note: string;
	  }
	| { error: string };

const handler: NextApiHandler<NoteRes> = async (req, res) => {
	const body = req.body;
	const { building, floor, room } = parse_room(body.room_address.trim());
	const db = await read_db();
	if (
		req &&
		typeof body.room_address == 'string' &&
		building &&
		floor &&
		room
	) {
		if (!(building in db) || !(floor in db[building])) {
			res.status(400).json({
				error: 'room does not exist',
			});
			return;
		}
		const rlist = db[building][floor].rooms;
		const note = rlist.filter((t) => t.number === room);
		if (note.length != 1) {
			res.status(400).json({
				error: 'Something went wrong in totally_not_a_json.json',
			});
		} else {
			res.status(200).json({
				note: note[0].note || '',
			});
		}
	} else {
		res.status(400).json({ error: 'invalid parameters' });
	}
};

export default handler;
