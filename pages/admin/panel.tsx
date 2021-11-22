import {
	faCrosshairs,
	faEraser,
	faMapMarker,
	faMarker,
	faPrint,
	faQuestionCircle,
	faMonument,
	faEye,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
	Building,
	Code,
	Floor,
	FloorAddress,
	Landmark,
	LandmarkID,
	LandmarkType,
	Position,
	Room,
} from '../../building';
import MapView, {
	IconClickCallback,
	MapClickCallback,
} from '../../components/MapView';
import styles from '../../styles/Panel.module.scss';
import { NewLandmarkReq, NewLandmarkRes } from '../api/admin/new_landmark';
import { NewRoomReq, NewRoomRes } from '../api/admin/new_room';
import { RmLandmarkReq } from '../api/admin/rm_landmark';
import { RmRoomReq } from '../api/admin/rm_room';
import { SetOriginReq } from '../api/admin/set_origin';
import { Resp as BuildingListResp } from '../api/building_list';
import { FloorReq, FloorRes } from '../api/floor';

type Action = 'add-landmark' | 'add-room' | 'delete' | 'none' | 'set-origin';

type Dio = {
	setLandmarkType: Dispatch<SetStateAction<LandmarkType>>;
	landmarkType: LandmarkType;
	setNote: Dispatch<SetStateAction<string>>;
	note: string;
};
/**
 * Admin panel to manage the current state of the database.
 * USAGE:
 * Add entry on BUILDING, FLOOR, LOCATION
 * Edit entry on BUILDING, FLOOR, LOCATION
 * Remove entry on BUILDING, FLOOR, LOCATION
 */
const AddLandmarkToolProps = (props: Dio) => (
	<div>
		<select
			value={props.landmarkType}
			onChange={(e) => props.setLandmarkType(e.target.value as LandmarkType)}
		>
			<option value={LandmarkType.CoffeeMachine}>Coffee Machine</option>
			<option value={LandmarkType.Printer}>Printer</option>
			<option value={LandmarkType.Restroom}>Restroom</option>
			<option value={LandmarkType.Shower}>Shower</option>
			<option value={LandmarkType.Studyplaces}>Studyplaces</option>
			<option value={LandmarkType.LegiValidation}>Legi Validation</option>
		</select>
		<input
			value={props.note}
			onChange={(e) => props.setNote(e.target.value)}
			type="text"
		></input>
	</div>
);

type Cane = {
	/** Set room number in the tool */
	setRoomNumber: Dispatch<SetStateAction<string>>;
	roomNumber: string;
	setNote: Dispatch<SetStateAction<string>>;
	note: string;
};

const AddRoomToolProps = (props: Cane) => (
	<div>
		<input
			value={props.roomNumber}
			placeholder="Room Number, e.g. 10.1"
			onChange={(e) => props.setRoomNumber(e.target.value)}
			type="text"
		></input>
		<input
			value={props.note}
			onChange={(e) => props.setNote(e.target.value)}
			type="text"
		></input>
	</div>
);

const DeleteToolProps = () => <div></div>;

const ViewToolProps = () => <div></div>;

type BuildingSelectorProps = {
	choice?: string;
	setChoice: (choice: string) => void;
	buildings: Building[];
};

const BuildingSelector = (props: BuildingSelectorProps) => (
	<select
		value={props.choice}
		className={styles.dropdown}
		placeholder={'Choose Building'}
		onChange={(e) => props.setChoice(e.target.value)}
	>
		<option value={''} selected disabled>
			Choose a Building
		</option>
		{props.buildings.map((b) => (
			<option key={b.code} value={b.code}>
				{b.code}
			</option>
		))}
	</select>
);

type FloorSelectorProps = {
	choice?: string;
	setChoice: (choice: string) => void;
	floors: Floor[];
};

const FloorSelector = (props: FloorSelectorProps) => (
	<select
		value={props.choice}
		className={styles.dropdown}
		placeholder={'Choose Floor'}
		onChange={(e) => props.setChoice(e.target.value)}
	>
		<option value={''} selected disabled>
			Choose a Floor
		</option>
		{props.floors.map((f) => (
			<option key={f.code} value={f.code}>
				{f.code}
			</option>
		))}
	</select>
);

const Panel = () => {
	const [buildings, setBuildings] = useState<Building[]>([]);
	const [rooms, setRooms] = useState<Room[]>([]);
	const [landmarks, setLandmarks] = useState<Landmark[]>([]);

	// Tool properties
	const [landmarkType, setLandmarkType] = useState(LandmarkType.Printer);
	const [roomNumber, setRoomNumber] = useState('');
	const [note, setNote] = useState('');
	const [focus, setFocus] = useState<
		{ room_id: number } | { landmark_id: number } | undefined
	>(undefined);

	// ---------------

	const [choice, setChoice] = useState<{ building: Code; floor: Code }>({
		building: '',
		floor: '',
	});

	const floor_address = `${choice.building} ${choice.floor}`;

	const [origin, setOrigin] = useState<Position>({ x: 0, y: 0 });
	const [mapWidth, setMapWidth] = useState(0);
	const [floorUrl, setFloorUrl] = useState('');

	const [action, setActionE] = useState<Action>('none');

	const setAction: Dispatch<SetStateAction<Action>> = (act) => {
		console.log(`setting action ${act}`);
		setActionE(act);
	};

	const cursor = (() => {
		switch (action) {
			case 'add-landmark':
				return styles.cursorAdd;
			case 'add-room':
				return styles.cursorAdd;
			case 'delete':
				return styles.cursorDelete;
			case 'set-origin':
				return styles.cursorSelect;
			case 'none':
				return styles.cursorNormal;
		}
	})();

	console.log(choice);

	const deleteObject: IconClickCallback = (id, type) => {
		if (type == 'room') {
			console.log('removing room', id, type);
			const req: RmRoomReq = {
				floor_address,
				id,
			};
			// execute request and remove landmark if succeeds
			axios
				.post('/api/admin/rm_room', req)
				.then((_) => setRooms([...rooms.filter((r) => r.id != id)]))
				.catch((e) => alert(`Backend error: ${e}`));
		} else {
			console.log('removing landmark', id, type);
			const req: RmLandmarkReq = {
				floor_address: `${choice.building} ${choice.floor}`,
				id,
			};
			// execute request and remove landmark if succeeds
			axios
				.post('/api/admin/rm_landmark', req)
				.then((_) => setLandmarks([...landmarks.filter((l) => l.id != id)]))
				.catch((e) => alert(`Backend error: ${e}`));
		}
	};

	const floors =
		buildings.find((b) => b.code === choice.building)?.floors || [];

	// Ask what the app should add
	const handleMapClick: MapClickCallback = (x, y) => {
		setFocus(undefined); // reset focus

		console.log('AFFSAFF');
		switch (action) {
			case 'add-landmark':
				console.log('Add landmark click');
				addLandmark(
					x,
					y,
					landmarkType,
					floor_address,
					note,
					landmarks,
					setLandmarks
				);
				break;
			case 'add-room':
				console.log('Add room click');
				addRoom(x, y, roomNumber, floor_address, note, rooms, setRooms);
				break;
			case 'set-origin':
				console.log('setting origin');
				const xAbsolute = origin.x + x;
				const yAbsolute = origin.y + y;
				replaceOrigin(xAbsolute, yAbsolute, floor_address, setOrigin);
				break;
			default:
				console.log('Uneventful click');
		}
	};

	const focused = (() => {
		if (!focus) return;
		if ('landmark_id' in focus) {
			const land = landmarks.find((l) => l.id == focus.landmark_id)!;
			return (
				<div className={styles.focus}>
					<p className={styles.focusName}>
						{land.type.toUpperCase()} {land.id}
					</p>
					<p className={styles.focusStatus}>Status: {land.status}</p>
					<p className={styles.focusNote}>Notes: {land.note}</p>
				</div>
			);
		} else {
			const room = rooms.find((r) => r.id == focus.room_id)!;
			return (
				<div className={styles.focus}>
					<p className={styles.focusName}>Room {room.number}</p>
					<p className={styles.focusStatus}>Status: {room.status}</p>
					<p className={styles.focusNote}>Notes: {room.note}</p>
				</div>
			);
		}
	})();

	const clickHandler: IconClickCallback = (id, type) => {
		setFocus(undefined); // reset focus when clicking stuff
		if (action == 'delete') {
			deleteObject(id, type);
		} else if (action == 'none') {
			if (type == 'room') setFocus({ room_id: id });
			else setFocus({ landmark_id: id });
		} else {
			console.log(`action ${action} selected`);
		}
	};

	/**
	 * Adding tool props for adding landmark and room
	 */
	const toolprops = (() => {
		switch (action) {
			case 'add-landmark':
				return (
					<AddLandmarkToolProps
						setLandmarkType={setLandmarkType}
						landmarkType={landmarkType}
						note={note}
						setNote={setNote}
					/>
				);
			case 'add-room':
				return (
					<AddRoomToolProps
						roomNumber={roomNumber}
						setRoomNumber={setRoomNumber}
						note={note}
						setNote={setNote}
					/>
				);
			default:
				return <div></div>;
		}
	})();

	useEffect(() => {
		if (buildings.length == 0)
			axios
				.post<BuildingListResp>('/api/building_list')
				.then((r) => setBuildings(r.data.building_list));
	});

	// Load floor plan and stuff
	useEffect(() => {
		console.log('refresh');
		if (choice.building && choice.floor) {
			console.log('very refresh');
			const req: FloorReq = {
				floor_address: `${choice.building} ${choice.floor}`,
			};
			axios.post<FloorRes>('/api/floor', req).then((r) => {
				const d = r.data;
				if ('error' in d) {
					alert(`Unknown error:\n${d.error}`);
					console.error('API returned an error');
				} else {
					setFloorUrl(d.floor_url);
					setOrigin(d.origin);
					setMapWidth(d.width); // Do not change order! Set rooms and landmarks after
					setLandmarks(d.landmarks);
					setRooms(d.rooms);

					console.log('DIOCA', d);
				}
			});
		} else if (choice.building) {
			setFloorUrl('');
			setOrigin({ x: 0, y: 0 });
			setMapWidth(1);
			setLandmarks([]);
			setRooms([]);
		}
	}, [choice.building, choice.floor]);

	return (
		<div className={styles.mainContainer}>
			{floorUrl ? (
				<MapView
					floorUrl={floorUrl}
					landmarks={landmarks}
					rooms={rooms}
					mapWidth={mapWidth}
					origin={origin}
					className={`${styles.mapView} ${cursor}`}
					onClick={clickHandler}
					onClickMap={handleMapClick}
					landmarkStyle={(id, type, scale) => ({
						fontSize: `${scale * 1.5}px`,
						color: '#FFD369',
						textShadow: '1px 1px #333333',
					})}
					roomStyle={(id, scale) => ({
						fontSize: `${scale * 1.5}px`,
						color: '#FFD369',
						textShadow: '1px 1px #333333',
					})}
				/>
			) : (
				<div className={styles.noBuildingFloor}>
					<p>
						<FontAwesomeIcon
							icon={faQuestionCircle}
							className={styles.questionIcon}
						/>{' '}
						Please choose a building and a floor
					</p>
				</div>
			)}

			<aside className={styles.toolbar}>
				<section className={styles.buildingTool}>
					Building:
					<BuildingSelector
						choice={choice.building}
						setChoice={(b) => setChoice({ building: b, floor: '' })}
						buildings={buildings}
					/>
					<button className={styles.addButton}>Add Building</button>
				</section>
				<section className={styles.floorTool}>
					Floor:
					<FloorSelector
						floors={floors}
						setChoice={(f) => setChoice({ ...choice, floor: f })}
						choice={choice.floor}
					/>
					<button className={styles.addButton}>Add Floor</button>
				</section>
				<section className={styles.contentTool}>
					<div className={styles.addDelContainer}>
						<button
							onClick={() => setAction('add-landmark')}
							className={`${styles.tool} ${
								action === 'add-landmark' ? styles.selected : ''
							}`}
						>
							<FontAwesomeIcon icon={faMonument} className={styles.icon} />
							Add Landmark
						</button>
						<button
							onClick={() => setAction('add-room')}
							className={`${styles.tool} ${
								action === 'add-room' ? styles.selected : ''
							}`}
						>
							<FontAwesomeIcon icon={faMapMarker} className={styles.icon} />
							Add Room
						</button>
						<button
							onClick={() => setAction('delete')}
							className={`${styles.tool} ${
								action === 'delete' ? styles.selected : ''
							}`}
						>
							<FontAwesomeIcon icon={faEraser} className={styles.icon} />
							Delete
						</button>
						<button
							onClick={() => setAction('none')}
							className={`${styles.tool} ${
								action === 'none' ? styles.selected : ''
							}`}
						>
							<FontAwesomeIcon icon={faEye} className={styles.icon} />
							View
						</button>
						<button
							onClick={() => setAction('set-origin')}
							className={`${styles.tool} ${
								action === 'set-origin' ? styles.selected : ''
							}`}
						>
							<FontAwesomeIcon icon={faCrosshairs} className={styles.icon} />
							Set Origin
						</button>
					</div>
					<div className={`${styles.toolPropsContainer}`}>{toolprops}</div>
					{focused}
				</section>
			</aside>
		</div>
	);
};
/**
 * Adds a landmark at the specified location with the specified type
 */
function addLandmark(
	x: number,
	y: number,
	type: LandmarkType,
	floor_address: FloorAddress,
	note: string,
	landmarks: Landmark[],
	setLandmarks: Dispatch<SetStateAction<Landmark[]>>
) {
	const req: NewLandmarkReq = {
		floor_address,
		landmark_type: type,
		position: { x, y },
		note,
	};

	axios
		.post<NewLandmarkRes>('/api/admin/new_landmark', req)
		.then(({ data }) =>
			!('error' in data)
				? setLandmarks([...landmarks, data.landmark])
				: alert(`Soft error: ${data.error}`)
		)
		.catch((e) => alert(`Error adding landmark: ${e}`));
}
/**
 * Adds a room to the map at the specified location
 * */
function addRoom(
	x: number,
	y: number,
	room_number: string,
	floor_address: FloorAddress,
	note: string,
	rooms: Room[],
	setRooms: Dispatch<SetStateAction<Room[]>>
) {
	const req: NewRoomReq = {
		floor_address,
		number: room_number,
		position: { x, y },
		note,
	};

	axios
		.post<NewRoomRes>('/api/admin/new_room', req)
		.then(({ data }) =>
			!('error' in data)
				? setRooms([...rooms, data.room])
				: alert(`Soft error: ${data.error}`)
		)
		.catch((e) => alert(`Error adding landmark: ${e}`));
}
/**
 * Replace the origin for the current map
 * CARE: can mess things up
 */
function replaceOrigin(
	x: number,
	y: number,
	floor_address: FloorAddress,
	setOrigin: Dispatch<SetStateAction<Position>>
) {
	const req: SetOriginReq = {
		floor_address,
		position: { x, y },
	};

	axios
		.post('/api/admin/set_origin', req)
		.then(({ data }) => setOrigin({ x, y }))
		.catch((e) => alert(`Error setting origin: ${e}`));
}

export default Panel;
