import { NextApiHandler } from 'next';
import { Edge, FloorAddress } from '../../../../building';
import { parse_floor } from '../../../../utils/mem';
import { read_wp, write_wp } from '../../../../utils/waypoints';

export type NewEdgeReq = {
	floor_address: FloorAddress;
	edge: Edge;
};

const isNewEdgeReq = (req: any): req is NewEdgeReq => {
	return (
		req &&
		typeof req.floor_address == 'string' &&
		typeof req.edge.w == 'number' &&
		typeof req.edge.o == 'number' &&
		typeof req.edge.type == 'number'
	);
};

export type NewEdgeRes =
	| {
			edge: Edge;
	  }
	| {
			error: string;
	  };

const handler: NextApiHandler<NewEdgeRes> = async (req, res) => {
	const body = req.body;
	if (!isNewEdgeReq(body)) {
		res.status(400).json({ error: 'malformed request' });
	}

	let wp = await read_wp();
	const { building, floor } = parse_floor(body.floor_address.trim());
	if (building && floor && building in wp && floor in wp[building]) {
		let elist = wp[building][floor].edges;
		elist.push(body.edge);

		write_wp(wp);
		res.status(200).json({ edge: body.edge });
	} else {
		res.status(400).json({ error: 'building/floor does not exist' });
	}
};

export default handler;
