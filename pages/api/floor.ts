import { NextApiHandler } from 'next';
import { FloorAddress } from '../../building';
import { FloorResOk, parse_floor, read_db } from '../../utils/mem';

export type FloorReq = {
	floor_address: FloorAddress;
};

export type FloorRes = FloorResOk | { error: string };

const isFloorReq = (req: any): req is FloorReq => {
	return req && typeof req.floor_address == 'string';
};

const handler: NextApiHandler<FloorRes> = async (req, res) => {
	const body = req.body;
	const { building, floor } = parse_floor(body.floor_address.trim());
	const db = await read_db();
	if (
		isFloorReq(body) &&
		building &&
		floor &&
		building in db &&
		floor in db[building]
	) {
		res.status(200).json(db[building][floor]);
	} else {
		res.status(400).json({ error: 'malformed request' });
	}
};

export default handler;
