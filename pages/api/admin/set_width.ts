import { NextApiHandler } from 'next';
import { Position } from '../../../building';
import { read_db, write_db, parse_floor } from '../../../utils/mem';

export type SetWidthReq = {
	floor_address: string;
	width: number;
};

const isSetWidthReq = (obj: any): obj is SetWidthReq => {
	return (
		obj && typeof obj.floor_address == 'string' && typeof obj.width == 'number'
	);
};

const handler: NextApiHandler<{}> = async (req, res) => {
	const body = req.body;
	const { building, floor } = parse_floor(body.floor_address.trim());
	let db = await read_db();
	if (
		isSetWidthReq(body) &&
		building &&
		floor &&
		building in db &&
		floor in db[building]
	) {
		db[building][floor].width = body.width;
		await write_db(db);
		res.status(200).json({});
	} else {
		res.status(400).json({ error: 'wrong request params' });
	}
};

export default handler;
