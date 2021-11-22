import styles from '../styles/MapView.module.scss';
import {
	CSSProperties,
	MouseEvent as ReactMouseEvent,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	icon,
	Landmark,
	LandmarkID,
	LandmarkType,
	Position,
	Room,
	RoomID,
} from '../building';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

export type IconClickCallback = (
	id: number,
	type: LandmarkType | 'room'
) => void;

export type MapClickCallback = (x: number, y: number) => void;

type Props = {
	className?: string;
	landmarks: Landmark[];
	origin: Position;
	rooms: Room[];
	floorUrl: string;
	mapWidth: number;
	onClick?: IconClickCallback;
	/** Clicked when the map inself is clicked. The coordinates in meters relative to the origin are passed */
	onClickMap?: MapClickCallback;
	landmarkStyle: (
		id: number,
		type: LandmarkType,
		scale: number
	) => CSSProperties;
	roomStyle: (id: number, scale: number) => CSSProperties;
};
/** Gives canvas dimensions */
type CanvasDim = { height: number; width: number; x: number; y: number };

const MapView = (props: Props) => {
	const {
		landmarks,
		rooms,
		origin,
		floorUrl,
		mapWidth,
		onClick,
		landmarkStyle,
		roomStyle,
	} = props;
	
	const imageRef = useRef<HTMLImageElement>(null);

	const [canvasDim, setCanvasDim] = useState<CanvasDim>({
		height: 0,
		width: 0,
		x: 0,
		y: 0,
	});

	// scale in px/m
	const scale = canvasDim.width / mapWidth;

	useEffect(() => {
		console.log(imageRef.current);

		imageRef.current
			? setCanvasDim({
					width: imageRef.current.clientWidth,
					height: imageRef.current.offsetHeight,
					x: imageRef.current.offsetLeft,
					y: imageRef.current.offsetTop,
			  })
			: null;
	}, []);

	const showInfo = (pos: Position) => {};

	const handleMouseDown = (
		e: ReactMouseEvent<HTMLImageElement, MouseEvent>
	) => {
		const rect = e.currentTarget.getBoundingClientRect();
		// computed m/px
		const scale = mapWidth / rect.width;

		const x = (e.clientX - rect.left) * scale - origin.x;
		const y = (e.clientY - rect.top) * scale - origin.y;

		props.onClickMap?.(x, y);
	};
	/** Draws all landmarks on map */
	const landmarkDraw = useMemo(
		() =>
			drawLandmarks(
				canvasDim,
				origin,
				scale,
				2,
				landmarks,
				landmarkStyle,
				onClick
			),
		[origin, canvasDim, landmarks, onClick, landmarkStyle]
	);
	/** Draws your current room on map */
	const roomDraw = useMemo(
		() => drawRooms(canvasDim, origin, scale, 2, rooms, roomStyle, onClick),
		[origin, canvasDim, rooms, onClick, roomStyle]
	);

	return (
		<>
			<div
				className={`${styles.mapContainer} ${
					props.className ? props.className : ''
				}`}
			>
				<TransformWrapper
					minScale={0.1}
					centerOnInit={false}
					initialPositionX={0}
					initialPositionY={0}
					limitToBounds={false}
				>
					{(p) => (
						<TransformComponent wrapperClass={styles.map}>
							<img
								src={floorUrl}
								ref={imageRef}
								style={{ width: '100vw' }}
								className={styles.img}
								onMouseDown={(e) => handleMouseDown(e)}
							/>
							<section className={styles.locationsContainer}>
								{landmarkDraw}
								{roomDraw}
							</section>
						</TransformComponent>
					)}
				</TransformWrapper>
			</div>
		</>
	);
};
/** 
 * Function to draw the rooms, takes the position, the number and your room and
 * positions it correctly with right styling
 */
const drawRooms = (
	dim: CanvasDim,
	origin: Position,
	scale: number,
	zoom: number,
	rooms: Room[],
	style: (id: number, scale: number) => CSSProperties,
	onClick?: IconClickCallback
) => {
	// Need the scale and zoom in order to compute dis
	const allStyle = function (): CSSProperties {
		return {
			textShadow: '#000000AA 1px 1px',
			fontSize: zoom * scale,
			WebkitTextStrokeColor: '#000000',
			WebkitTextStrokeWidth: `${scale * 0.1}px`,
		};
	};

	return rooms.map((r) => (
		<div
			key={r.id}
			style={{
				position: 'absolute',
				left: `${dim.x + scale * (origin.x + r.position.x)}px`,
				top: `${dim.y + scale * (origin.y + r.position.y)}px`,
			}}
		>
			<p
				style={{ ...allStyle(), ...style(r.id, scale) }}
				className={styles.roomIcon}
				onClick={() => onClick?.(r.id, 'room')}
			>
				<i className="fas fa-map-marker-alt"></i>
			</p>
		</div>
	));
};
/** 
 * Function to draw the landmarks, takes the position, the number and all landmarks and
 * positions it correctly with right styling. Makes the closest selected landmark stand out
 */
const drawLandmarks = (
	dim: CanvasDim,
	origin: Position,
	scale: number,
	zoom: number,
	land: Landmark[],
	style: (id: number, type: LandmarkType, scale: number) => CSSProperties,
	onClick?: IconClickCallback
) => {
	// Need the scale and zoom in order to compute dis
	const allStyle = function (): CSSProperties {
		return {
			textShadow: '#000000AA 1px 1px',
			fontSize: zoom * scale,
			WebkitTextStrokeColor: '#000000',
			WebkitTextStrokeWidth: `${scale * 0.1}px`,
		};
	};

	return land.map((l) => (
		<div
			key={l.id}
			style={{
				position: 'absolute',
				left: `${dim.x + scale * (origin.x + l.position.x)}px`,
				top: `${dim.y + scale * (origin.y + l.position.y)}px`,
			}}
		>
			<p
				style={{ ...allStyle(), ...style(l.id, l.type, scale) }}
				className={styles.landmarkIcon}
				onClick={() => onClick?.(l.id, l.type)}
			>
				<i className={`fas ${icon(l.type)}`}></i>
			</p>
		</div>
	));
};

const drawIcon = (
	ctx: CanvasRenderingContext2D,
	scale: number,
	dim: number,
	icon: string,
	color: string,
	x: number,
	y: number
) => {
	ctx.font = `600 ${scale * dim}px "Font Awesome 5 Free"`;
	ctx.fillStyle = color;
	ctx.fillText(icon, scale * x, scale * y);
};

export default MapView;
