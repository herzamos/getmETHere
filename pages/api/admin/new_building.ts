import { NextApiHandler } from 'next';
import { read_db, write_db } from '../../../utils/mem';
import { read_wp, write_wp } from '../../../utils/waypoints';

type NewBuildingReq = {
	building: string;
};

const isNewBuildingReq = (obj: any): obj is NewBuildingReq => {
	return obj && typeof obj.building == 'string';
};

const handler: NextApiHandler<{}> = async (req, res) => {
	const body = req.body;
	if (isNewBuildingReq(body)) {
		let db = await read_db();
		let wp = await read_wp();
		const key = body.building;
		if (key in db) {
			res.status(409).json({ error: 'Building already exists' });
			return;
		} else {
			wp[key] = {};
			db[key] = {};
		}
		await write_db(db);
		await write_wp(wp);
		res.status(200).json({});
	} else {
		res.status(400).json({ error: 'wrong request params' });
	}
};

export default handler;
