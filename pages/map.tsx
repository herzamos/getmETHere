import MapView, { IconClickCallback } from '../components/MapView';
import styles from '../styles/Map.module.scss';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
	Code,
	FloorID,
	RoomID,
	LandmarkType,
	RoomAddress,
	Landmark,
	Room,
	Position,
	RoomStatus,
	LandmarkStatus,
} from '../building';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ClosestReq, ClosestRes } from './api/closest';
import { FloorReq, FloorRes } from './api/floor';
import { Logo } from '../components/Logo';
// X icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';

import { ReportForm } from '../components/ReportForm';

type Props = {};

/** Query parameters supported */
export type QueryParams =
	| {
			from: RoomAddress;
			type: LandmarkType;
	  }
	| undefined;

function isQueryParams(obj: any): obj is QueryParams {
	return obj && typeof obj.from === 'string' && typeof obj.type === 'string';
}

/**
 * Draw the background pdf and store the size and scale. Then the landmarks are drawn on
 * the pdf based on the position etc
 * */
const Map = () => {
	const router = useRouter();

	const [building_code, floor_code, room_number]: string[] =
		typeof router.query.from === 'string'
			? router.query.from.split(' ')
			: ['', '', ''];
	const type =
		typeof router.query.type === 'string'
			? (router.query.type as LandmarkType)
			: LandmarkType.Restroom;

	const [landmarks, setLandmarks] = useState<Landmark[]>([]);
	const [rooms, setRooms] = useState<Room[]>([]);
	const [origin, setOrigin] = useState<Position>({ x: 0, y: 0 });
	const [floorUrl, setFloorUrl] = useState<string>('');
	const [mapWidth, setMapWidth] = useState<number>(0);
	const [info, setInfo] = useState<{
		title: string;
		status: RoomStatus | LandmarkStatus;
		note: string;
	}>({ title: '', status: 'in-service', note: '' });
	const [closedInfo, setClosedInfo] = useState<boolean>(true);
	const [reportOpened, setReport] = useState<boolean>(false);

	// Room in where I am
	const roomId = rooms.find((r) => r.number === room_number)?.id;

	let [closestId, setClosestId] = useState(0);
	/**
	 * Renders the details/description of the landmark/location I clicked on
	 */
	const onClick: IconClickCallback = (id, type) => {
		console.log('CLICC');
		setClosedInfo(false);

		const result = (() =>
			type == 'room'
				? rooms.find((r) => r.id == id)
				: landmarks.find((l) => l.id == id))()!; // FIXME: bad

		if ('number' in result) {
			const room = rooms.find((r) => r.id == id);
			setInfo({
				title: `Room ${building_code} ${floor_code} ${result.number}`,
				status: `${room?.status || 'free'}`,
				note: room?.note || '',
			});
		} else {
			const landmark = landmarks.find((r) => r.id == id);

			setInfo({
				title: `${((str) => {
					return str.charAt(0).toUpperCase() + str.slice(1);
				})(result.type)} ${result.id} at ${result.floor_address}`,
				status: landmark?.status || 'in-service', //TODO: DD
				note: landmark?.note || '',
			});
		}
	};

	const isAvailable = (status: LandmarkStatus | RoomStatus) => {
		return status == 'in-service' || status == 'free';
	};

	const getClosest = () => {
		if (building_code && floor_code) {
			const req: ClosestReq = {
				room_address: `${building_code} ${floor_code} ${room_number}`,
				type: type,
			};
			return axios.post<ClosestRes>('/api/closest', req).then((r) => {
				if ('error' in r.data) {
				} else {
					setClosestId(r.data.id);
				}
			});
		}
	};

	const getFloor = () => {
		if (building_code && floor_code) {
			const req: FloorReq = {
				floor_address: `${building_code} ${floor_code}`,
			};

			axios.post<FloorRes>('/api/floor', req).then(({ data }) => {
				console.log('POST DONE', data);
				if ('error' in data) {
				} else {
					setOrigin(data.origin);
					setFloorUrl(data.floor_url);
					setLandmarks(data.landmarks);
					setRooms(data.rooms);
					setMapWidth(data.width);
				}
			});
		}
	};

	useEffect(() => {
		if (!floorUrl) {
			getFloor();
			getClosest();
		}
	});

	if (!isQueryParams(router.query)) {
		return <div></div>;
	}

	const qp: QueryParams = router.query;

	return (
		<>
			{reportOpened ? (
				<ReportForm setReport={setReport} info={info}></ReportForm>
			) : (
				<></>
			)}
			<div className={styles.container}>
				<header className={styles.header}>
					<div className={styles.backButtonContainer}>
						<Link href="/">
							<a className={`${styles.button} ${styles.backButton}`}>Back</a>
						</Link>
					</div>
					<div className={styles.LogoContainer}>
						<Logo></Logo>
					</div>
				</header>
				<MapView
					mapWidth={mapWidth}
					origin={origin}
					floorUrl={floorUrl}
					rooms={filter_room(rooms, room_number)}
					landmarks={landmarks}
					className={styles.mapView}
					onClick={onClick}
					landmarkStyle={(id, type, scale) => {
						if (id == closestId) {
							return {
								textShadow: '2px 2px #333333',
								fontSize: 3 * scale,
								color: '#FFD369',
								WebkitTextStrokeWidth: `${scale * 0.1}px`,
							};
						} else {
							return {
								textShadow: '2px 2px #333333',
								fontSize: 2 * scale,
								color: '#bfbfbf',
								WebkitTextStrokeWidth: `${scale * 0.05}px`,
							};
						}
					}}
					roomStyle={(id, scale) =>
						id == roomId
							? {
									fontSize: 3 * scale,
									color: '#ff3333',
									textShadow: '2px 2px #333333',
							  }
							: {
									fontSize: 2 * scale,
									color: '#ff3333',
									textShadow: '2px 2px #333333',
							  }
					}
				></MapView>
				{!closedInfo ? (
					<section className={styles.info}>
						<h2 className={styles.infoTitle}>
							{info.title}
							<br></br>
							<span
								className={
									isAvailable(info.status)
										? styles.AvailableDot
										: styles.UnavailableDot
								}
							></span>
							<div
								className={
									isAvailable(info.status) ? styles.OkMessage : styles.NoMessage
								}
							>
								{info.status.replaceAll('-', ' ')}
							</div>
						</h2>

						<div
							className={`${styles.closeInfo} ${styles.closeButton}`}
							onClick={() => {
								setClosedInfo(true);
							}}
						>
							<FontAwesomeIcon
								icon={faWindowClose}
								className={styles.closeIcon}
							/>
						</div>

						<p className={styles.Description}>{info.note}</p>
						<div className={styles.Report}>
							<div
								onClick={() => {
									setReport(true);
								}}
								className={styles.button}
							>
								Report
							</div>
						</div>
					</section>
				) : (
					<></>
				)}
			</div>
		</>
	);
};
/**
 * Filters out such that we only get the room we are starting at
 */
const filter_room = (rooms: Room[], room_number: string) => {
	const tmp = rooms.find((item) => item.number === room_number);
	return tmp ? [tmp] : [];
};

export default Map;
