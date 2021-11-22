import { NextApiHandler } from 'next';
import { Landmark, LandmarkType } from '../../building';

export type Response = {
	directions: Landmark[];
};

const handler: NextApiHandler<Response> = async (req, res) => {
	const closest_landmark: Landmark = {
		id: 1,
		type: LandmarkType.Printer,
		floor_address: 'CAB G',
		position: { x: 10, y: 10 },
		status: 'in-service',
	};

	const intermediate_landmark: Landmark = {
		id: 2,
		type: LandmarkType.VendingMachine,
		floor_address: 'CAB G',
		position: { x: 5, y: 5 },
		status: 'in-service',
	};
	res
		.status(200)
		.json({ directions: [intermediate_landmark, closest_landmark] });
};

export default handler;
