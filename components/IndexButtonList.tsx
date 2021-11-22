// Font awesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faBookReader,
	faShower,
	faPrint,
	faCoffee,
	faRestroom,
	faCookieBite,
	faIdCard,
	faChalkboardTeacher,
} from '@fortawesome/free-solid-svg-icons';

// Yes
import axios from 'axios';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
// Button component
import { Button } from '../components/Button';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { PlaceForm, PlaceFormProps } from './PlaceForm';
import { getBuildings, Option } from './Dropdown';
import { Building, Floor, LandmarkType } from '../building';
import { ExistsRes } from '../pages/api/exists';

export interface Landmark {
	name: string;
	icon: IconProp;
}
/** Defines our available landmarks */
export const landmarks = [
	{ name: 'bathroom', icon: faRestroom, value: LandmarkType.Restroom },
	{ name: 'shower', icon: faShower, value: LandmarkType.Shower },
	{ name: 'printer', icon: faPrint, value: LandmarkType.Printer },
	{
		name: 'validation terminal',
		icon: faIdCard,
		value: LandmarkType.LegiValidation,
	},
	{
		name: 'vending machine',
		icon: faCookieBite,
		value: LandmarkType.VendingMachine,
	},
	{ name: 'coffee machine', icon: faCoffee, value: LandmarkType.CoffeeMachine },
	{ name: 'studyplaces', icon: faBookReader, value: LandmarkType.Studyplaces },
];

export function IndexButtonList(props: {}) {
	const [selectedLandmarkType, setSelectedLandmarkType] = useState<
		LandmarkType | undefined
	>();
	const [buildingSelected, setBuildingH] = useState('');
	const [floorSelected, setFloorH] = useState('');
	const [roomSelected, setRoom] = useState('');

	// unset others if changing a bigger one
	const setBuilding: Dispatch<SetStateAction<string>> = (b) => {
		setBuildingH(b);
		setFloorH('');
		setRoomExistance(false);
	};

	const setFloor: Dispatch<SetStateAction<string>> = (f) => {
		setFloorH(f);
		setRoom('');
		setRoomExistance(false);
	};

	const [buildingList, setBuildingList] = useState<Building[]>([]);

	// Check if room actually exists
	const [roomExists, setRoomExistance] = useState<boolean>(false);

	useEffect(() => {
		/** If all of them are selected (not empty), make query to see if our starting room exists */
		if (roomSelected && floorSelected && buildingSelected) {
			axios
				.post<ExistsRes>('/api/exists', {
					room_address: `${buildingSelected} ${floorSelected} ${roomSelected}`,
				})
				.then(({ data }) => {
					if ('error' in data) {
						console.error(data.error);
					} else {
						setRoomExistance(data.exists);
					}
				});
		}
	}, [roomSelected, floorSelected, buildingSelected]);

	const buildingOpts = buildingList.map((b) => ({
		name: b.code,
		value: b.code,
	}));

	const floorOpts = buildingList
		.find((b) => b.code === buildingSelected)
		?.floors.map((f) => ({
			value: f.building_code + ' ' + f.code,
			name: f.code,
		}));

	useEffect(() => {
		if (buildingList.length == 0)
			getBuildings().then((list) => setBuildingList(list));
	});

	const placeFormProps: PlaceFormProps = {
		buildingOpts: buildingOpts,
		buildingSelected: buildingSelected,
		setBuilding: setBuilding,
		setFloor: setFloor,
		floorOpts: floorOpts,
		floorSelected: floorSelected,
		setRoom: setRoom,
		roomSelected: roomSelected,
		selectedLandmarkType: selectedLandmarkType,
		setSelectedLandmarkType: setSelectedLandmarkType,
		valid: roomExists,
	};

	return (
		<>
			{landmarks.map((l) => (
				<>
					<Button
						name={l.name}
						icon={l.icon}
						changeHandler={setSelectedLandmarkType}
						value={l.value} //TODO: possible quickfix
					></Button>
					<>
						{placeFormProps.selectedLandmarkType == l.value ? (
							<>
								<PlaceForm {...placeFormProps}></PlaceForm>
							</>
						) : (
							<></>
						)}
					</>
				</>
			))}
		</>
	);
}
