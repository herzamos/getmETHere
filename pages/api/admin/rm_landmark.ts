import { NextApiHandler } from 'next';
import { FloorAddress } from '../../../building';
import { parse_floor, read_db, write_db } from '../../../utils/mem';

export type RmLandmarkReq = {
	floor_address: FloorAddress;
	id: number;
};

const isRmLandmarkReq = (req: any): req is RmLandmarkReq => {
	return (
		req && typeof req.floor_address == 'string' && typeof req.id == 'number'
	);
};

const handler: NextApiHandler<{}> = async (req, res) => {
	const body = req.body;
	const { building, floor } = parse_floor(body.floor_address.trim());
	let db = await read_db();
	if (
		isRmLandmarkReq(body) &&
		building &&
		floor &&
		building in db &&
		floor in db[building]
	) {
		let llist = db[building][floor].landmarks;
		const index = llist.findIndex((item) => item && item.id == body.id);
		if (index == -1) {
			res.status(409).json({ error: 'Landmark with this id does not exist' });
		} else {
			llist.splice(index, 1);
			await write_db(db);
			res.status(200).json({});
		}
	} else {
		res.status(400).json({ error: 'wrong request params' });
	}
};

export default handler;
