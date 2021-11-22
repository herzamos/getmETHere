import { NextApiHandler } from 'next';
import { read_db, write_db, parse_floor } from '../../../utils/mem';
import { read_wp, write_wp } from '../../../utils/waypoints';

type NewFloorReq = {
	floor_address: string;
};

const isNewFloorReq = (obj: any): obj is NewFloorReq => {
	return obj && typeof obj.floor_address == 'string';
};

const handler: NextApiHandler<{}> = async (req, res) => {
	const body = req.body;
	const { building, floor } = parse_floor(body.floor_address.trim());
	let db = await read_db();
	// let wp = await read_wp();
	if (isNewFloorReq(body) && building && floor && building in db) {
		if (building in db && floor in db[building]) {
			res.status(409).json({ error: 'Floor already exists' });
		} else {
			db[building][floor] = {
				floor_url: `/${building}_${floor}.svg`,
				origin: {
					x: 0,
					y: 0,
				},
				width: 50,
				landmarks: [],
				rooms: [],
			};
			// wp[building][floor] = {
			//     waypoints: [],
			//     edges: [],
			// };

			await write_db(db);
			// write_wp(wp);
			res.status(200).json({});
		}
	} else {
		res.status(400).json({ error: 'wrong request params' });
	}
};

export default handler;
