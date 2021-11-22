import { NextApiHandler } from 'next';
import { Building, Floor } from '../../building';
import DB, { read_db } from '../../utils/mem';

export type Resp = {
	building_list: Building[];
};

const handler: NextApiHandler<Resp> = async (req, res) => {
	const db = await read_db();
	let blist: Building[] = [];
	for (const [key, value] of Object.entries(db)) {
		let flist: Floor[] = [];
		for (const [ikey, ivalue] of Object.entries(db[key])) {
			const flr = {
				code: ikey,
				building_code: key,
			};
			flist.push(flr);
		}
		flist.sort((a, b) => {
			if (a.code < b.code) return -1;
			if (a.code > b.code) return 1;
			return 0;
		});
		let bld: Building = {
			name: key,
			code: key,
			floors: flist,
		};
		blist.push(bld);
	}

	res.status(200).json({
		building_list: blist,
	});
};

export default handler;
