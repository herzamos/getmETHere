import React, { Dispatch, SetStateAction } from 'react';
import { Building, LandmarkType } from '../building';
import { Dropdown, Option } from './Dropdown';
import { NextRouter, useRouter } from 'next/router';
import styles from '../styles/placeform.module.scss';

import buttonStyles from '../styles/button.module.scss';

// Font awesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export interface PlaceFormProps {
	buildingOpts: Option<string>[];
	buildingSelected: string;
	setBuilding: Dispatch<SetStateAction<string>>;
	setFloor: Dispatch<SetStateAction<string>>;
	floorOpts:
		| {
				value: string;
				name: string;
		  }[]
		| undefined;
	floorSelected: string;
	setRoom: Dispatch<SetStateAction<string>>;
	roomSelected: string;
	selectedLandmarkType: LandmarkType | undefined;
	setSelectedLandmarkType: Dispatch<SetStateAction<LandmarkType | undefined>>;
	valid: boolean;
}

export function PlaceForm<T>(props: PlaceFormProps) {
	const { selectedLandmarkType, setSelectedLandmarkType } = props;

	const router = useRouter();
	/** Manages the Form and deploys it */
	return (
		<>
			{/* <h2>Where are you?</h2> */}
			<Dropdown
				name="Building"
				options={props.buildingOpts}
				id="building"
				toSet={props.setBuilding}
				value={props.buildingSelected.toUpperCase()}
				maxLength={4}
			></Dropdown>
			{props.buildingSelected != '' ? (
				<Dropdown
					name="Floor"
					options={props.floorOpts || []}
					id="floor"
					toSet={props.setFloor}
					value={props.floorSelected.toUpperCase()}
					maxLength={1}
				></Dropdown>
			) : (
				''
			)}
			{props.floorSelected != '' && props.buildingSelected != '' ? (
				<Dropdown
					name="Room"
					options={[]}
					id="room"
					toSet={props.setRoom}
					value={props.roomSelected}
					maxLength={8}
				></Dropdown>
			) : (
				''
			)}
			{props.roomSelected != '' && selectedLandmarkType ? (
				props.valid ? (
					<div className={buttonStyles.GetMeThereContainer}>
						<button
							className={buttonStyles.GetMeThereButton}
							onClick={() =>
								getMeThere(
									router,
									props.buildingSelected,
									props.floorSelected,
									props.roomSelected,
									selectedLandmarkType
								)
							}
						>
							Get me there!
						</button>
					</div>
				) : (
					<div>
						<div className={styles.ErrorMessage}>
							<FontAwesomeIcon icon={faExclamationTriangle} /> The room does not
							exist
						</div>
					</div>
				)
			) : (
				''
			)}{' '}
			{/* TODO: redirect to map */}
		</>
	);
}
function getMeThere(
	router: NextRouter,
	building: string,
	floor: string,
	room: string,
	landmark: LandmarkType
) {
	router.push(
		`./map?from=${building.toUpperCase()}%20${floor.toUpperCase()}%20${room}&type=${landmark}`
	);
}
