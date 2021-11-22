import { NextApiHandler } from 'next';
import { FloorAddress } from '../../../building';
import { parse_floor, read_db, write_db } from '../../../utils/mem';

export type RmRoomReq = {
	floor_address: FloorAddress;
	id: number;
};

const isRmRoomReq = (req: any): req is RmRoomReq => {
	return (
		req && typeof req.floor_address == 'string' && typeof req.id == 'number'
	);
};

const handler: NextApiHandler<{}> = async (req, res) => {
	const body = req.body;
	const { building, floor } = parse_floor(body.floor_address.trim());
	let db = await read_db();
	if (
		isRmRoomReq(body) &&
		building &&
		floor &&
		building in db &&
		floor in db[building]
	) {
		let rlist = db[building][floor].rooms;
		const index = rlist.findIndex((item) => item && item.id == body.id);
		if (index == -1) {
			res.status(409).json({ error: 'Room with this id does not exist' });
		} else {
			rlist.splice(index, 1);
			await write_db(db);
			res.status(200).json({});
		}
	} else {
		res.status(400).json({ error: 'wrong request params' });
	}
};

export default handler;
