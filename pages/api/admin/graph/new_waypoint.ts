import { NextApiHandler } from 'next';
import { FloorAddress, Position, Waypoint } from '../../../../building';
import { parse_floor } from '../../../../utils/mem';
import { read_wp, write_wp } from '../../../../utils/waypoints';

export type NewWaypointReq = {
	floor_address: FloorAddress;
	position: Position;
};

const isNewWaypointReq = (req: any): req is NewWaypointReq => {
	return (
		req &&
		typeof req.floor_address == 'string' &&
		typeof req.position.x == 'number' &&
		typeof req.position.y == 'number'
	);
};

export type NewWaypointRes =
	| {
			waypoint: Waypoint;
	  }
	| {
			error: string;
	  };

const handler: NextApiHandler<NewWaypointRes> = async (req, res) => {
	const body = req.body;
	if (!isNewWaypointReq(body)) {
		res.status(400).json({ error: 'malformed request' });
	}

	let wp = await read_wp();
	const { building, floor } = parse_floor(body.floor_address.trim());
	if (building && floor && building in wp && floor in wp[building]) {
		let wlist = wp[building][floor].waypoints;
		let unique_id = 0;
		for (const elem of wlist) {
			unique_id = Math.max(unique_id, elem.id);
		}
		unique_id++;

		const nwaypoint: Waypoint = {
			id: unique_id,
			position: body.position,
		};

		wlist.push(nwaypoint);

		write_wp(wp);
		res.status(200).json({ waypoint: nwaypoint });
	} else {
		res.status(400).json({ error: 'building/floor does not exist' });
	}
};

export default handler;
