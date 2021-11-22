import { NextApiHandler } from 'next';
import BuildManifestPlugin from 'next/dist/build/webpack/plugins/build-manifest-plugin';
import { read_db, write_db, parse_floor } from '../../../utils/mem';
import { read_wp, write_wp } from '../../../utils/waypoints';

type RmFloorReq = {
	floor_address: string;
};

const isRmFloorReq = (obj: any): obj is RmFloorReq => {
	return obj && typeof obj.floor_address == 'string';
};

const handler: NextApiHandler<{}> = async (req, res) => {
	const body = req.body;
	const { building, floor } = parse_floor(body.floor_address.trim());
	let db = await read_db();
	let wp = await read_wp();
	if (isRmFloorReq(body) && building && floor && building in db) {
		if (!(building in db && floor in db[building])) {
			res.status(409).json({ error: 'Floor/building does not exist' });
		} else {
			delete wp[building][floor];
			delete db[building][floor];
			await write_wp(wp);
			await write_db(db);
			res.status(200).json({});
		}
	} else {
		res.status(400).json({ error: 'wrong request params' });
	}
};

export default handler;
