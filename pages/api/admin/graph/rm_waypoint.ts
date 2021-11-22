import { NextApiHandler } from 'next';
import { FloorAddress, Position, Waypoint } from '../../../../building';
import { parse_floor } from '../../../../utils/mem';
import { read_wp, write_wp } from '../../../../utils/waypoints';
import { AllRes } from './all';

export type RmWaypointReq = {
	floor_address: FloorAddress;
	id: number;
};

const isRmWaypointReq = (req: any): req is RmWaypointReq => {
	return (
		req &&
		typeof req.floor_address == 'string' &&
		typeof req.position.id == 'number'
	);
};

const handler: NextApiHandler<AllRes> = async (req, res) => {
	const body = req.body;
	if (!isRmWaypointReq(body)) {
		res.status(400).json({ error: 'malformed request' });
	}

	let wp = await read_wp();
	const { building, floor } = parse_floor(body.floor_address.trim());
	if (building && floor && building in wp && floor in wp[building]) {
		let wlist = wp[building][floor].waypoints;
		let elist = wp[building][floor].edges;

		wlist = wlist.filter((word) => word.id != body.id);
		elist = elist.filter((edge) => {
			return edge.w != body.id && edge.o != body.id;
		});

		write_wp(wp);
		res.status(200).json(wp[building][floor]);
	} else {
		res.status(400).json({ error: 'building/floor does not exist' });
	}
};

export default handler;
