import { NextApiHandler } from 'next';
import { LandmarkType, RoomAddress } from '../../building';
import { parse_room, read_db } from '../../utils/mem';

// returns the closest landmark to the given landmark

export type ClosestReq = {
	room_address: RoomAddress;
	type: LandmarkType;
};

const isClosestReq = (req: any): req is ClosestReq => {
	return (
		req && typeof req.room_address == 'string' && typeof req.type == 'string'
	);
};

export type ClosestRes =
	| {
			id: number;
	  }
	| {
			error: string;
	  };

const handler: NextApiHandler<ClosestRes> = async (req, res) => {
	const body = req.body;
	const { building, floor, room } = parse_room(body.room_address.trim());
	const db = await read_db();
	if (isClosestReq(body) && building && floor && room) {
		const rlist = db[building][floor].rooms;
		let x, y;
		for (const item of rlist) {
			if (item.number === room) {
				x = item.position.x;
				y = item.position.y;
			}
		}
		if (x && y) {
			const llist = db[building][floor].landmarks;
			let distance_sq = 1000000;
			let id;
			for (const item of llist) {
				if (item.type == body.type && item.status == 'in-service') {
					let norm =
						Math.pow(x - item.position.x, 2) + Math.pow(y - item.position.y, 2);
					if (norm < distance_sq) {
						id = item.id;
						distance_sq = norm;
					}
				}
			}
			if (id) {
				res.status(200).json({
					id: id,
				});
			} else {
				res.status(400).json({ error: 'boh fra che cazzo ne so' });
			}
		} else {
			res.status(400).json({ error: 'could not find room' });
		}
	} else {
		res.status(400).json({ error: 'malformed request' });
	}
};

export default handler;
