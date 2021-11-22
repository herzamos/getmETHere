import { NextApiHandler } from 'next';
import { Edge, FloorAddress, Waypoint } from '../../../../building';
import { parse_floor } from '../../../../utils/mem';
import { Graph, read_wp, write_wp } from '../../../../utils/waypoints';

export type AllReq = {
	floor_address: FloorAddress;
};

const isAllReq = (req: any): req is AllReq => {
	return req && typeof req.floor_address == 'string';
};

export type AllRes =
	| Graph
	| {
			error: string;
	  };

const handler: NextApiHandler<AllRes> = async (req, res) => {
	const body = req.body;
	if (!isAllReq(body)) {
		res.status(400).json({ error: 'malformed request' });
	}

	const wp = await read_wp();
	const { building, floor } = parse_floor(body.floor_address.trim());
	if (building && floor && building in wp && floor in wp[building]) {
		const all: Graph = wp[building][floor];
		res.status(200).json(all);
	} else {
		res.status(400).json({ error: 'building/floor does not exist' });
	}
};

export default handler;
