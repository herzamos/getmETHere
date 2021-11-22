import { NextApiHandler } from 'next';
import { Position } from '../../../building';
import { read_db, write_db, parse_floor } from '../../../utils/mem';

export type SetOriginReq = {
	floor_address: string;
	position: Position;
};

const isSetOriginReq = (obj: any): obj is SetOriginReq => {
	return (
		obj &&
		typeof obj.floor_address == 'string' &&
		typeof obj.position.x == 'number' &&
		typeof obj.position.y == 'number'
	);
};

const handler: NextApiHandler<{}> = async (req, res) => {
	const body = req.body;
	const { building, floor } = parse_floor(body.floor_address.trim());
	let db = await read_db();
	if (
		isSetOriginReq(body) &&
		building &&
		floor &&
		building in db &&
		floor in db[building]
	) {
		db[building][floor].origin = body.position;
		await write_db(db);
		res.status(200).json({});
	} else {
		res.status(400).json({ error: 'wrong request params' });
	}
};

export default handler;
