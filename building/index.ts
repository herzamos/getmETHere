/** Type used for internal ids, bound to the database index type */
export type FloorID = number;
export type LandmarkID = number;
export type RoomID = number;

/** Short code, used for buildings (`HG`, `CAB`, ...) and floors (`E`, `F`, ...) */
export type Code = string;
/** e.g. `HG E 12` */
export type RoomAddress = string;
/** e.g. `HG E` */
export type FloorAddress = string;
/** position on the map */
export interface Position {
	x: number;
	y: number;
}

/** Building containing basic information */
export interface Building {
	/** Long name of the building */
	name: string;
	/** Code of the building, e.g. `HG`, `CAB`, ... */
	code: Code;
	/** Bottom to top floor map */
	floors: Floor[];
}

/** Short description of a floor. The tuple `(building_code, code)` is unique */
export interface Floor {
	/** The floor code. Together with the  is unique */
	code: Code;
	/** Floor code `F`, `E`, ... */
	building_code: Code;
}

/** Room-specific waypoint */
export interface Room {
	id: RoomID;
	number: string;
	floor_address: FloorAddress;
	position: Position;
	status: RoomStatus;
	note?: string;
}

/** A landmark can be of a certain type */
export enum LandmarkType {
	Printer = 'printer',
	VendingMachine = 'vending-machine',
	Restroom = 'restroom',
	Shower = 'shower',
	CoffeeMachine = 'coffee-machine',
	Studyplaces = 'studyplaces',
	LegiValidation = 'legi-validation',
}
/** The different landmarks we have and their corresponding icons */
export const icon = (l: LandmarkType) => {
	switch (l) {
		case LandmarkType.Printer:
			return 'fa-print';
		case LandmarkType.Restroom:
			return 'fa-restroom';
		case LandmarkType.VendingMachine:
			return 'fa-cookie-bite';
		case LandmarkType.CoffeeMachine:
			return 'fa-mug-hot';
		case LandmarkType.LegiValidation:
			return 'fa-id-card';
		case LandmarkType.Studyplaces:
			return 'fa-book-reader';
		case LandmarkType.Shower:
			return 'fa-shower';
		default:
			return 'fa-question';
	}
};
/** Status */
export type RoomStatus = 'free' | 'occupied';
/** Status */
export type LandmarkStatus = 'in-service' | 'out-of-order';

/** A landmark is a destination.
 * E.g. a vending machine, a printer, a room, ...
 */
export interface Landmark {
	id: LandmarkID;
	type: LandmarkType;
	floor_address: FloorAddress;
	position: Position;
	status: LandmarkStatus;
	note?: string;
}
/** Waypoint for the graph */
export interface Waypoint {
	id: number;
	position: Position;
}

/** A Waypoint can connect W-W, W-Room, W-Landmark. They are stored in different arrays though */
export interface Edge {
	/** ID of a waypoint */
	w: number;
	/** Can be something else, according to `type` */
	o: number;
	type: EdgeType;
}

/** The type connected by an edge */
export enum EdgeType {
	W = 0,
	R = 1,
	L = 2,
}
