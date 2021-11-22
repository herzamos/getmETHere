import { NextApiHandler } from 'next';
import { RoomAddress } from '../../building';
import { parse_room, read_db } from '../../utils/mem';

export type ExistsReq = {
	room_address: RoomAddress;
};

export type ExistsRes =
	| {
			exists: boolean;
	  }
	| { error: string };

const handler: NextApiHandler<ExistsRes> = async (req, res) => {
	const body = req.body;
	const room_address: string = body.room_address || '';
	const { building, floor, room } = parse_room(
		room_address.trim().toUpperCase()
	);
	const db = await read_db();
	if (
		req &&
		typeof body.room_address == 'string' &&
		building &&
		floor &&
		room
	) {
		if (!(building in db) || !(floor in db[building])) {
			res.status(200).json({
				exists: false,
			});
			return;
		}
		const rlist = db[building][floor].rooms;
		for (const elem of rlist) {
			if (elem.number === room) {
				res.status(200).json({
					exists: true,
				});
				return;
			}
		}
		res.status(200).json({
			exists: false,
		});
	} else {
		res.status(400).json({ error: 'invalid parameters' });
	}
};

export default handler;
