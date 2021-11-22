import { NextApiHandler } from 'next';
import { read_db, write_db } from '../../../utils/mem';
import { read_wp, write_wp } from '../../../utils/waypoints';

type RmBuildingReq = {
	building: string;
};

const isRmBuildingReq = (obj: any): obj is RmBuildingReq => {
	return obj && typeof obj.building == 'string';
};

const handler: NextApiHandler<{}> = async (req, res) => {
	const body = req.body;
	if (isRmBuildingReq(body)) {
		let db = await read_db();
		let wp = await read_wp();
		const key = body.building;
		if (!(key in db)) {
			res.status(409).json({ error: 'Building does not exist' });
			return;
		} else {
			delete db[key];
			delete wp[key];
		}
		await write_db(db);
		await write_wp(wp);
		res.status(200).json({});
	} else {
		res.status(400).json({ error: 'wrong request params' });
	}
};

export default handler;
