import { NextApiHandler } from 'next';
import { Landmark, LandmarkType, Position } from '../../../building';
import { read_db, write_db, parse_floor } from '../../../utils/mem';

export type NewLandmarkReq = {
	floor_address: string;
	landmark_type: LandmarkType;
	position: Position;
	note: string;
};

export type NewLandmarkRes =
	| {
			landmark: Landmark;
	  }
	| {
			error: string;
	  };

const isNewLandmarkReq = (req: any): req is NewLandmarkReq => {
	return (
		req &&
		typeof req.floor_address == 'string' &&
		typeof req.landmark_type == 'string' &&
		typeof req.position.x == 'number' &&
		typeof req.position.y == 'number'
	);
};

const handler: NextApiHandler<NewLandmarkRes> = async (req, res) => {
	const body = req.body;
	const { building, floor } = parse_floor(body.floor_address.trim());
	let db = await read_db();
	if (
		isNewLandmarkReq(body) &&
		building &&
		floor &&
		building in db &&
		floor in db[building]
	) {
		let llist = db[building][floor].landmarks;
		let unique_id = 0;
		for (const elem of llist) {
			unique_id = Math.max(unique_id, elem.id);
		}
		unique_id++;

		const landmark: Landmark = {
			id: unique_id,
			type: body.landmark_type,
			floor_address: body.floor_address,
			position: body.position,
			status: 'in-service',
			note: body.note,
		};

		llist.push(landmark);

		await write_db(db);
		res.status(200).json({ landmark });
	} else {
		res.status(400).json({ error: 'wrong request params' });
	}
};

export default handler;
