import { promises as fs } from 'fs';
import { Waypoint, Edge } from '../building';

export type WP = { [building: string]: { [floor: string]: Graph } };

export type Graph = {
	waypoints: Waypoint[];
	edges: Edge[];
};

export const read_wp = async (): Promise<WP> => {
	return JSON.parse(await fs.readFile('totally_not_dijkstra.json', 'utf-8'));
};

export const write_wp = async (db: WP) => {
	fs.writeFile('totally_not_a_json.json', JSON.stringify(db, null, '\t'));
};
